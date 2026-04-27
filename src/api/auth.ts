import { apiFetch, tokens, BASE_URL } from './client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  message?: string; // present when an active shift was restored
}

export interface Shop {
  id: string;
  name: string;
  logoUrl: string;
  roles: string[];
  subscriptionStatus: string;
}

export interface PreAuthResult {
  preAuthToken: string;
  shops: Shop[];
}

export type LoginResult =
  | ({ type: 'tokens' } & AuthTokens)
  | ({ type: 'preAuth' } & PreAuthResult);

/** Step 1 — POST /auth/login.
 *  SUPER_ADMIN or single-shop cashier → full tokens (type: 'tokens').
 *  Multi-shop users → preAuthToken + shop list (type: 'preAuth').
 *  Uses raw fetch — apiFetch's 401-retry loop must not run on the login endpoint. */
export async function login(email: string, password: string): Promise<LoginResult> {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = (await res.json()).message ?? message; } catch { /* ignore */ }
    throw new Error(message);
  }

  const json = await res.json();
  // API wraps all responses in { success, data: {...} }
  const data = json.data ?? json;

  if (data.accessToken) {
    // SUPER_ADMIN or single-shop cashier — full token pair returned immediately
    tokens.set(data.accessToken, data.refreshToken);
    return { type: 'tokens', ...data };
  }

  // Multi-shop users — shop selection required
  return { type: 'preAuth', preAuthToken: data.preAuthToken, shops: data.shops };
}

/** Step 2 — POST /auth/select-shop.
 *  preAuthToken is Bearer (memory-only, never persisted).
 *  Returns full token pair; message present → active shift was restored. */
export async function selectShop(preAuthToken: string, shopId: string): Promise<AuthTokens> {
  const res = await fetch(`${BASE_URL}/auth/select-shop`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${preAuthToken}`,
    },
    body: JSON.stringify({ shopId }),
  });

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try { message = (await res.json()).message ?? message; } catch { /* ignore */ }
    throw new Error(message);
  }

  const json = await res.json();
  const data: AuthTokens = json.data ?? json;
  tokens.set(data.accessToken, data.refreshToken);
  return data;
}

/** Switch to another shop the current user belongs to.
 *  Uses the current accessToken — returns a new token pair scoped to the new shop. */
export async function switchShop(shopId: string): Promise<AuthTokens> {
  const data = await apiFetch<AuthTokens>('/auth/switch-shop', {
    method: 'POST',
    body: JSON.stringify({ shopId }),
  });
  tokens.set(data.accessToken, data.refreshToken);
  return data;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    tokens.clear();
  }
}

export async function logoutAll(): Promise<void> {
  try {
    await apiFetch('/auth/logout-all', { method: 'POST' });
  } finally {
    tokens.clear();
  }
}
