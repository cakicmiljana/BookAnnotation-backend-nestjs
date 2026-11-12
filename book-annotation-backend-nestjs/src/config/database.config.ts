import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvironmentVariables } from './env.validation';

export const databaseConfig = (
  config: ConfigService<EnvironmentVariables, true>,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: config.get('DATABASE_HOST', { infer: true }),
  port: config.get('DATABASE_PORT', { infer: true }),
  username: config.get('DATABASE_USER', { infer: true }),
  password: config.get('DATABASE_PASSWORD', { infer: true }),
  database: config.get('DATABASE_NAME', { infer: true }),
  autoLoadEntities: true,
  synchronize: false,
});
