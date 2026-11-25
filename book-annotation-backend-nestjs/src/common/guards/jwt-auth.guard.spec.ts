import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JsonWebTokenError, TokenExpiredError } from '@nestjs/jwt';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() };
  const guard = new JwtAuthGuard(reflector as unknown as Reflector);
  const context = {
    getHandler: () => 'handler',
    getClass: () => 'class',
  } as unknown as ExecutionContext;

  describe('canActivate', () => {
    it('lets @Public() routes through without checking a token', () => {
      reflector.getAllAndOverride.mockReturnValue(true);

      expect(guard.canActivate(context)).toBe(true);
    });
  });

  describe('handleRequest', () => {
    it('passes the user on when the token is valid', () => {
      const user = { id: 1, username: 'miljana' };

      expect(guard.handleRequest(null, user, undefined)).toBe(user);
    });

    it('says "Your session has expired" for an expired token', () => {
      const expired = new TokenExpiredError('jwt expired', new Date());

      expect(() => guard.handleRequest(null, false, expired)).toThrow(
        new UnauthorizedException('Your session has expired'),
      );
    });

    it('says "Authentication required" when there is no token', () => {
      const noToken = new Error('No auth token');

      expect(() => guard.handleRequest(null, false, noToken)).toThrow(
        new UnauthorizedException('Authentication required'),
      );
    });

    it('says "Authentication required" for a malformed token', () => {
      const malformed = new JsonWebTokenError('jwt malformed');

      expect(() => guard.handleRequest(null, false, malformed)).toThrow(
        new UnauthorizedException('Authentication required'),
      );
    });
  });
});
