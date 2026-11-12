import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { WorkResponse } from '../../dtos/works/work.response';

@Injectable()
export class WorksService {
  /** 404 unless the user can access at least one edition of the work. */
  findOne(userId: number, workId: number): Promise<WorkResponse> {
    return notImplemented(userId, workId);
  }
}
