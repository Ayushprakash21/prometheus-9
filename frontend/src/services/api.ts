import { Product, SystemHealth, SpecialistAgent, SocialAccount, PublicationRecord } from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");
const TOKEN_STORAGE_KEY = "prometheus9_auth_token";

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearAuthToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

function getHeaders(customHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...customHeaders };
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error(`Failed to fetch system health: HTTP ${res.status}`);
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("AUTHENTICATION_REQUIRED");
    }
    throw new Error(`Failed to fetch products: HTTP ${res.status}`);
  }
  const data = await res.json();
  // Support both paginated response and direct list
  return Array.isArray(data) ? data : data.items || [];
}

export async function fetchProductDetail(idOrSlug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTHENTICATION_REQUIRED");
    throw new Error(`Failed to fetch product details: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchAgentRoster(): Promise<{ is_autonomous_paused: boolean; agents: SpecialistAgent[] }> {
  const res = await fetch(`${API_BASE}/agents/roster`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTHENTICATION_REQUIRED");
    throw new Error(`Failed to fetch agent roster: HTTP ${res.status}`);
  }
  return res.json();
}

export async function pauseAutonomousEngine(): Promise<{ message: string; is_paused: boolean }> {
  const res = await fetch(`${API_BASE}/agents/emergency-pause`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("ACTION_FORBIDDEN: Requires Admin or Owner authorization.");
    throw new Error(`Failed to trigger emergency pause: HTTP ${res.status}`);
  }
  return res.json();
}

export async function resumeAutonomousEngine(): Promise<{ message: string; is_paused: boolean }> {
  const res = await fetch(`${API_BASE}/agents/resume`, {
    method: "POST",
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 403) throw new Error("ACTION_FORBIDDEN: Requires Admin or Owner authorization.");
    throw new Error(`Failed to resume autonomous engine: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchSocialAccounts(productId?: string): Promise<SocialAccount[]> {
  const url = productId ? `${API_BASE}/publishing/accounts?product_id=${productId}` : `${API_BASE}/publishing/accounts`;
  const res = await fetch(url, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTHENTICATION_REQUIRED");
    throw new Error(`Failed to fetch social accounts: HTTP ${res.status}`);
  }
  return res.json();
}

export async function fetchPublications(productId?: string): Promise<PublicationRecord[]> {
  const url = productId ? `${API_BASE}/publishing/publications?product_id=${productId}` : `${API_BASE}/publishing/publications`;
  const res = await fetch(url, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTHENTICATION_REQUIRED");
    throw new Error(`Failed to fetch publications: HTTP ${res.status}`);
  }
  return res.json();
}
