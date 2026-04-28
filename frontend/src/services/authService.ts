import { apiFetch } from './api';

export type SubscriptionTier = 'free' | 'premium' | 'lifetime';

export interface Subscription {
  tier: SubscriptionTier;
  scans_used: number;
  scans_limit: number;
  started_at: string;
  expires_at: string | null;
}

export interface NotificationPreferences {
  energy_tips: boolean;
  scan_ready: boolean;
  promotional: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  subscription: Subscription;
  notification_preferences: NotificationPreferences;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface UpdateProfilePayload {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UpdateNotificationsPayload {
  energy_tips?: boolean;
  scan_ready?: boolean;
  promotional?: boolean;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

export function register(payload: RegisterPayload): Promise<TokenResponse> {
  return apiFetch<TokenResponse>('/api/auth/register', {
    method: 'POST',
    body: payload,
    auth: false,
  });
}

export function fetchMe(): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/me');
}

export function updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/me', {
    method: 'PATCH',
    body: payload,
  });
}

export function updateNotifications(payload: UpdateNotificationsPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>('/api/auth/me/notifications', {
    method: 'PATCH',
    body: payload,
  });
}

export function changePassword(payload: ChangePasswordPayload): Promise<null> {
  return apiFetch<null>('/api/auth/me/password', {
    method: 'PATCH',
    body: payload,
  });
}

export function deleteAccount(): Promise<null> {
  return apiFetch<null>('/api/auth/me', {
    method: 'DELETE',
  });
}
