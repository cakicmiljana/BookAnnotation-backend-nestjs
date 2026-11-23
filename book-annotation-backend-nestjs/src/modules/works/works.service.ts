import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkResponse } from '../../dtos/works/work.response';
import { toWorkResponse } from '../../mappers/work.mapper';
import { Work } from '../../models/work';
import { EditionsService } from '../editions/editions.service';

@Injectable()
export class WorksService {
  constructor(
    @InjectRepository(Work)
    private readonly worksRepository: Repository<Work>,
    private readonly editionsService: EditionsService,
  ) {}

  // 404 when the work does not exist, or when the user cannot see any of its
  // editions (e.g. a work that only has another user's private upload).
  async findOne(userId: number, workId: number): Promise<WorkResponse> {
    const work = await this.worksRepository.findOneBy({ id: workId });
    if (!work) {
      throw new NotFoundException(`Work ${workId} was not found`);
    }

    const editionCount = await this.editionsService.countAccessibleByWork(
      userId,
      workId,
    );
    if (editionCount === 0) {
      throw new NotFoundException(`Work ${workId} was not found`);
    }

    return toWorkResponse(work, editionCount);
  }
}
