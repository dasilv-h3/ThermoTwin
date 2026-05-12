import { apiFetch } from './api';

export type CreditPackId = 'starter' | 'pro' | 'unlimited';

export type CreditPack = {
  id: CreditPackId;
  credits: number;
  price_eur: number;
  label: string;
};

export type CreditPurchaseResult = {
  pack_id: CreditPackId;
  credits_added: number;
  scans_used: number;
  scans_limit: number;
};

export function fetchCreditPacks(): Promise<{ items: CreditPack[] }> {
  return apiFetch<{ items: CreditPack[] }>('/api/credits/packs');
}

export function purchaseCreditPack(packId: CreditPackId): Promise<CreditPurchaseResult> {
  return apiFetch<CreditPurchaseResult>('/api/credits/purchase', {
    method: 'POST',
    body: { pack_id: packId },
  });
}
