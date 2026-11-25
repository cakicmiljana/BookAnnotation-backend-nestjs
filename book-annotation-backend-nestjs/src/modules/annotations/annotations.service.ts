import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { escapeLikePattern } from '../../common/utils/escape-like-pattern';
import { AnnotationQueryDto } from '../../dtos/annotations/annotation-query.dto';
import { AnnotationResponse } from '../../dtos/annotations/annotation.response';
import { CreateAnnotationDto } from '../../dtos/annotations/create-annotation.dto';
import { NotebookAnnotationQueryDto } from '../../dtos/annotations/notebook-annotation-query.dto';
import { NotebookAnnotationResponse } from '../../dtos/annotations/notebook-annotation.response';
import { UpdateAnnotationDto } from '../../dtos/annotations/update-annotation.dto';
import {
  toAnnotationResponse,
  toNotebookAnnotationResponse,
} from '../../mappers/annotation.mapper';
import { Annotation } from '../../models/annotation';
import { EditionsService } from '../editions/editions.service';

const EXCERPT_MAX_LENGTH = 500;

@Injectable()
export class AnnotationsService {
  constructor(
    @InjectRepository(Annotation)
    private readonly annotationsRepository: Repository<Annotation>,
    private readonly editionsService: EditionsService,
  ) {}

  // The current user's annotations for one edition, in reading order.
  async findForEdition(
    userId: number,
    editionId: number,
    query: AnnotationQueryDto,
  ): Promise<AnnotationResponse[]> {
    await this.editionsService.findAccessibleEdition(editionId, userId);

    const where: FindOptionsWhere<Annotation> = { userId, editionId };
    if (query.tag) {
      where.tag = query.tag;
    }

    const annotations = await this.annotationsRepository.find({
      where,
      order: { startOffset: 'ASC', id: 'ASC' },
    });
    return annotations.map(toAnnotationResponse);
  }

  async create(
    userId: number,
    editionId: number,
    dto: CreateAnnotationDto,
  ): Promise<AnnotationResponse> {
    const edition = await this.editionsService.findAccessibleEdition(editionId, userId);
    this.validateOffsetsWithinText(dto.startOffset, dto.endOffset, edition.contentLength);

    const annotation = this.annotationsRepository.create({
      userId,
      editionId,
      startOffset: dto.startOffset,
      endOffset: dto.endOffset,
      color: dto.color,
      tag: dto.tag ?? null,
      comment: dto.comment ?? '',
    });
    const saved = await this.annotationsRepository.save(annotation);
    return toAnnotationResponse(saved);
  }

  // Any field can be patched. When only one offset is sent, the check uses
  // the new value together with the stored other one.
  async update(userId: number, annotationId: number,
    dto: UpdateAnnotationDto,
  ): Promise<AnnotationResponse> {
    const annotation = await this.findAnnotation(annotationId, userId);
    Object.assign(annotation, dto); // sets only the fields that are present in dto

    const edition = await this.editionsService.findAccessibleEdition(annotation.editionId, userId);
    this.validateOffsetsWithinText(annotation.startOffset, annotation.endOffset, edition.contentLength);

    const saved = await this.annotationsRepository.save(annotation);
    return toAnnotationResponse(saved);
  }

  async remove(userId: number, annotationId: number): Promise<void> {
    const annotation = await this.findAnnotation(annotationId, userId);
    
    await this.annotationsRepository.softDelete({ id: annotation.id });
  }

  // Notebook: all the user's annotations across every book.
  // `q` searches the comment and the book's title and author.
  async findForNotebook(userId: number, query: NotebookAnnotationQueryDto
  ): Promise<NotebookAnnotationResponse[]> {
    const annotationsQuery = this.annotationsRepository
      .createQueryBuilder('annotation')
      .innerJoinAndSelect('annotation.edition', 'edition')
      .innerJoinAndSelect('edition.work', 'work')
      // The excerpt is cut in SQL, so the full texts are never loaded.
      .addSelect(
        `SUBSTRING(edition.content FROM annotation.startOffset + 1 FOR LEAST(annotation.endOffset - annotation.startOffset, ${EXCERPT_MAX_LENGTH}))`,
        'excerpt',
      )
      .where('annotation.userId = :userId', { userId });

    if (query.tag) {
      annotationsQuery.andWhere('annotation.tag = :tag', { tag: query.tag });
    }
    if (query.q) {
      annotationsQuery.andWhere(
        '(annotation.comment ILIKE :search OR work.title ILIKE :search OR work.author ILIKE :search)',
        { search: `%${escapeLikePattern(query.q)}%` },
      );
    }

    annotationsQuery
      .orderBy('work.title', 'ASC')
      .addOrderBy('edition.id', 'ASC')
      .addOrderBy('annotation.startOffset', 'ASC');

    // `entities` and `raw` come back in the same order, one row per annotation.
    const { entities, raw } = await annotationsQuery.getRawAndEntities<{
      excerpt: string;
    }>();
    return entities.map((annotation, index) =>
      toNotebookAnnotationResponse(annotation, raw[index].excerpt),
    );
  }

  private validateOffsetsWithinText(startOffset: number, endOffset: number, contentLength: number): void 
  {
    if (endOffset <= startOffset) {
      throw new BadRequestException(
        'endOffset must be greater than startOffset',
      );
    }
    if (endOffset > contentLength) {
      throw new BadRequestException(
        `endOffset must not be greater than ${contentLength}`,
      );
    }
  }

  private async findAnnotation(annotationId: number, userId: number): Promise<Annotation> {
    const annotation = await this.annotationsRepository.findOneBy({
      id: annotationId,
      userId,
    });
    if (!annotation) {
      throw new NotFoundException(`Annotation ${annotationId} was not found`);
    }
    return annotation;
  }
}
