export type NavTab =
  // SECTION 1: COMMAND
  | 'overview'
  | 'workspace'
  | 'activity_centre'
  // SECTION 2: BUSINESS MANAGEMENT
  | 'products'
  | 'brand_profile'
  | 'audiences'
  | 'marketing_objectives'
  | 'competitors'
  // SECTION 3: MARKETING INTELLIGENCE
  | 'market_research'
  | 'trend_intelligence'
  | 'seo_intelligence'
  | 'strategy'
  | 'growth_opportunities'
  // SECTION 4: AI WORKFORCE
  | 'agents'
  | 'agent_config'
  | 'agent_history'
  | 'automation_rules'
  | 'autonomy'
  | 'approval_centre'
  // SECTION 5: CREATIVE STUDIO
  | 'content_studio'
  | 'video_production'
  | 'image_studio'
  | 'asset_library'
  | 'brand_compliance'
  // SECTION 6: DISTRIBUTION
  | 'social_accounts'
  | 'publishing_centre'
  | 'publishing_calendar'
  | 'publication_history'
  // SECTION 7: PERFORMANCE
  | 'analytics'
  | 'campaign_analytics'
  | 'conversion_intelligence'
  | 'growth_optimization'
  // SECTION 8: ADMINISTRATION
  | 'team'
  | 'settings'
  | 'ai_providers'
  | 'audit_logs'
  | 'system_monitoring';

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

export interface MarketingObjective {
  id: string;
  product_id: string;
  title: string;
  kpi_target: string;
  current_progress: number;
  target_date: string;
  channel: string;
  status: 'on_track' | 'at_risk' | 'achieved';
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

export interface VideoRenderJob {
  id: string;
  organization_id: string;
  product_id: string;
  title: string;
  aspect_ratio: '9:16' | '16:9' | '1:1';
  template_style: 'luxury_cinematic' | 'saas_explainer' | 'minimal_editorial' | 'high_impact';
  voiceover_model: string;
  subtitles_enabled: boolean;
  resolution: string;
  duration_seconds: number;
  status: 'queued' | 'rendering' | 'completed' | 'failed';
  progress_percent: number;
  output_asset_id?: string | null;
  preview_url?: string;
  created_at: string;
}

export interface ApprovalItem {
  id: string;
  organization_id: string;
  product_id: string;
  item_type: 'marketing_strategy' | 'creative_script' | 'video_render' | 'scheduled_post' | 'budget_allocation';
  title: string;
  summary: string;
  proposed_by_agent: string;
  risk_score: 'low' | 'medium' | 'high';
  status: 'pending' | 'approved' | 'rejected' | 'revising';
  payload: Record<string, any>;
  reviewer_notes?: string | null;
  created_at: string;
}

export interface AutomationRule {
  id: string;
  organization_id: string;
  name: string;
  trigger_event: string;
  condition: string;
  action: string;
  is_active: boolean;
  last_triggered_at?: string | null;
  executions_count: number;
}

export interface AIProviderConfig {
  id: string;
  provider_name: 'gemini' | 'openai' | 'anthropic' | 'local_ollama';
  model_id: string;
  is_enabled: boolean;
  is_default: boolean;
  status: 'connected' | 'untested' | 'error';
  latency_ms?: number;
  masked_key: string;
  updated_at: string;
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
