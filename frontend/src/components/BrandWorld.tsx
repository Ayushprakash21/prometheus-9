import React, { useState } from 'react';
import { 
  Product, 
  BrandProfile, 
  ProductFeature, 
  AudiencePersona, 
  ProductSource, 
  Campaign, 
  ContentIdea, 
  Script, 
  MediaAsset 
} from '../types';
import { 
  ShieldCheck, 
  Layers, 
  Users, 
  Film, 
  Upload, 
  Plus, 
  CheckCircle2, 
  ExternalLink, 
  Trash2, 
  Download, 
  Sparkles,
  Save,
  Clock,
  Compass,
  FileText
} from 'lucide-react';
import { 
  updateProduct, 
  updateBrandProfile, 
  createFeature, 
  createAudience, 
  createSource, 
  uploadAsset, 
  deleteAsset,
  createIdea,
  createScript
} from '../services/api';

interface BrandWorldProps {
  product: Product;
  features: ProductFeature[];
  brandProfile: BrandProfile | null;
  audiences: AudiencePersona[];
  sources: ProductSource[];
  campaigns: Campaign[];
  ideas: ContentIdea[];
  scripts: Script[];
  assets: MediaAsset[];
  onRefresh: () => Promise<void>;
  onClose: () => void;
  initialTab?: string;
}

