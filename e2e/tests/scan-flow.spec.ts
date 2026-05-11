import { expect, test, type APIRequestContext } from '@playwright/test';

async function authToken(request: APIRequestContext): Promise<string | null> {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  if (!email || !password) return null;
  const res = await request.post('/api/auth/login', {
    data: { email, password },
  });
  if (res.status() !== 200) return null;
  const body = await res.json();
  return body.access_token ?? body.token ?? null;
}

test.describe('scan → heatmap → recommandations → devis', () => {
  test('full scan flow returns a quote tied to the scan', async ({
    request,
  }) => {
    const token = await authToken(request);
    test.skip(
      token === null,
      'E2E_USER_EMAIL/PASSWORD not provided — scan flow requires an authenticated user',
    );
    const headers = { Authorization: `Bearer ${token}` };

    const scanRes = await request.post('/api/scans', {
      headers,
      data: {
        device: 'iphone-14-pro',
        meshFormat: 'obj',
        surfaceM2: 45,
      },
    });
    expect(scanRes.ok()).toBeTruthy();
    const scan = await scanRes.json();
    expect(scan).toHaveProperty('id');

    const heatmapRes = await request.get(
      `/api/scans/${scan.id}/heatmap`,
      { headers },
    );
    expect([200, 202]).toContain(heatmapRes.status());

    const recoRes = await request.get(
      `/api/scans/${scan.id}/recommendations`,
      { headers },
    );
    expect(recoRes.ok()).toBeTruthy();
    const reco = await recoRes.json();
    expect(Array.isArray(reco.items ?? reco)).toBeTruthy();

    const quoteRes = await request.post('/api/quotes', {
      headers,
      data: {
        scanId: scan.id,
        selectedWorkTypes: ['roof_insulation', 'windows'],
      },
    });
    expect(quoteRes.ok()).toBeTruthy();
    const quote = await quoteRes.json();
    expect(quote).toHaveProperty('totalEur');
    expect(quote.scanId ?? quote.scan_id).toBe(scan.id);
  });

  test('POST /api/scans without token returns 401', async ({ request }) => {
    const res = await request.post('/api/scans', {
      data: { device: 'iphone-14-pro', surfaceM2: 45 },
    });
    expect(res.status()).toBe(401);
  });
});
