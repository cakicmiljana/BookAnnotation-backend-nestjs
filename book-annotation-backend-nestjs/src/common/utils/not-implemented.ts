import { NotImplementedException } from '@nestjs/common';

/**
 * Temporary body for a controller action whose service method is not built yet.
 * Responds with 501. Takes the action's inputs so they stay referenced until
 * the real service call replaces it.
 */
export function notImplemented(...inputs: unknown[]): never {
  void inputs;
  throw new NotImplementedException('This endpoint is not implemented yet');
}
