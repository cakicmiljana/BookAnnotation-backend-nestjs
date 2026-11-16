import { hashPassword, verifyPassword } from './password';

describe('password helpers', () => {
  it('hashes with bcrypt and never returns the plain password', async () => {
    const hash = await hashPassword('reader123');

    expect(hash).toMatch(/^\$2b\$10\$/);
    expect(hash).not.toContain('reader123');
  });

  it('verifies the right password and rejects a wrong one', async () => {
    const hash = await hashPassword('reader123');

    await expect(verifyPassword('reader123', hash)).resolves.toBe(true);
    await expect(verifyPassword('reader124', hash)).resolves.toBe(false);
  });

  it('produces a different hash each time (random salt)', async () => {
    const [first, second] = await Promise.all([
      hashPassword('reader123'),
      hashPassword('reader123'),
    ]);

    expect(first).not.toBe(second);
  });
});
