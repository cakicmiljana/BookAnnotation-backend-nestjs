import { Injectable } from '@nestjs/common';
import { notImplemented } from '../../common/utils/not-implemented';
import { HealthResponse } from '../../dtos/health/health.response';

@Injectable()
export class HealthService {
  /** Runs `SELECT 1` against the database. */
  check(): Promise<HealthResponse> {
    return notImplemented();
  }
}
