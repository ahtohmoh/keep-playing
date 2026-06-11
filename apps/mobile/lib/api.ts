/**
 * API client for the Keep Playing backend.
 *
 * Same API the web uses. Auth is a session token from /api/auth/login,
 * stored in SecureStore, sent as Authorization: Bearer.
 *
 * API base: set EXPO_PUBLIC_API_URL in .env (defaults to production).
 * For local dev against `pnpm dev`, use your machine's LAN address,
 * e.g. EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'kp_session_token';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://app.keepplaying.studio';

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string> | undefined),
  };
  if (token) headers['authorization'] = `Bearer ${token}`;
  let body = init?.body;
  if (init?.json !== undefined) {
    headers['content-type'] = 'application/json';
    body = JSON.stringify(init.json);
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers, body });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new ApiError(res.status, (detail as { title?: string }).title ?? res.statusText);
  }
  return (await res.json()) as T;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Typed calls ───────────────────────────────────────────────────────

export type Me = {
  id: string;
  email: string;
  fullName: string;
  displayName: string | null;
  tier: string;
};

export async function login(email: string, password: string) {
  const data = await api<{ ok: boolean; token: string; user: Me }>('/api/auth/login', {
    method: 'POST',
    json: { email, password },
  });
  await setToken(data.token);
  return data.user;
}

export async function me(): Promise<Me | null> {
  try {
    const data = await api<{ user: Me }>('/api/auth/me');
    return data.user;
  } catch {
    return null;
  }
}

export type CatchUpItem = {
  id: string;
  actorName: string | null;
  projectTitle: string | null;
  projectSlug: string | null;
  summary: string;
  at: string;
};

export async function catchUp(): Promise<CatchUpItem[]> {
  const data = await api<{ items: CatchUpItem[] }>('/api/me/catch-up');
  return data.items;
}

export type ProjectListItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  status: string;
  type: string;
  artifactNumber: number | null;
};

export async function projects(): Promise<ProjectListItem[]> {
  const data = await api<{ projects: ProjectListItem[] }>('/api/projects');
  return data.projects;
}
