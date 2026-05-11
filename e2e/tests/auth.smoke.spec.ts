import { expect, test } from '@playwright/test';

test.describe('auth smoke', () => {
  test('POST /api/auth/login with bad credentials returns 401', async ({
    request,
  }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'nobody@thermotwin.local', password: 'wrong-password' },
    });
    expect([400, 401, 422]).toContain(res.status());
  });

  test('GET /api/auth/me without token returns 401', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(401);
  });
});
