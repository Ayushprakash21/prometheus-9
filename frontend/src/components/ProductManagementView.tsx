import React, { useState } from 'react';
import { 
  Product, 
  BrandProfile, 
  ProductFeature, 
  AudiencePersona, 
  ProductSource 
} from '../types';
import { 
  Layers, 
  Plus, 
  Search, 
  Edit3, 
  Archive, 
  Trash2, 
  CheckCircle2, 
  ShieldCheck, 
  Users, 
  Compass, 
  Save,
  Target,
  ExternalLink,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  createProduct, 
  updateProduct, 
  updateBrandProfile, 
  createFeature, 
  createAudience, 
  createSource 
} from '../services/api';

interface ProductManagementViewProps {
  products: Product[];
  selectedProduct: Product | null;
  features: ProductFeature[];
  brandProfile: BrandProfile | null;
  audiences: AudiencePersona[];
  sources: ProductSource[];
  onSelectProduct: (product: Product) => void;
  onRefresh: () => Promise<void>;
  initialSubTab?: 'products' | 'brand_profile' | 'audiences' | 'features' | 'sources' | 'strategy';
}

export const ProductManagementView: React.FC<ProductManagementViewProps> = ({
  products,
  selectedProduct,
  features,
  brandProfile,
  audiences,
  sources,
  onSelectProduct,
  onRefresh,
  initialSubTab = 'products'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialSubTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal / Drawer States
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductDrawer, setShowEditProductDrawer] = useState(false);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [showAddAudienceModal, setShowAddAudienceModal] = useState(false);
  const [showAddSourceModal, setShowAddSourceModal] = useState(false);

  // Form States: New Product
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Autonomous AI / SaaS');
  const [newProdTagline, setNewProdTagline] = useState('');
  const [newProdWebsite, setNewProdWebsite] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdObjective, setNewProdObjective] = useState('Autonomous marketing and customer acquisition');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form States: Edit Brand Profile
  const [toneOfVoice, setToneOfVoice] = useState(brandProfile?.tone_of_voice || 'Professional, authoritative, and direct');
  const [primaryColor, setPrimaryColor] = useState(brandProfile?.primary_color || '#202221');
  const [accentColor, setAccentColor] = useState(brandProfile?.accent_color || '#A16C50');
  const [missionStatement, setMissionStatement] = useState(brandProfile?.mission_statement || '');
  const [bannedClaims, setBannedClaims] = useState(brandProfile?.do_not_mention_claims?.join('\n') || '');
  const [mandatoryDisclaimers, setMandatoryDisclaimers] = useState(brandProfile?.mandatory_disclaimers?.join('\n') || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSavedMsg, setProfileSavedMsg] = useState(false);

  // Form States: New Feature
  const [featureName, setFeatureName] = useState('');
  const [featureDesc, setFeatureDesc] = useState('');
  const [featureBenefit, setFeatureBenefit] = useState('');

  // Form States: New Audience Persona
  const [audienceName, setAudienceName] = useState('');
  const [audienceDesc, setAudienceDesc] = useState('');
  const [audiencePainPoints, setAudiencePainPoints] = useState('');

  // Form States: New Source
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceType, setSourceType] = useState('documentation');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceSnippet, setSourceSnippet] = useState('');

  // Handle Add Product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    setIsSubmitting(true);
    try {
      const p = await createProduct({
        name: newProdName,
        category: newProdCategory,
        tagline: newProdTagline || undefined,
        description: newProdDescription || undefined,
        website_url: newProdWebsite || undefined,
        primary_objective: newProdObjective
      });
      setNewProdName('');
      setNewProdTagline('');
      setNewProdWebsite('');
      setNewProdDescription('');
      setShowAddProductModal(false);
      await onRefresh();
      onSelectProduct(p);
    } catch (err: any) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Save Brand Profile
  const handleSaveBrandProfile = async () => {
    if (!selectedProduct) return;
    setIsSavingProfile(true);
    try {
      const parsedBanned = bannedClaims.split('\n').map(s => s.trim()).filter(Boolean);
      const parsedDisclaimers = mandatoryDisclaimers.split('\n').map(s => s.trim()).filter(Boolean);

      await updateBrandProfile(selectedProduct.id, {
        tone_of_voice: toneOfVoice,
        primary_color: primaryColor,
        accent_color: accentColor,
        mission_statement: missionStatement || undefined,
        do_not_mention_claims: parsedBanned,
        mandatory_disclaimers: parsedDisclaimers
      });
      await onRefresh();
      setProfileSavedMsg(true);
      setTimeout(() => setProfileSavedMsg(false), 3000);
    } catch (err: any) {
      alert(`Failed to update brand profile: ${err.message}`);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Handle Add Feature
  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !featureName.trim()) return;
    try {
      await createFeature(selectedProduct.id, {
        name: featureName,
        description: featureDesc,
        benefit_statement: featureBenefit || undefined,
        is_verified: true
      });
      setFeatureName('');
      setFeatureDesc('');
      setFeatureBenefit('');
      setShowAddFeatureModal(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add feature: ${err.message}`);
    }
  };

  // Handle Add Audience
  const handleCreateAudience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !audienceName.trim()) return;
    try {
      const painPoints = audiencePainPoints.split('\n').map(s => s.trim()).filter(Boolean);
      await createAudience(selectedProduct.id, {
        name: audienceName,
        description: audienceDesc,
        pain_points: painPoints,
        aspirations: ['Scalability', 'Productivity'],
        channels: ['YouTube', 'LinkedIn', 'X']
      });
      setAudienceName('');
      setAudienceDesc('');
      setAudiencePainPoints('');
      setShowAddAudienceModal(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add audience persona: ${err.message}`);
    }
  };

  // Handle Add Source
  const handleCreateSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || !sourceTitle.trim()) return;
    try {
      await createSource(selectedProduct.id, {
        title: sourceTitle,
        source_type: sourceType,
        source_url: sourceUrl || undefined,
        content_snippet: sourceSnippet || undefined,
        is_primary: true
      });
      setSourceTitle('');
      setSourceUrl('');
      setSourceSnippet('');
      setShowAddSourceModal(false);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to add source: ${err.message}`);
    }
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="space-y-6 pb-16">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">Business & Product Registry</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Manage your registered products, brand profiles, audience personas, and verified capabilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#414542] pb-px no-scrollbar">
        {[
          { id: 'products', label: 'Products & Services', count: products.length, icon: Layers },
          { id: 'brand_profile', label: 'Brand Profile & Voice', icon: ShieldCheck },
          { id: 'audiences', label: 'Audience Personas', count: audiences.length, icon: Users },
          { id: 'features', label: 'Verified Capabilities', count: features.length, icon: Target },
          { id: 'sources', label: 'Sources of Truth', count: sources.length, icon: Compass },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#A16C50] text-[#A16C50] font-semibold'
                  : 'border-transparent text-[#B8B0A5] hover:text-[#EEE8DE]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#B8B0A5]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PRODUCTS & SERVICES TABLE */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B0A5]" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#414542] bg-[#202221]/50 text-[10px] font-mono-metrics uppercase text-[#B8B0A5]">
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Features</th>
                  <th className="py-3 px-4">Website</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#414542]/50">
                {filteredProducts.map((p) => {
                  const isSelected = selectedProduct?.id === p.id;
                  return (
                    <tr key={p.id} className={`hover:bg-[#303430]/40 transition-colors ${isSelected ? 'bg-[#303430]/30' : ''}`}>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-[#EEE8DE] flex items-center gap-2">
                          <span>{p.name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />}
                        </div>
                        <div className="text-[11px] text-[#B8B0A5] truncate max-w-xs">{p.tagline}</div>
                      </td>
                      <td className="py-3 px-4 text-[#B8B0A5]">{p.category}</td>
                      <td className="py-3 px-4 font-mono-metrics text-[#C9B49B]">{p.features_count || 0} registered</td>
                      <td className="py-3 px-4">
                        {p.website_url ? (
                          <a href={p.website_url} target="_blank" rel="noreferrer" className="text-[#A16C50] hover:underline flex items-center gap-1">
                            <span>Visit</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[#B8B0A5]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#202221] text-emerald-400 border border-emerald-500/30">
                          ACTIVE
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectProduct(p)}
                          className="px-2.5 py-1 rounded bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-[#EEE8DE] text-xs transition-colors cursor-pointer"
                        >
                          Select Active
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: BRAND PROFILE & VOICE */}
      {activeTab === 'brand_profile' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#414542] pb-4">
            <div>
              <h3 className="text-base font-semibold text-[#EEE8DE]">
                Brand Profile: {selectedProduct?.name || 'Selected Product'}
              </h3>
              <p className="text-xs text-[#B8B0A5] mt-0.5">
                Defines the tone, colors, and zero-hallucination boundaries for all creative generation.
              </p>
            </div>
            <button
              onClick={handleSaveBrandProfile}
              disabled={isSavingProfile}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>

          {profileSavedMsg && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Brand profile saved and synchronized with all autonomous agents.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono-metrics uppercase text-[#B8B0A5] mb-1">
                Tone of Voice
              </label>
              <input
                type="text"
                value={toneOfVoice}
                onChange={(e) => setToneOfVoice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
              <span className="text-[10px] text-[#B8B0A5] mt-1 block">
                Directs scriptwriters and social caption generators.
              </span>
            </div>

            <div>
              <label className="block text-xs font-mono-metrics uppercase text-[#B8B0A5] mb-1">
                Mission Statement
              </label>
              <input
                type="text"
                value={missionStatement}
                onChange={(e) => setMissionStatement(e.target.value)}
                placeholder="Core purpose of the business"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono-metrics uppercase text-[#A16C50] mb-1">
                Zero-Hallucination Claim Filter (Prohibited Claims - One per line)
              </label>
              <textarea
                rows={4}
                value={bannedClaims}
                onChange={(e) => setBannedClaims(e.target.value)}
                placeholder="Statements agents must NEVER make"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs font-mono-metrics text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono-metrics uppercase text-[#B8B0A5] mb-1">
                Mandatory Legal Disclaimers (One per line)
              </label>
              <textarea
                rows={4}
                value={mandatoryDisclaimers}
                onChange={(e) => setMandatoryDisclaimers(e.target.value)}
                placeholder="Disclaimers appended to publishing packages"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs font-mono-metrics text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIENCE PERSONAS */}
      {activeTab === 'audiences' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Audience Personas</h3>
              <p className="text-[11px] text-[#B8B0A5]">Customer segments that script hooks and marketing hooks address</p>
            </div>
            <button
              onClick={() => setShowAddAudienceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Persona</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {audiences.map((aud) => (
              <div key={aud.id} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#EEE8DE]">{aud.name}</span>
                  <span className="text-[10px] font-mono-metrics text-[#C9B49B]">{aud.channels?.join(', ')}</span>
                </div>
                <p className="text-xs text-[#B8B0A5] leading-relaxed">{aud.description}</p>
                {aud.pain_points && aud.pain_points.length > 0 && (
                  <div className="pt-2 border-t border-[#414542] space-y-1">
                    <span className="text-[10px] font-mono-metrics text-[#A16C50] uppercase">Pain Points:</span>
                    <ul className="text-xs text-[#EEE8DE] space-y-0.5">
                      {aud.pain_points.map((pt, idx) => (
                        <li key={idx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-[#A16C50]" />
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: VERIFIED CAPABILITIES */}
      {activeTab === 'features' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Verified Product Capabilities</h3>
              <p className="text-[11px] text-[#B8B0A5]">Capabilities verified by software contracts that agents can reference</p>
            </div>
            <button
              onClick={() => setShowAddFeatureModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Capability</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feat) => (
              <div key={feat.id} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-[#EEE8DE]">{feat.name}</span>
                  <span className="text-[10px] font-mono-metrics text-emerald-400">✓ VERIFIED</span>
                </div>
                <p className="text-xs text-[#B8B0A5] leading-relaxed">{feat.description}</p>
                {feat.benefit_statement && (
                  <div className="p-2 rounded bg-[#202221] text-xs italic text-[#C9B49B]">
                    "{feat.benefit_statement}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: SOURCES OF TRUTH */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Sources of Truth & Documentation</h3>
              <p className="text-[11px] text-[#B8B0A5]">Whitepapers, API docs, and factual repositories grounding research</p>
            </div>
            <button
              onClick={() => setShowAddSourceModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Source</span>
            </button>
          </div>

          <div className="space-y-3">
            {sources.map((src) => (
              <div key={src.id} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#EEE8DE]">{src.title}</div>
                  {src.source_url && (
                    <a href={src.source_url} target="_blank" rel="noreferrer" className="text-xs text-[#A16C50] hover:underline flex items-center gap-1 mt-0.5">
                      <span>{src.source_url}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {src.content_snippet && (
                    <div className="text-xs text-[#B8B0A5] mt-1 line-clamp-1">"{src.content_snippet}"</div>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#C9B49B] uppercase">
                  {src.source_type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD PRODUCT */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Register New Product</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orion-9"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Category</label>
                  <input
                    type="text"
                    value={newProdCategory}
                    onChange={(e) => setNewProdCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={newProdWebsite}
                    onChange={(e) => setNewProdWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="Brief high-impact descriptor"
                  value={newProdTagline}
                  onChange={(e) => setNewProdTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Product Description</label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive description of product capabilities"
                  value={newProdDescription}
                  onChange={(e) => setNewProdDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5] hover:text-[#EEE8DE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] disabled:opacity-50"
                >
                  {isSubmitting ? 'Registering...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD FEATURE */}
      {showAddFeatureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Add Verified Capability</h3>
              <button onClick={() => setShowAddFeatureModal(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Feature Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Automated Resume Parsing"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Customer Benefit</label>
                <input
                  type="text"
                  placeholder="e.g. Saves 15 hours per week of manual data entry"
                  value={featureBenefit}
                  onChange={(e) => setFeatureBenefit(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Technical Boundary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Verified proof of operation"
                  value={featureDesc}
                  onChange={(e) => setFeatureDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddFeatureModal(false)} className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#A16C50] text-xs font-semibold text-[#EEE8DE]">
                  Save Feature
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD AUDIENCE */}
      {showAddAudienceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Define Audience Persona</h3>
              <button onClick={() => setShowAddAudienceModal(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAudience} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Persona Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Technical Founder"
                  value={audienceName}
                  onChange={(e) => setAudienceName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solo engineering leads needing inbound pipeline"
                  value={audienceDesc}
                  onChange={(e) => setAudienceDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Critical Pain Points (One per line)</label>
                <textarea
                  rows={2}
                  placeholder="Lacks time for social content"
                  value={audiencePainPoints}
                  onChange={(e) => setAudiencePainPoints(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddAudienceModal(false)} className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#A16C50] text-xs font-semibold text-[#EEE8DE]">
                  Save Persona
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD SOURCE */}
      {showAddSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Register Source of Truth</h3>
              <button onClick={() => setShowAddSourceModal(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateSource} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Source Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Official Technical Whitepaper"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Source URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/docs"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Verified Snippet</label>
                <textarea
                  rows={2}
                  placeholder="Factual text excerpt"
                  value={sourceSnippet}
                  onChange={(e) => setSourceSnippet(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddSourceModal(false)} className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-[#A16C50] text-xs font-semibold text-[#EEE8DE]">
                  Save Source
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
