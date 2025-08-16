const DEFAULT_MODE = import.meta.env.VITE_API_MODE || "netlify"; // 'netlify' | 'custom' | 'aliyun'
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || ""; // e.g., https://api.example.com
const DEFAULT_PREFIX = import.meta.env.VITE_API_PREFIX || ""; // e.g., /api

const STORAGE_KEYS = {
  apiMode: "apiMode",
  apiBaseUrl: "apiBaseUrl"
} as const;

type ApiMode = "netlify" | "custom" | "aliyun";

export function getApiMode(): ApiMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.apiMode);
    if (stored === "netlify" || stored === "custom" || stored === "aliyun") {
      return stored;
    }
  } catch {}
  return (DEFAULT_MODE as ApiMode) || "netlify";
}

export function getApiBaseUrl(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.apiBaseUrl);
    if (stored) return stored;
  } catch {}
  return DEFAULT_BASE_URL;
}

export function setApiConfig(config: { mode?: ApiMode; baseUrl?: string }) {
  if (typeof window === "undefined") return;
  if (config.mode) {
    localStorage.setItem(STORAGE_KEYS.apiMode, config.mode);
  }
  if (typeof config.baseUrl === "string") {
    localStorage.setItem(STORAGE_KEYS.apiBaseUrl, config.baseUrl);
  }
}

export function resetApiConfig() {
  try {
    localStorage.removeItem(STORAGE_KEYS.apiMode);
    localStorage.removeItem(STORAGE_KEYS.apiBaseUrl);
  } catch {}
}

function joinUrl(base: string, path: string): string {
  if (!base) return path;
  if (base.endsWith("/")) base = base.slice(0, -1);
  if (path.startsWith("/")) path = path.slice(1);
  return `${base}/${path}`;
}

export function resolveApiUrl(resource: string): string {
  if (/^https?:\/\//i.test(resource)) return resource;

  const mode = getApiMode();
  if (mode === "netlify") {
    return `/.netlify/functions/${resource}`;
  }
  // custom or aliyun
  const base = getApiBaseUrl();
  const prefixed = DEFAULT_PREFIX ? joinUrl(DEFAULT_PREFIX, resource) : resource;
  return joinUrl(base || "", prefixed);
}

export function getResolvedInfo() {
  return {
    mode: getApiMode(),
    baseUrl: getApiBaseUrl(),
    prefix: DEFAULT_PREFIX
  };
}