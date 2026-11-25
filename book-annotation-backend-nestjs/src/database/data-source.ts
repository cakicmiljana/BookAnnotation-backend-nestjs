import { config as loadDotenv } from 'dotenv';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { baseDatabaseOptions } from '../config/database.config';
import { validateEnvironment } from '../config/env.validation';

loadDotenv();

/** Used only by the TypeORM CLI (`npm run migration:*`); the app connects through TypeOrmModule. */
export default new DataSource({
  ...baseDatabaseOptions(validateEnvironment(process.env)),
  entities: [join(__dirname, '..', 'models', '*.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
});
