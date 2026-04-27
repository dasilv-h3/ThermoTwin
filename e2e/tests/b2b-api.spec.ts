import { expect, test, type APIRequestContext } from '@playwright/test';

async function b2bHeaders(): Promise<Record<string, string> | null> {
  const key = process.env.B2B_API_KEY;
  if (!key) return null;
  return { 'X-Api-Key': key, 'Content-Type': 'application/json' };
}

async function expectRateLimited(
  request: APIRequestContext,
  path: string,
  headers: Record<string, string>,
  budget = 120,
): Promise<number> {
  for (let i = 0; i < budget; i++) {
    const res = await request.get(path, { headers });
    if (res.status() === 429) return i + 1;
    if (!res.ok() && res.status() !== 200) {
      throw new Error(`unexpected status ${res.status()} after ${i + 1} calls`);
    }
  }
  return -1;
}

test.describe('B2B API', () => {
  test.beforeEach(async () => {
    test.skip(
      !process.env.B2B_API_KEY,
      'B2B_API_KEY not provided — skipping B2B suite',
    );
  });

  test('GET /api/b2b/partners without key → 401', async ({ request }) => {
    const res = await request.get('/api/b2b/partners');
    expect(res.status()).toBe(401);
  });

  test('GET /api/b2b/partners with bad key → 401 or 403', async ({
    request,
  }) => {
    const res = await request.get('/api/b2b/partners', {
      headers: { 'X-Api-Key': 'invalid' },
    });
    expect([401, 403]).toContain(res.status());
  });

  test('GET /api/b2b/partners with valid key → 200 + list shape', async ({
    request,
  }) => {
    const headers = await b2bHeaders();
    const res = await request.get('/api/b2b/partners', { headers: headers! });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(Array.isArray(body.items ?? body)).toBeTruthy();
  });

  test('rate limiting kicks in within the advertised budget', async ({
    request,
  }) => {
    const headers = await b2bHeaders();
    const hits = await expectRateLimited(
      request,
      '/api/b2b/partners',
      headers!,
    );
    expect(hits).toBeGreaterThan(0);
  });
});
