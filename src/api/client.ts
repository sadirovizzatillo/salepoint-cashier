export const BASE_URL          = import.meta.env.VITE_API_URL          ?? 'http://localhost:3000/api/v1';
export const CUSTOMERS_BASE_URL = import.meta.env.VITE_CUSTOMERS_API_URL ?? 'http://localhost:8000/api/v1';

/* ── token storage ── */
export const tokens = {
  get access()  { return localStorage.getItem('accessToken');  },
  get refresh() { return localStorage.getItem('refreshToken'); },
  set(accessToken: string, refreshToken: string) {
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clear() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeShopName');
  },
};

/* ── internal refresh (no import from auth.ts → no circular dep) ── */
let refreshLock: Promise<void> | null = null;

async function doRefresh(): Promise<void> {
  if (!tokens.refresh) throw new Error('No refresh token');

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: tokens.refresh }),
  });

  if (!res.ok) {
    tokens.clear();
    // 403 means refresh token reuse was detected — all sessions already wiped server-side
    throw new Error(res.status === 403 ? 'Token reuse detected' : 'Session expired');
  }

  const data = await res.json();
  tokens.set(data.data.accessToken, data.data.refreshToken);
}

/* exported so App.tsx can call it on boot */
export async function refreshTokens(): Promise<void> {
  return doRefresh();
}

/* ── raw fetch with auth header ── */
function makeRequest(url: string, init?: RequestInit): Promise<Response> {
  return fetch(url, {
    ...init,
    headers: {
      // only set Content-Type when actually sending a body
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(tokens.access ? { Authorization: `Bearer ${tokens.access}` } : {}),
      ...init?.headers,
    },
  });
}

/* ── factory: creates a typed fetcher for any base URL ── */
export function createFetcher(baseUrl: string) {
  return async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
    let res = await makeRequest(`${baseUrl}${path}`, init);

    /* 401 → try refresh once, then retry */
    if (res.status === 401 && tokens.refresh) {
      if (!refreshLock) {
        refreshLock = doRefresh().finally(() => { refreshLock = null; });
      }
      try {
        await refreshLock;
        res = await makeRequest(`${baseUrl}${path}`, init);
      } catch {
        tokens.clear();
        window.location.href = '/login';
        throw new Error('Session expired');
      }
    }

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try { message = (await res.json()).message ?? message; } catch { /* ignore */ }
      throw new Error(message);
    }

    // if (res.status === 204 || res.headers.get('content-length') === '0') {
    //   return undefined as T;
    // }
    return res.json();
  };
}

/* default fetcher for auth / main API */
export const apiFetch = createFetcher(BASE_URL);
