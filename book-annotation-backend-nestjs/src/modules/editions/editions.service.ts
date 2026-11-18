import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { Edition } from '../../models/edition';

@Injectable()
export class EditionsService {
  constructor(
    @InjectRepository(Edition)
    private readonly editionsRepository: Repository<Edition>,
  ) {}

  findAllAccessible(
    userId: number,
    query: EditionQueryDto,
  ): Promise<EditionResponse[]> {
    return notImplemented(userId, query);
  }

  findOne(userId: number, editionId: number): Promise<EditionResponse> {
    return notImplemented(userId, editionId);
  }

  getContent(
    userId: number,
    editionId: number,
  ): Promise<EditionContentResponse> {
    return notImplemented(userId, editionId);
  }

  findAccessibleByWork(
    userId: number,
    workId: number,
  ): Promise<EditionResponse[]> {
    return notImplemented(userId, workId);
  }

  async findAccessibleEdition(
    editionId: number,
    userId: number,
  ): Promise<Edition> {
    const edition = await this.accessibleTo(userId)
      .andWhere('edition.id = :editionId', { editionId })
      .getOne();

    if (!edition) {
      throw new NotFoundException(`Edition ${editionId} was not found`);
    }
    return edition;
  }

  // shared catalogue (no uploader) + user's own uploads.
  private accessibleTo(userId: number): SelectQueryBuilder<Edition> {
    return this.editionsRepository
      .createQueryBuilder('edition')
      .innerJoinAndSelect('edition.work', 'work')
      .where(
        '(edition.uploadedByUserId IS NULL OR edition.uploadedByUserId = :userId)',
        { userId },
      );
  }
}
