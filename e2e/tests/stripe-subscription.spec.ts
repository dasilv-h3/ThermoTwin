import { expect, test, type APIRequestContext } from '@playwright/test';

const STRIPE_TEST_CARD = 'pm_card_visa';
const STRIPE_DECLINED_CARD = 'pm_card_chargeDeclined';

async function login(
  request: APIRequestContext,
): Promise<{ token: string } | null> {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  if (!email || !password) return null;
  const res = await request.post('/api/auth/login', {
    data: { email, password },
  });
  if (res.status() !== 200) return null;
  const body = await res.json();
  return { token: body.access_token ?? body.token };
}

test.describe('Stripe — abonnement Premium (test mode)', () => {
  test.beforeEach(async () => {
    test.skip(
      process.env.STRIPE_TEST_MODE !== 'true',
      'Stripe test mode disabled — set STRIPE_TEST_MODE=true to run',
    );
  });

  test('subscribe with valid test card creates an active subscription', async ({
    request,
  }) => {
    const session = await login(request);
    test.skip(session === null, 'E2E_USER_EMAIL / E2E_USER_PASSWORD required');
    const headers = { Authorization: `Bearer ${session!.token}` };

    const res = await request.post('/api/billing/subscribe', {
      headers,
      data: { plan: 'premium', paymentMethod: STRIPE_TEST_CARD },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.status).toBe('active');
    expect(body.plan).toBe('premium');
  });

  test('subscribe with declined card returns a payment error', async ({
    request,
  }) => {
    const session = await login(request);
    test.skip(session === null, 'E2E_USER_EMAIL / E2E_USER_PASSWORD required');
    const headers = { Authorization: `Bearer ${session!.token}` };

    const res = await request.post('/api/billing/subscribe', {
      headers,
      data: { plan: 'premium', paymentMethod: STRIPE_DECLINED_CARD },
    });
    expect(res.status()).toBeGreaterThanOrEqual(400);
    const body = await res.json();
    expect(JSON.stringify(body)).toMatch(/declin|card|stripe/i);
  });

  test('GET /api/billing/subscription returns current plan', async ({
    request,
  }) => {
    const session = await login(request);
    test.skip(session === null, 'E2E_USER_EMAIL / E2E_USER_PASSWORD required');
    const headers = { Authorization: `Bearer ${session!.token}` };

    const res = await request.get('/api/billing/subscription', { headers });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('plan');
  });
});
