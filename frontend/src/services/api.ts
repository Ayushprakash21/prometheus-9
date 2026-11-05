import { Product, SystemHealth, SpecialistAgent, SocialAccount, PublicationRecord } from "../types";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "/api/v1").replace(/\/$/, "");

export async function fetchHealth(): Promise<SystemHealth> {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error("Failed to fetch system health");
  return res.json();
}

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductDetail(idOrSlug: string): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
  if (!res.ok) throw new Error("Failed to fetch product details");
  return res.json();
}

export async function fetchAgentRoster(): Promise<{ is_autonomous_paused: boolean; agents: SpecialistAgent[] }> {
  const res = await fetch(`${API_BASE}/agents/roster`);
  if (!res.ok) throw new Error("Failed to fetch agent roster");
  return res.json();
}

export async function pauseAutonomousEngine(): Promise<{ message: string; is_paused: boolean }> {
  const res = await fetch(`${API_BASE}/agents/emergency-pause`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to trigger emergency pause");
  return res.json();
}

export async function resumeAutonomousEngine(): Promise<{ message: string; is_paused: boolean }> {
  const res = await fetch(`${API_BASE}/agents/resume`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to resume autonomous engine");
  return res.json();
}

export async function fetchSocialAccounts(productId?: string): Promise<SocialAccount[]> {
  const url = productId ? `${API_BASE}/publishing/accounts?product_id=${productId}` : `${API_BASE}/publishing/accounts`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch social accounts");
  return res.json();
}

export async function fetchPublications(productId?: string): Promise<PublicationRecord[]> {
  const url = productId ? `${API_BASE}/publishing/publications?product_id=${productId}` : `${API_BASE}/publishing/publications`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch publications");
  return res.json();
}
