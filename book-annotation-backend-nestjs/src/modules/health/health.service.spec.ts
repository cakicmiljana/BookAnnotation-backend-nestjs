import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let service: HealthService;
  const dataSource = { query: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthService, { provide: DataSource, useValue: dataSource }],
    }).compile();

    service = module.get<HealthService>(HealthService);
  });

  it('reports the database as up when SELECT 1 succeeds', async () => {
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'up',
    });
    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
  });

  it('still answers, with the database down, when the query fails', async () => {
    dataSource.query.mockRejectedValue(new Error('connection refused'));

    await expect(service.check()).resolves.toEqual({
      status: 'ok',
      database: 'down',
    });
  });
});
