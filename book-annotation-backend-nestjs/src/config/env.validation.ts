import { plainToInstance } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 3000;

  /** The frontend's origin, e.g. http://localhost:4200 */
  @IsUrl({ require_tld: false, require_protocol: true })
  CORS_ORIGIN: string;

  /** Signs login tokens; long and random, never committed. */
  @IsString()
  @MinLength(32)
  JWT_SECRET: string;

  /** Token lifetime: a number of seconds, or a number with a unit (30m, 12h, 1d, ...) */
  @IsOptional()
  @Matches(/^\d+(ms|s|m|h|d|w|y)?$/, {
    message: 'JWT_EXPIRES_IN must look like 3600, 30m, 12h or 1d',
  })
  JWT_EXPIRES_IN: string = '1d';

  @IsString()
  @IsNotEmpty()
  DATABASE_HOST: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  DATABASE_PORT: number;

  @IsString()
  @IsNotEmpty()
  DATABASE_USER: string;

  @IsString()
  DATABASE_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_NAME: string;

  /** Password for the seeded user; read only by `npm run seed`. */
  @IsOptional()
  @IsString()
  @Length(8, 72)
  SEED_USER_PASSWORD?: string;
}

/** Runs once at startup; the app refuses to start with an invalid environment. */
export function validateEnvironment(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const environment = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(environment);
  if (errors.length > 0) {
    const problems = errors.flatMap((error) =>
      Object.values(error.constraints ?? {}),
    );
    throw new Error(
      `Invalid environment configuration:\n- ${problems.join('\n- ')}`,
    );
  }
  return environment;
}
