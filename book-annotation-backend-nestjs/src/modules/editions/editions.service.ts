import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { escapeLikePattern } from '../../common/utils/escape-like-pattern';
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionSort } from '../../dtos/editions/edition-sort.enum';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { toEditionResponse } from '../../mappers/edition.mapper';
import { Edition } from '../../models/edition';

@Injectable()
export class EditionsService {
  constructor(
    @InjectRepository(Edition)
    private readonly editionsRepository: Repository<Edition>,
  ) {}

  async findAllAccessible(
    userId: number,
    query: EditionQueryDto,
  ): Promise<EditionResponse[]> {
    const editions = await this.findAccessibleEditions(userId, query);
    return editions.map((edition) => toEditionResponse(edition, userId));
  }

  findAccessibleEditions(
    userId: number,
    query: EditionQueryDto,
  ): Promise<Edition[]> {
    const editionsQuery = this.accessibleToUser(userId);

    if (query.q) {
      editionsQuery.andWhere(
        '(work.title ILIKE :search OR work.author ILIKE :search)',
        { search: `%${escapeLikePattern(query.q)}%` },
      );
    }
    this.applySort(editionsQuery, query.sort);

    return editionsQuery.getMany();
  }

  async findOne(userId: number, editionId: number): Promise<EditionResponse> {
    const edition = await this.findAccessibleEdition(editionId, userId);
    return toEditionResponse(edition, userId);
  }

  // The only place that returns the full text.
  async getContent(
    userId: number,
    editionId: number,
  ): Promise<EditionContentResponse> {
    const edition = await this.findAccessibleEdition(editionId, userId);
    const content = await this.loadContent(edition.id);

    return {
      editionId: edition.id,
      content,
      contentLength: edition.contentLength,
      pageSize: edition.pageSize,
    };
  }

  // The book details "Editions" tab. A work with no edition the user can see
  // gives the same 404 as a missing work.
  async findAccessibleByWork(
    userId: number,
    workId: number,
  ): Promise<EditionResponse[]> {
    const editions = await this.accessibleToUser(userId)
      .andWhere('edition.workId = :workId', { workId })
      .orderBy('edition.language', 'ASC')
      .addOrderBy('edition.id', 'ASC')
      .getMany();

    if (editions.length === 0) {
      throw new NotFoundException(`Work ${workId} was not found`);
    }
    return editions.map((edition) => toEditionResponse(edition, userId));
  }

  // Used by WorksService for the work's editionCount.
  countAccessibleByWork(userId: number, workId: number): Promise<number> {
    return this.accessibleToUser(userId)
      .andWhere('edition.workId = :workId', { workId })
      .getCount();
  }

  async findAccessibleEdition(
    editionId: number,
    userId: number,
  ): Promise<Edition> {
    const edition = await this.accessibleToUser(userId)
      .andWhere('edition.id = :editionId', { editionId })
      .getOne();

    if (!edition) {
      throw new NotFoundException(`Edition ${editionId} was not found`);
    }
    return edition;
  }

  private applySort(
    editionsQuery: SelectQueryBuilder<Edition>,
    sort: EditionSort,
  ): void {
    if (sort === EditionSort.Author) {
      editionsQuery.orderBy('work.author', 'ASC');
    } else if (sort === EditionSort.Year) {
      editionsQuery.orderBy('work.publicationYear', 'ASC', 'NULLS LAST');
    }
    editionsQuery
      .addOrderBy('work.title', 'ASC')
      .addOrderBy('edition.id', 'ASC');
  }

  // content has `select: false` on the entity, so it is loaded only on request.
  private async loadContent(editionId: number): Promise<string> {
    const edition = await this.editionsRepository.findOneOrFail({
      where: { id: editionId },
      select: { id: true, content: true },
    });
    return edition.content;
  }

  // shared catalogue (no uploader) + user's own uploads.
  private accessibleToUser(userId: number): SelectQueryBuilder<Edition> {
    return this.editionsRepository
      .createQueryBuilder('edition')
      .innerJoinAndSelect('edition.work', 'work')
      .where(
        '(edition.uploadedByUserId IS NULL OR edition.uploadedByUserId = :userId)',
        { userId },
      );
  }
}
