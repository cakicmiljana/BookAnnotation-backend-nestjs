import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { HealthResponse } from '../../dtos/health/health.response';

@Injectable()
export class HealthService {
  constructor(private readonly dataSource: DataSource) {}

  /** The API itself is up if it can answer; the database is checked with `SELECT 1`. */
  async check(): Promise<HealthResponse> {
    return {
      status: 'ok',
      database: (await this.isDatabaseUp()) ? 'up' : 'down',
    };
  }

  private async isDatabaseUp(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
