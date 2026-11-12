import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from '../database/snake-naming.strategy';
import { EnvironmentVariables } from './env.validation';

type PostgresConnectionOptions = Extract<
  DataSourceOptions,
  { type: 'postgres' }
>;

type DatabaseEnvironment = Pick<
  EnvironmentVariables,
  | 'DATABASE_HOST'
  | 'DATABASE_PORT'
  | 'DATABASE_USER'
  | 'DATABASE_PASSWORD'
  | 'DATABASE_NAME'
>;

/** Connection options shared by the Nest app and the TypeORM CLI (migrations). */
export const baseDatabaseOptions = (
  environment: DatabaseEnvironment,
): PostgresConnectionOptions => ({
  type: 'postgres',
  host: environment.DATABASE_HOST,
  port: environment.DATABASE_PORT,
  username: environment.DATABASE_USER,
  password: environment.DATABASE_PASSWORD,
  database: environment.DATABASE_NAME,
  namingStrategy: new SnakeNamingStrategy(),
  synchronize: false,
});

export const databaseConfig = (
  config: ConfigService<EnvironmentVariables, true>,
): TypeOrmModuleOptions => ({
  ...baseDatabaseOptions({
    DATABASE_HOST: config.get('DATABASE_HOST', { infer: true }),
    DATABASE_PORT: config.get('DATABASE_PORT', { infer: true }),
    DATABASE_USER: config.get('DATABASE_USER', { infer: true }),
    DATABASE_PASSWORD: config.get('DATABASE_PASSWORD', { infer: true }),
    DATABASE_NAME: config.get('DATABASE_NAME', { infer: true }),
  }),
  autoLoadEntities: true,
});
