import { resolveApiUrl } from "@/config/serverConfig";

function getAuthToken(): string | null {
  try {
    return localStorage.getItem("authToken");
  } catch {
    return null;
  }
}

export async function apiGet<T = unknown>(resource: string, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(resource);
  const headers: HeadersInit = { Accept: "application/json", ...(init?.headers || {}) };
  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { method: "GET", ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `GET ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T = unknown>(resource: string, data: unknown, init?: RequestInit): Promise<T> {
  const url = resolveApiUrl(resource);
  const headers: HeadersInit = { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers || {}) };
  const token = getAuthToken();
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(url, { method: "POST", body: JSON.stringify(data), ...init, headers });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `POST ${url} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function pingServer(): Promise<{ ok: boolean; ms: number }>
{
  const start = performance.now();
  try {
    await apiGet("health");
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch {
    return { ok: false, ms: Math.round(performance.now() - start) };
  }
}