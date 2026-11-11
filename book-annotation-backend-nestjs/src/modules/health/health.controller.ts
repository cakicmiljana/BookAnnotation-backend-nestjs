import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { notImplemented } from '../../common/utils/not-implemented';
import { HealthResponse } from '../../dtos/health/health.response';

@ApiTags('health')
@Controller('health')
export class HealthController {
  @Public()
  @Get()
  check(): Promise<HealthResponse> {
    // const database = await this.isDatabaseUp() ? 'up' : 'down';  (DataSource query `SELECT 1`)
    // return { status: 'ok', database };
    return notImplemented();
  }
}