export const BrandWorld: React.FC<BrandWorldProps> = ({
  product,
  features,
  brandProfile,
  audiences,
  sources,
  campaigns,
  ideas,
  scripts,
  assets,
  onRefresh,
  onClose,
  initialTab = 'identity'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Editable Brand Identity States
  const [name, setName] = useState(product.name);
  const [tagline, setTagline] = useState(product.tagline || '');
  const [description, setDescription] = useState(product.description || '');
  const [toneOfVoice, setToneOfVoice] = useState(brandProfile?.tone_of_voice || 'Authoritative, visionary, unapologetically rigorous');
  const [primaryColor, setPrimaryColor] = useState(brandProfile?.primary_color || '#202221');
  const [accentColor, setAccentColor] = useState(brandProfile?.accent_color || '#A16C50');
  const [missionStatement, setMissionStatement] = useState(brandProfile?.mission_statement || 'Empowering autonomous creative growth through deterministic intelligence.');
  const [bannedClaims, setBannedClaims] = useState(brandProfile?.do_not_mention_claims?.join('\n') || 'Zero human oversight required\n100% automated revenue without setup');
  const [mandatoryDisclaimers, setMandatoryDisclaimers] = useState(brandProfile?.mandatory_disclaimers?.join('\n') || 'Requires authorized platform OAuth access.\nExecution rates subject to API quotas.');

  // Modal / Quick Add States
  const [showAddFeature, setShowAddFeature] = useState(false);
  const [featureName, setFeatureName] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featureBenefit, setFeatureBenefit] = useState('');

  const [showAddAudience, setShowAddAudience] = useState(false);
  const [audienceName, setAudienceName] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [audiencePainPoints, setAudiencePainPoints] = useState('');

  const [showAddSource, setShowAddSource] = useState(false);
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceType, setSourceType] = useState('documentation');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceSnippet, setSourceSnippet] = useState('');

  const [showAddIdea, setShowAddIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaHook, setIdeaHook] = useState('');
  const [ideaThesis, setIdeaThesis] = useState('');
  const [ideaFormat, setIdeaFormat] = useState('Shorts / Reel');

  const [showAddScript, setShowAddScript] = useState(false);
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptDuration, setScriptDuration] = useState(60);
  const [scriptTone, setScriptTone] = useState('Editorial & Inspiring');
  const [scriptBody, setScriptBody] = useState('');

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadAssetType, setUploadAssetType] = useState('image');
  const [isUploading, setIsUploading] = useState(false);

  // Save Identity and Voice
  const handleSaveIdentity = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    try {
      await updateProduct(product.id, {
        name,
        tagline,
        description
      });

      const parsedBanned = bannedClaims.split('\n').map(s => s.trim()).filter(Boolean);
      const parsedDisclaimers = mandatoryDisclaimers.split('\n').map(s => s.trim()).filter(Boolean);

      await updateBrandProfile(product.id, {
        tone_of_voice: toneOfVoice,
        primary_color: primaryColor,
        accent_color: accentColor,
        mission_statement: missionStatement,
        do_not_mention_claims: parsedBanned,
        mandatory_disclaimers: parsedDisclaimers
      });

      await onRefresh();
      setSaveMessage('Brand identity saved and synchronized.');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err: any) {
      alert(`Error saving brand identity: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Feature
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!featureName.trim()) return;
    try {
      await createFeature(product.id, {
        name: featureName,
        description: featureDesc,
        benefit_statement: featureBenefit,
        is_verified: true
      });
      setFeatureName('');
      setFeatureDesc('');
      setFeatureBenefit('');
      setShowAddFeature(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add feature: ${err.message}`);
    }
  };

  // Add Audience Persona
  const handleCreateAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audienceName.trim()) return;
    try {
      const painPoints = audiencePainPoints.split('\n').map(p => p.trim()).filter(Boolean);
      await createAudience(product.id, {
        name: audienceName,
        description: audienceDesc,
        pain_points: painPoints,
        aspirations: ['Autonomy', 'Market leadership'],
        channels: ['YouTube', 'LinkedIn', 'X']
      });
      setAudienceName('');
      setAudienceDesc('');
      setAudiencePainPoints('');
      setShowAddAudience(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add audience persona: ${err.message}`);
    }
  };

  // Add Source of Truth
  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceTitle.trim()) return;
    try {
      await createSource(product.id, {
        title: sourceTitle,
        source_type: sourceType,
        source_url: sourceUrl || undefined,
        content_snippet: sourceSnippet || undefined,
        is_primary: true
      });
      setSourceTitle('');
      setSourceUrl('');
      setSourceSnippet('');
      setShowAddSource(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add source: ${err.message}`);
    }
  };

  // Add Content Idea
  const handleCreateIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ideaTitle.trim() || campaigns.length === 0) {
      alert('A campaign must exist for this brand before generating ideas.');
      return;
    }
    try {
      await createIdea({
        campaign_id: campaigns[0].id,
        product_id: product.id,
        title: ideaTitle,
        hook: ideaHook || 'What if your creative operated at the speed of thought?',
        format: ideaFormat,
        core_thesis: ideaThesis || 'Autonomous systems elevate human creativity.',
        rationale: 'High social engagement for technical leadership.'
      });
      setIdeaTitle('');
      setIdeaHook('');
      setIdeaThesis('');
      setShowAddIdea(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to create idea: ${err.message}`);
    }
  };

  // Add Script
  const handleCreateScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scriptTitle.trim()) return;
    try {
      await createScript({
        product_id: product.id,
        title: scriptTitle,
        target_duration_seconds: scriptDuration,
        tone: scriptTone,
        script_body: scriptBody
      });
      setScriptTitle('');
      setScriptBody('');
      setShowAddScript(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to create script: ${err.message}`);
    }
  };

  // Upload Asset
  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('asset_type', uploadAssetType);
      formData.append('file', uploadFile);
      formData.append('licensing_status', 'verified_brand_asset');
      
      await uploadAsset(formData);
      setUploadFile(null);
      await onRefresh();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async (assetId: string) => {
    if (!confirm('Are you sure you want to delete this media asset?')) return;
    try {
      await deleteAsset(assetId);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to delete asset: ${err.message}`);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Editorial Brand Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-copper-subtle pb-6 gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-0.5 rounded-full bg-[#A16C50]/20 border border-[#A16C50]/50 font-mono-metrics text-[10px] text-[#EEE8DE] uppercase tracking-widest">
              {product.category || 'BRAND WORLD'}
            </span>
            <span className="font-mono-metrics text-xs text-[#C9B49B]/70">
              ID: {product.slug}
            </span>
          </div>

          <h1 className="font-editorial text-4xl md:text-5xl text-[#EEE8DE] mt-2 font-normal tracking-tight">
            {product.name}
          </h1>
          <p className="font-expressive text-lg text-[#C9B49B] italic mt-1 max-w-2xl">
            {product.tagline || 'Every brand gets its own world: an intelligent, autonomous operating universe.'}
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] transition-colors"
          >
            ← Return to Universe
          </button>
          {product.website_url && (
            <a
              href={product.website_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#414542]/40 hover:bg-[#414542]/80 text-xs font-interface text-[#C9B49B] hover:text-[#EEE8DE] transition-colors"
            >
              <span>{new URL(product.website_url).hostname}</span>
              <ExternalLink className="w-3 h-3 text-[#A16C50]" />
            </a>
          )}
        </div>
      </div>

      {/* Luxury Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto py-4 border-b border-copper-subtle/50 no-scrollbar">
        {[
          { id: 'identity', label: 'Identity & Voice', icon: ShieldCheck },
          { id: 'features', label: 'Products & Claims', count: features.length, icon: Layers },
          { id: 'audience', label: 'Audience Ecosystem', count: audiences.length, icon: Users },
          { id: 'creative', label: 'Creative & Scripts', count: ideas.length + scripts.length, icon: Film },
          { id: 'assets', label: 'Media Assets', count: assets.length, icon: Upload },
          { id: 'intelligence', label: 'Market & Sources', count: sources.length, icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-interface transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#A16C50] text-[#EEE8DE] font-semibold shadow-lg shadow-[#A16C50]/20'
                  : 'bg-[#202221] border border-copper-subtle text-[#C9B49B] hover:text-[#EEE8DE] hover:border-[#A16C50]/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {typeof tab.count === 'number' && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-metrics ${
                  isActive ? 'bg-[#202221]/50 text-[#EEE8DE]' : 'bg-[#414542]/50 text-[#C9B49B]'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: 01 IDENTITY & VOICE */}
      {activeTab === 'identity' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
              <h3 className="font-editorial text-xl text-[#EEE8DE] mb-4">Core Brand Attributes</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Editorial Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Brand Essence & Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Mission Statement
                  </label>
                  <input
                    type="text"
                    value={missionStatement}
                    onChange={(e) => setMissionStatement(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
              <h3 className="font-editorial text-xl text-[#EEE8DE] mb-4">Voice, Tone & Governance Boundaries</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Tone of Voice (Guides all creative generation)
                  </label>
                  <input
                    type="text"
                    value={toneOfVoice}
                    onChange={(e) => setToneOfVoice(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#A16C50] uppercase mb-1">
                    Prohibited Claims (Zero-Hallucination Filter - One per line)
                  </label>
                  <textarea
                    rows={3}
                    value={bannedClaims}
                    onChange={(e) => setBannedClaims(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-xs font-mono-metrics focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Mandatory Disclaimers (One per line)
                  </label>
                  <textarea
                    rows={2}
                    value={mandatoryDisclaimers}
                    onChange={(e) => setMandatoryDisclaimers(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-xs font-mono-metrics focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleSaveIdentity}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-[#EEE8DE] text-xs font-interface font-semibold shadow-lg shadow-[#A16C50]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Persisting...' : 'Persist Brand Changes'}</span>
              </button>
              {saveMessage && (
                <span className="font-mono-metrics text-xs text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{saveMessage}</span>
                </span>
              )}
            </div>
          </div>

          {/* Luxury Color Palette & Typography Card */}
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-[#202221] border border-copper-subtle shadow-xl">
              <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
                VISUAL IDENTITY SPECIFICATION
              </span>
              <h4 className="font-editorial text-lg text-[#EEE8DE] mt-1 mb-4">Official Brand Palette</h4>

              <div className="space-y-3">
                {[
                  { name: 'Obsidian Charcoal', hex: '#202221', desc: 'Deep background & anchor' },
                  { name: 'Graphite', hex: '#414542', desc: 'Secondary structure & borders' },
                  { name: 'Burnished Copper', hex: '#A16C50', desc: 'Primary highlight & brand glow' },
                  { name: 'Champagne Beige', hex: '#C9B49B', desc: 'Expressive secondary accents' },
                  { name: 'Warm Ivory', hex: '#EEE8DE', desc: 'Primary typography & high clarity' },
                ].map((col) => (
                  <div key={col.hex} className="flex items-center justify-between p-2 rounded-xl bg-[#292d2b]/60 border border-copper-subtle/40">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg border border-white/10 shadow-inner" style={{ backgroundColor: col.hex }} />
                      <div>
                        <div className="font-interface text-xs font-medium text-[#EEE8DE]">{col.name}</div>
                        <div className="text-[10px] text-[#C9B49B]/70">{col.desc}</div>
                      </div>
                    </div>
                    <span className="font-mono-metrics text-xs text-[#C9B49B]">{col.hex}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-5 border-t border-copper-subtle/50">
                <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
                  EDITORIAL TYPOGRAPHY
                </span>
                <div className="mt-3 space-y-3">
                  <div>
                    <span className="text-[10px] text-[#C9B49B]/70 font-mono-metrics uppercase">Headlines</span>
                    <div className="font-editorial text-xl text-[#EEE8DE]">Bodoni Moda 900</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C9B49B]/70 font-mono-metrics uppercase">Secondary Titles</span>
                    <div className="font-expressive text-lg text-[#C9B49B] italic">Cormorant Garamond</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C9B49B]/70 font-mono-metrics uppercase">Interface Core</span>
                    <div className="font-interface text-sm text-[#EEE8DE]">DM Sans (Medium, Regular)</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#C9B49B]/70 font-mono-metrics uppercase">Metrics & Telemetry</span>
                    <div className="font-mono-metrics text-xs text-[#A16C50]">IBM Plex Mono</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 02 PRODUCTS & CLAIMS */}
      {activeTab === 'features' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">Verified Product Capabilities</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
                Every creative output references verified capabilities. No unproven claims are permitted.
              </p>
            </div>
            <button
              onClick={() => setShowAddFeature(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Feature</span>
            </button>
          </div>

          {/* Add Feature Modal / Drawer */}
          {showAddFeature && (
            <form onSubmit={handleCreateFeature} className="p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4">
              <h4 className="font-editorial text-lg text-[#EEE8DE]">Add New Verified Feature</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Feature Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Real-Time Autonomous Scheduling"
                    value={featureName}
                    onChange={(e) => setFeatureName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Benefit Statement (Audience Value)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Eliminates manual post scheduling entirely"
                    value={featureBenefit}
                    onChange={(e) => setFeatureBenefit(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Technical Description & Verified Boundaries
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Technical proof of operation."
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold"
                >
                  Verify & Persist
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddFeature(false)}
                  className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => (
              <div key={feat.id} className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle hover:border-[#A16C50]/60 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                      FEATURE #{feat.id.slice(0, 6)}
                    </span>
                    <span className="flex items-center gap-1 font-mono-metrics text-[10px] text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>VERIFIED</span>
                    </span>
                  </div>
                  <h4 className="font-editorial text-lg text-[#EEE8DE]">{feat.name}</h4>
                  <p className="font-interface text-xs text-[#C9B49B]/90 mt-2 leading-relaxed">
                    {feat.description}
                  </p>
                  {feat.benefit_statement && (
                    <div className="mt-4 p-3 rounded-xl bg-[#202221] border border-copper-subtle/50 text-xs font-expressive text-[#EEE8DE] italic">
                      "{feat.benefit_statement}"
                    </div>
                  )}
                </div>
                <div className="mt-5 pt-3 border-t border-copper-subtle/30 flex items-center justify-between text-[10px] font-mono-metrics text-[#C9B49B]/60">
                  <span>PERSISTED TO CORE</span>
                  <span>{new Date(feat.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 03 AUDIENCE ECOSYSTEM */}
      {activeTab === 'audience' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">Target Audience Ecosystem</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
                Personas that anchor script hooks, emotional triggers, and distribution channels.
              </p>
            </div>
            <button
              onClick={() => setShowAddAudience(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Define Persona</span>
            </button>
          </div>

          {/* Add Audience Modal */}
          {showAddAudience && (
            <form onSubmit={handleCreateAudience} className="p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4">
              <h4 className="font-editorial text-lg text-[#EEE8DE]">Create Target Audience Persona</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Persona Label / Role
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Solo Technical Founder"
                    value={audienceName}
                    onChange={(e) => setAudienceName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Summary Profile
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Builds products solo with limited marketing hours"
                    value={audienceDesc}
                    onChange={(e) => setAudienceDesc(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Critical Pain Points (One per line)
                </label>
                <textarea
                  rows={2}
                  placeholder="Lacks time for social content&#10;Marketing feels inconsistent"
                  value={audiencePainPoints}
                  onChange={(e) => setAudiencePainPoints(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                />
              </div>
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-5 py-2 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold"
                >
                  Save Persona
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddAudience(false)}
                  className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Audience Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.map((aud) => (
              <div key={aud.id} className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                      PERSONA
                    </span>
                    <span className="font-mono-metrics text-[10px] text-[#C9B49B]">
                      {aud.channels?.join(' • ') || 'OMNICHANNEL'}
                    </span>
                  </div>
                  <h4 className="font-editorial text-xl text-[#EEE8DE]">{aud.name}</h4>
                  <p className="font-interface text-xs text-[#C9B49B] mt-2">
                    {aud.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-copper-subtle/30 space-y-2">
                    <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase">
                      Core Pain Points:
                    </span>
                    <ul className="space-y-1">
                      {aud.pain_points?.map((pt, idx) => (
                        <li key={idx} className="text-xs text-[#EEE8DE] flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 04 CREATIVE & SCRIPTS */}
      {activeTab === 'creative' && (
        <div className="mt-8 space-y-8">
          {/* Content Ideas Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE]">Content Concepts & Angles</h3>
                <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
                  Hooks, format blueprints, and core theses generated for this brand.
                </p>
              </div>
              <button
                onClick={() => setShowAddIdea(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Compose Idea</span>
              </button>
            </div>

            {showAddIdea && (
              <form onSubmit={handleCreateIdea} className="p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4 mb-6">
                <h4 className="font-editorial text-lg text-[#EEE8DE]">New Content Idea</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Why Founders Waste 20 Hours a Week on Social"
                      value={ideaTitle}
                      onChange={(e) => setIdeaTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                      Format
                    </label>
                    <select
                      value={ideaFormat}
                      onChange={(e) => setIdeaFormat(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                    >
                      <option value="Shorts / Reel">Vertical Video (Shorts / Reels / TikTok)</option>
                      <option value="Editorial Carousel">Multi-Slide Editorial Carousel</option>
                      <option value="Longform Monologue">Longform Strategic Video</option>
                      <option value="Technical Breakdown">Technical Deep Dive Post</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Opening Hook (First 3 Seconds)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Stop hand-writing marketing scripts. Here is the autonomous way."
                    value={ideaHook}
                    onChange={(e) => setIdeaHook(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Core Thesis & Rationale
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Software that proves its claims always outperforms generic hype."
                    value={ideaThesis}
                    onChange={(e) => setIdeaThesis(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" className="px-5 py-2 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold">
                    Persist Idea
                  </button>
                  <button type="button" onClick={() => setShowAddIdea(false)} className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                        {idea.format}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#414542]/50 text-[9px] font-mono-metrics text-[#C9B49B]">
                        {idea.status}
                      </span>
                    </div>
                    <h4 className="font-editorial text-lg text-[#EEE8DE]">{idea.title}</h4>
                    <div className="mt-3 p-3 rounded-xl bg-[#202221] border border-copper-subtle/50 text-xs text-[#EEE8DE]">
                      <span className="text-[#A16C50] font-semibold">HOOK: </span>
                      <span className="font-expressive italic">"{idea.hook}"</span>
                    </div>
                    <p className="mt-3 text-xs text-[#C9B49B]/90 leading-relaxed">
                      {idea.core_thesis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Scripts Desk */}
          <div className="pt-8 border-t border-copper-subtle">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE]">Production Scripts Desk</h3>
                <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
                  Timed verbal teleprompter scripts prepared for AI voiceover and video rendering.
                </p>
              </div>
              <button
                onClick={() => setShowAddScript(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Draft Script</span>
              </button>
            </div>

            {showAddScript && (
              <form onSubmit={handleCreateScript} className="p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4 mb-6">
                <h4 className="font-editorial text-lg text-[#EEE8DE]">Write Production Script</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                      Script Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Orion-9 Genesis Edition: 60s Reel"
                      value={scriptTitle}
                      onChange={(e) => setScriptTitle(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                      Target Duration (Seconds)
                    </label>
                    <input
                      type="number"
                      value={scriptDuration}
                      onChange={(e) => setScriptDuration(Number(e.target.value))}
                      className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Full Script Body (With scene markers)
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="[SCENE 1: Warm copper glow on obsidian sphere]&#10;Voice: You were told that marketing requires a 10-person agency. They were wrong.&#10;&#10;[SCENE 2: Fast cut to autonomous agent roster executing]&#10;Voice: Meet Prometheus-9."
                    value={scriptBody}
                    onChange={(e) => setScriptBody(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-xs font-mono-metrics text-[#EEE8DE]"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button type="submit" className="px-5 py-2 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold">
                    Persist Script
                  </button>
                  <button type="button" onClick={() => setShowAddScript(false)} className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {scripts.map((sc) => (
                <div key={sc.id} className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-editorial text-lg text-[#EEE8DE]">{sc.title}</span>
                      <span className="flex items-center gap-1 font-mono-metrics text-xs text-[#A16C50]">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{sc.target_duration_seconds}s</span>
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#414542]/40 text-[10px] font-mono-metrics text-[#C9B49B]">
                      {sc.status}
                    </span>
                  </div>
                  <pre className="font-mono-metrics text-xs text-[#EEE8DE]/80 bg-[#202221] p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed border border-copper-subtle/30">
                    {sc.script_body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: 05 MEDIA ASSETS */}
      {activeTab === 'assets' && (
        <div className="mt-8 space-y-6">
          <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
            <h3 className="font-editorial text-xl text-[#EEE8DE] mb-2">Secure Asset Repository</h3>
            <p className="font-expressive text-sm text-[#C9B49B] italic mb-4">
              Enforces magic-byte verification, SHA-256 deduplication, and streaming size protection.
            </p>

            <form onSubmit={handleUploadAsset} className="flex flex-wrap items-center gap-4">
              <input
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="text-xs text-[#EEE8DE] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-interface file:bg-[#A16C50] file:text-[#EEE8DE] hover:file:bg-[#B87C5E] cursor-pointer"
              />
              <select
                value={uploadAssetType}
                onChange={(e) => setUploadAssetType(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-xs text-[#EEE8DE]"
              >
                <option value="image">Image / Graphic</option>
                <option value="video">Video Clip</option>
                <option value="audio">Audio Voiceover</option>
              </select>
              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] font-semibold disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Brand Asset'}</span>
              </button>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((ast) => (
              <div key={ast.id} className="p-5 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                      {ast.asset_type}
                    </span>
                    <span className="font-mono-metrics text-[10px] text-[#C9B49B]">
                      {(ast.file_size_bytes / 1024).toFixed(1)} KB
                    </span>
                  </div>
                  <h4 className="font-interface text-sm font-semibold text-[#EEE8DE] truncate">{ast.filename}</h4>
                  <div className="font-mono-metrics text-[10px] text-[#C9B49B]/70 mt-1 truncate">
                    HASH: {ast.content_hash.slice(0, 16)}...
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-copper-subtle/30 flex items-center justify-between">
                  <a
                    href={`/api/v1/assets/${ast.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-[#A16C50] hover:underline"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleDeleteAsset(ast.id)}
                    className="text-[#C9B49B]/50 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: 06 MARKET & SOURCES */}
      {activeTab === 'intelligence' && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">Sources of Truth & Competitor Intel</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic mt-0.5">
                Verified documentation URLs and factual snippets that ground all autonomous operations.
              </p>
            </div>
            <button
              onClick={() => setShowAddSource(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Source</span>
            </button>
          </div>

          {showAddSource && (
            <form onSubmit={handleCreateSource} className="p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4 mb-6">
              <h4 className="font-editorial text-lg text-[#EEE8DE]">Register Verified Source</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Source Title
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Official Whitepaper / Landing Page"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/docs"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Verified Content Snippet
                </label>
                <textarea
                  rows={2}
                  placeholder="Key verified statements from this document."
                  value={sourceSnippet}
                  onChange={(e) => setSourceSnippet(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE]"
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="px-5 py-2 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold">
                  Save Source
                </button>
                <button type="button" onClick={() => setShowAddSource(false)} className="px-4 py-2 rounded-full border border-copper-subtle text-xs text-[#C9B49B]">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((src) => (
              <div key={src.id} className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                    {src.source_type}
                  </span>
                  {src.is_primary && (
                    <span className="font-mono-metrics text-[9px] text-emerald-400">PRIMARY</span>
                  )}
                </div>
                <h4 className="font-editorial text-lg text-[#EEE8DE]">{src.title}</h4>
                {src.source_url && (
                  <a href={src.source_url} target="_blank" rel="noreferrer" className="text-xs text-[#C9B49B] hover:text-[#EEE8DE] underline flex items-center gap-1 mt-1 truncate">
                    <span>{src.source_url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {src.content_snippet && (
                  <p className="mt-3 text-xs text-[#EEE8DE]/80 leading-relaxed bg-[#202221] p-3 rounded-xl border border-copper-subtle/30">
                    "{src.content_snippet}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
