import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { EditionContentResponse } from '../../dtos/editions/edition-content.response';
import { EditionQueryDto } from '../../dtos/editions/edition-query.dto';
import { EditionResponse } from '../../dtos/editions/edition.response';
import { Edition } from '../../models/edition';

@Injectable()
export class EditionsService {
  /** The shared catalogue plus the user's own uploads. */
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

  /**
   * The single place for the visibility rule: catalogue editions and the
   * user's own uploads. Throws 404 otherwise. Used by other services.
   */
  findAccessibleOrFail(editionId: number, userId: number): Promise<Edition> {
    return notImplemented(editionId, userId);
  }
}
