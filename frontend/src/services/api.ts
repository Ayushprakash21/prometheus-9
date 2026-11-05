import { 
  Product, 
  ProductFeature,
  ProductSource,
  BrandProfile,
  AudiencePersona,
  Campaign,
  ContentIdea,
  Script,
  MediaAsset,
  AgentRun,
  SystemHealth, 
  SpecialistAgent, 
  SocialAccount, 
  PublicationRecord 
} from "../types";

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

// --- Product Registry & Brand Management ---

export async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products`, {
    headers: getHeaders()
  });
  if (!res.ok) {
    if (res.status === 401) throw new Error("AUTHENTICATION_REQUIRED");
    throw new Error(`Failed to fetch products: HTTP ${res.status}`);
  }
  const data = await res.json();
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

export async function createProduct(payload: {
  name: string;
  slug?: string;
  category: string;
  tagline?: string;
  description?: string;
  website_url?: string;
  primary_objective?: string;
}): Promise<Product> {
  const res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || `Failed to create product: HTTP ${res.status}`);
  }
  return res.json();
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: "PATCH",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to update product: HTTP ${res.status}`);
  return res.json();
}

// --- Nested Brand Profile ---

export async function fetchBrandProfile(productId: string): Promise<BrandProfile> {
  const res = await fetch(`${API_BASE}/products/${productId}/brand-profile`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch brand profile: HTTP ${res.status}`);
  return res.json();
}

export async function updateBrandProfile(productId: string, payload: Partial<BrandProfile>): Promise<BrandProfile> {
  const res = await fetch(`${API_BASE}/products/${productId}/brand-profile`, {
    method: "PUT",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to update brand profile: HTTP ${res.status}`);
  return res.json();
}

// --- Nested Features ---

export async function fetchFeatures(productId: string): Promise<ProductFeature[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/features`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch features: HTTP ${res.status}`);
  return res.json();
}

export async function createFeature(productId: string, payload: {
  name: string;
  description: string;
  benefit_statement?: string;
  is_verified?: boolean;
}): Promise<ProductFeature> {
  const res = await fetch(`${API_BASE}/products/${productId}/features`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create feature: HTTP ${res.status}`);
  return res.json();
}

// --- Nested Sources ---

export async function fetchSources(productId: string): Promise<ProductSource[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/sources`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch sources: HTTP ${res.status}`);
  return res.json();
}

export async function createSource(productId: string, payload: {
  source_type: string;
  title: string;
  source_url?: string;
  content_snippet?: string;
  is_primary?: boolean;
}): Promise<ProductSource> {
  const res = await fetch(`${API_BASE}/products/${productId}/sources`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to add source: HTTP ${res.status}`);
  return res.json();
}

// --- Nested Audience Personas ---

export async function fetchAudiences(productId: string): Promise<AudiencePersona[]> {
  const res = await fetch(`${API_BASE}/products/${productId}/audiences`, {
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch audiences: HTTP ${res.status}`);
  return res.json();
}

export async function createAudience(productId: string, payload: {
  name: string;
  description: string;
  pain_points?: string[];
  aspirations?: string[];
  channels?: string[];
}): Promise<AudiencePersona> {
  const res = await fetch(`${API_BASE}/products/${productId}/audiences`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create audience: HTTP ${res.status}`);
  return res.json();
}

// --- Campaigns & Content ---

export async function fetchCampaigns(productId?: string): Promise<Campaign[]> {
  const url = productId ? `${API_BASE}/campaigns?product_id=${productId}` : `${API_BASE}/campaigns`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch campaigns: HTTP ${res.status}`);
  return res.json();
}

export async function createCampaign(payload: {
  product_id: string;
  title: string;
  objective: string;
  status?: string;
  target_audience_id?: string;
  budget_cap_cents?: number;
}): Promise<Campaign> {
  const res = await fetch(`${API_BASE}/campaigns`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create campaign: HTTP ${res.status}`);
  return res.json();
}

export async function fetchIdeas(productId?: string, campaignId?: string): Promise<ContentIdea[]> {
  const params = new URLSearchParams();
  if (productId) params.append("product_id", productId);
  if (campaignId) params.append("campaign_id", campaignId);
  const url = `${API_BASE}/campaigns/ideas${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ideas: HTTP ${res.status}`);
  return res.json();
}

export async function createIdea(payload: {
  campaign_id: string;
  product_id: string;
  title: string;
  hook: string;
  format: string;
  core_thesis: string;
  rationale: string;
}): Promise<ContentIdea> {
  const res = await fetch(`${API_BASE}/campaigns/ideas`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create idea: HTTP ${res.status}`);
  return res.json();
}

export async function fetchScripts(productId?: string, ideaId?: string): Promise<Script[]> {
  const params = new URLSearchParams();
  if (productId) params.append("product_id", productId);
  if (ideaId) params.append("idea_id", ideaId);
  const url = `${API_BASE}/campaigns/scripts${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch scripts: HTTP ${res.status}`);
  return res.json();
}

export async function createScript(payload: {
  product_id: string;
  content_idea_id?: string;
  title: string;
  target_duration_seconds: number;
  tone: string;
  script_body: string;
}): Promise<Script> {
  const res = await fetch(`${API_BASE}/campaigns/scripts`, {
    method: "POST",
    headers: getHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error(`Failed to create script: HTTP ${res.status}`);
  return res.json();
}

// --- Media Assets ---

export async function fetchAssets(productId?: string, assetType?: string): Promise<MediaAsset[]> {
  const params = new URLSearchParams();
  if (productId) params.append("product_id", productId);
  if (assetType) params.append("asset_type", assetType);
  const url = `${API_BASE}/assets${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch assets: HTTP ${res.status}`);
  return res.json();
}

export async function uploadAsset(formData: FormData): Promise<MediaAsset> {
  const res = await fetch(`${API_BASE}/assets/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.detail || `Upload failed: HTTP ${res.status}`);
  }
  return res.json();
}

export async function deleteAsset(assetId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/assets/${assetId}`, {
    method: "DELETE",
    headers: getHeaders()
  });
  if (!res.ok) throw new Error(`Failed to delete asset: HTTP ${res.status}`);
}

// --- Agent Workforce ---

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

export async function fetchAgentRuns(productId?: string): Promise<AgentRun[]> {
  const url = productId ? `${API_BASE}/agents/runs?product_id=${productId}` : `${API_BASE}/agents/runs`;
  const res = await fetch(url, { headers: getHeaders() });
  if (!res.ok) return [];
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

// --- Social Publishing ---

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
