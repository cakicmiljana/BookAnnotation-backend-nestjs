import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { EnvironmentVariables } from './env.validation';

export const jwtConfig = (
  config: ConfigService<EnvironmentVariables, true>,
): JwtModuleOptions => ({
  secret: config.get('JWT_SECRET', { infer: true }),
  signOptions: {
    expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }),
  },
});
