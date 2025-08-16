export async function apiGet<T = unknown>(fn: string): Promise<T> {
  const res = await fetch(`/.netlify/functions/${fn}`, {
    method: "GET",
    headers: { "Accept": "application/json" }
  });
  if (!res.ok) {
    throw new Error(`GET ${fn} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<T = unknown>(fn: string, data: unknown): Promise<T> {
  const res = await fetch(`/.netlify/functions/${fn}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `POST ${fn} failed: ${res.status}`);
  }
  return (await res.json()) as T;
}