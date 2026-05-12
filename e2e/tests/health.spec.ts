import { expect, test } from '@playwright/test';

test.describe('health endpoint', () => {
  test('GET /api/health returns 200', async ({ request }) => {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
  });

  test('GET /api/health payload shape', async ({ request }) => {
    const res = await request.get('/api/health');
    const body = await res.json();
    expect(body).toEqual(expect.objectContaining({ status: expect.any(String) }));
  });
});
