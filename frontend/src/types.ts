export type NavTab =
  // COMMAND
  | 'overview'
  | 'workspace'
  // BUSINESS
  | 'products'
  | 'brand_profile'
  | 'audiences'
  | 'strategy'
  // INTELLIGENCE
  | 'market_research'
  | 'competitors'
  | 'analytics'
  // AI WORKFORCE
  | 'agents'
  | 'agent_config'
  | 'automation_rules'
  | 'autonomy'
  // CREATIVE STUDIO
  | 'content_studio'
  | 'video_production'
  | 'asset_library'
  // DISTRIBUTION
  | 'social_accounts'
  | 'publishing_centre'
  | 'publishing_calendar'
  // ADMINISTRATION
  | 'team'
  | 'settings'
  | 'audit_logs';

export interface Product {
  id: string;
  organization_id: string;
  name: string;
  slug: string;
  category: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  primary_objective: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  features_count: number;
  sources_count: number;
  campaigns_count: number;
  features?: ProductFeature[];
  brand_profile?: BrandProfile;
}

export interface ProductFeature {
  id: string;
  product_id: string;
  name: string;
  description: string;
  benefit_statement: string | null;
  is_verified: boolean;
  created_at: string;
}

export interface ProductSource {
  id: string;
  product_id: string;
  source_type: string;
  source_url?: string | null;
  title: string;
  content_snippet?: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface BrandProfile {
  id: string;
  tone_of_voice: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  do_not_mention_claims: string[];
  mandatory_disclaimers: string[];
  mission_statement?: string | null;
  positioning_statement?: string | null;
}

export interface AudiencePersona {
  id: string;
  product_id: string;
  name: string;
  description: string;
  pain_points: string[];
  aspirations: string[];
  channels: string[];
  created_at: string;
}

export interface Campaign {
  id: string;
  organization_id: string;
  product_id: string;
  title: string;
  objective: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  target_audience_id?: string | null;
  budget_cap_cents?: number | null;
  created_at: string;
  updated_at?: string;
}

export interface ContentIdea {
  id: string;
  organization_id: string;
  campaign_id: string;
  product_id: string;
  title: string;
  hook: string;
  format: string;
  core_thesis: string;
  rationale: string;
  status: string;
  created_at: string;
}

export interface Script {
  id: string;
  organization_id: string;
  product_id: string;
  content_idea_id?: string | null;
  title: string;
  target_duration_seconds: number;
  tone: string;
  script_body: string;
  status: string;
  created_at: string;
}

export interface MediaAsset {
  id: string;
  organization_id: string;
  product_id: string;
  filename: string;
  content_hash: string;
  mime_type: string;
  file_size_bytes: number;
  asset_type: string;
  licensing_status: string;
  attribution_details?: string | null;
  created_at: string;
}

export interface AgentRun {
  id: string;
  organization_id: string;
  agent_role: string;
  product_id: string;
  status: string;
  duration_ms: number;
  started_at: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  database: string;
  ffmpeg_available: boolean;
  ffmpeg_version: string | null;
  autonomous_scheduler: {
    is_running: boolean;
    is_paused: boolean;
    active_scheduled_jobs_count: number;
    registered_task_types: string[];
  };
  system_metrics: {
    cpu_usage_percent: number;
    ram_usage_percent: number;
    ram_available_mb: number;
    storage_disk_percent: number;
  };
}

export interface SpecialistAgent {
  name: string;
  category: string;
  description: string;
  status: string;
  role_id?: string;
  model?: string;
  approval_level?: 'manual' | 'supervised' | 'autonomous';
}

export interface SocialAccount {
  id: string;
  organization_id?: string;
  product_id: string;
  platform: string;
  account_name: string;
  account_id_on_platform: string | null;
  authorization_status: string;
  channel_url: string | null;
  created_at: string;
}

export interface PublicationRecord {
  id: string;
  publishing_job_id: string;
  product_id: string;
  platform: string;
  platform_post_id: string;
  platform_post_url: string;
  published_at: string;
  verified_by_api: boolean;
}

export type AutonomyMode = 'manual' | 'assisted' | 'supervised' | 'autonomous';
