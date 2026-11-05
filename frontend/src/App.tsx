import React, { useState, useEffect } from "react";
import { 
  Product, 
  BrandProfile,
  ProductFeature,
  AudiencePersona,
  ProductSource,
  Campaign,
  ContentIdea,
  Script,
  MediaAsset,
  SpecialistAgent, 
  SocialAccount, 
  PublicationRecord,
  SystemHealth,
  AgentRun,
  NavTab 
} from "./types";
import { 
  fetchProducts, 
  fetchHealth, 
  fetchAgentRoster, 
  fetchAgentRuns,
  fetchSocialAccounts, 
  fetchPublications,
  fetchFeatures,
  fetchBrandProfile,
  fetchAudiences,
  fetchSources,
  fetchCampaigns,
  fetchIdeas,
  fetchScripts,
  fetchAssets,
  createProduct,
  pauseAutonomousEngine,
  resumeAutonomousEngine
} from "./services/api";

import { AppHeader } from "./components/AppHeader";
import { AppSidebar } from "./components/AppSidebar";
import { OverviewPage } from "./components/OverviewPage";
import { ProductManagementView } from "./components/ProductManagementView";
import { AgentManagementView } from "./components/AgentManagementView";
import { SocialAccountsView } from "./components/SocialAccountsView";
import { CreativeStudioView } from "./components/CreativeStudioView";
import { AdministrationView } from "./components/AdministrationView";

import { AlertCircle, X, Sparkles } from "lucide-react";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Application Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [features, setFeatures] = useState<ProductFeature[]>([]);
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [audiences, setAudiences] = useState<AudiencePersona[]>([]);
  const [sources, setSources] = useState<ProductSource[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [agents, setAgents] = useState<SpecialistAgent[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Status & Telemetry
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState<boolean>(false);

  // Global Quick Add Product Modal
  const [showGlobalAddProduct, setShowGlobalAddProduct] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickCategory, setQuickCategory] = useState('Autonomous AI / SaaS');
  const [quickTagline, setQuickTagline] = useState('');
  const [quickWebsite, setQuickWebsite] = useState('');
  const [quickObjective, setQuickObjective] = useState('Autonomous growth and conversion');
  const [isCreatingQuick, setIsCreatingQuick] = useState(false);

  const loadInitialData = async () => {
    try {
      let authReq = false;
      let connErr: string | null = null;

      const healthData = await fetchHealth().catch(() => {
        connErr = "PROMETHEUS-9 Core Engine backend unreachable.";
        return null;
      });

      const prodsData = await fetchProducts().catch((err: any) => {
        if (err?.message === "AUTHENTICATION_REQUIRED") authReq = true;
        return [];
      });

      const agentData = await fetchAgentRoster().catch((err: any) => {
        if (err?.message === "AUTHENTICATION_REQUIRED") authReq = true;
        return { is_autonomous_paused: false, agents: [] };
      });

      const accountsData = await fetchSocialAccounts().catch(() => []);
      const pubsData = await fetchPublications().catch(() => []);

      setConnectionError(connErr);
      setAuthRequired(authReq);
      setProducts(prodsData);
      setHealth(healthData);
      setAgents(agentData.agents);
      setIsPaused(agentData.is_autonomous_paused);
      setSocialAccounts(accountsData);
      setPublications(pubsData);

      if (!selectedProduct && prodsData.length > 0) {
        setSelectedProduct(prodsData[0]);
      }
    } catch (e) {
      console.error("Initial load failed", e);
    } finally {
      setLoading(false);
    }
  };

  const loadProductResources = async (prodId: string) => {
    try {
      const [
        featData,
        bpData,
        audData,
        srcData,
        campData,
        ideaData,
        scriptData,
        assetData,
        runsData
      ] = await Promise.all([
        fetchFeatures(prodId).catch(() => []),
        fetchBrandProfile(prodId).catch(() => null),
        fetchAudiences(prodId).catch(() => []),
        fetchSources(prodId).catch(() => []),
        fetchCampaigns(prodId).catch(() => []),
        fetchIdeas(prodId).catch(() => []),
        fetchScripts(prodId).catch(() => []),
        fetchAssets(prodId).catch(() => []),
        fetchAgentRuns(prodId).catch(() => [])
      ]);

      setFeatures(featData);
      setBrandProfile(bpData);
      setAudiences(audData);
      setSources(srcData);
      setCampaigns(campData);
      setIdeas(ideaData);
      setScripts(scriptData);
      setAssets(assetData);
      setAgentRuns(runsData);
    } catch (e) {
      console.error("Failed to load product sub-resources", e);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductResources(selectedProduct.id);
    }
  }, [selectedProduct?.id]);

  const handleToggleEmergencyPause = async () => {
    try {
      if (isPaused) {
        const res = await resumeAutonomousEngine();
        setIsPaused(res.is_paused);
      } else {
        const res = await pauseAutonomousEngine();
        setIsPaused(res.is_paused);
      }
    } catch (e) {
      console.error("Emergency toggle failed", e);
    }
  };

  const handleCreateQuickProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    setIsCreatingQuick(true);
    try {
      const prod = await createProduct({
        name: quickName,
        category: quickCategory,
        tagline: quickTagline || undefined,
        website_url: quickWebsite || undefined,
        primary_objective: quickObjective
      });
      setQuickName('');
      setQuickTagline('');
      setQuickWebsite('');
      setShowGlobalAddProduct(false);
      await loadInitialData();
      setSelectedProduct(prod);
      setActiveTab('products');
    } catch (err: any) {
      alert(`Failed to add product: ${err.message}`);
    } finally {
      setIsCreatingQuick(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#202221] text-[#EEE8DE] flex flex-col font-sans selection:bg-[#A16C50]/30 selection:text-[#EEE8DE]">
      {/* Top Application Navigation Bar */}
      <AppHeader
        products={products}
        selectedProduct={selectedProduct}
        onSelectProduct={(p) => setSelectedProduct(p)}
        onOpenAddProduct={() => setShowGlobalAddProduct(true)}
        health={health}
        isPaused={isPaused}
        onTogglePause={handleToggleEmergencyPause}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
      />

      {/* Main Body Shell: Sidebar + Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <AppSidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          collapsed={sidebarCollapsed}
          onToggleCollapsed={() => setSidebarCollapsed(!sidebarCollapsed)}
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
          productCount={products.length}
          agentCount={agents.length}
          campaignCount={campaigns.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          {/* Offline / Auth Notice Banners */}
          {connectionError && (
            <div className="mb-6 p-3.5 rounded-lg bg-[#292C29] border border-[#A16C50] flex items-center justify-between text-xs text-[#EEE8DE]">
              <div className="flex items-center gap-2.5">
                <span className="font-semibold text-[#A16C50] uppercase font-mono-metrics">Backend Offline</span>
                <span className="text-[#B8B0A5]">{connectionError}</span>
              </div>
              <span className="text-[10px] font-mono-metrics text-[#C9B49B]">LOCAL CACHED MODE</span>
            </div>
          )}

          {authRequired && (
            <div className="mb-6 p-3.5 rounded-lg bg-amber-950/30 border border-amber-600/40 flex items-center justify-between text-xs text-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Development session active with local authorization passthrough.</span>
              </div>
              <span className="text-[10px] font-mono-metrics text-amber-400 uppercase">AUTH PASSTHROUGH</span>
            </div>
          )}

          {/* ACTIVE VIEW ROUTING */}
          {activeTab === 'overview' && (
            <OverviewPage
              products={products}
              campaigns={campaigns}
              agents={agents}
              socialAccounts={socialAccounts}
              publications={publications}
              agentRuns={agentRuns}
              isPaused={isPaused}
              onNavigate={setActiveTab}
              onOpenAddProduct={() => setShowGlobalAddProduct(true)}
              onSelectProduct={setSelectedProduct}
              selectedProduct={selectedProduct}
            />
          )}

          {activeTab === 'workspace' && (
            <OverviewPage
              products={products}
              campaigns={campaigns}
              agents={agents}
              socialAccounts={socialAccounts}
              publications={publications}
              agentRuns={agentRuns}
              isPaused={isPaused}
              onNavigate={setActiveTab}
              onOpenAddProduct={() => setShowGlobalAddProduct(true)}
              onSelectProduct={setSelectedProduct}
              selectedProduct={selectedProduct}
            />
          )}

          {(activeTab === 'products' || activeTab === 'brand_profile' || activeTab === 'audiences' || activeTab === 'strategy') && (
            <ProductManagementView
              products={products}
              selectedProduct={selectedProduct}
              features={features}
              brandProfile={brandProfile}
              audiences={audiences}
              sources={sources}
              onSelectProduct={setSelectedProduct}
              onRefresh={async () => {
                await loadInitialData();
                if (selectedProduct) await loadProductResources(selectedProduct.id);
              }}
              initialSubTab={
                activeTab === 'brand_profile' ? 'brand_profile' :
                activeTab === 'audiences' ? 'audiences' :
                activeTab === 'strategy' ? 'features' : 'products'
              }
            />
          )}

          {(activeTab === 'market_research' || activeTab === 'competitors' || activeTab === 'analytics') && (
            <ProductManagementView
              products={products}
              selectedProduct={selectedProduct}
              features={features}
              brandProfile={brandProfile}
              audiences={audiences}
              sources={sources}
              onSelectProduct={setSelectedProduct}
              onRefresh={async () => {
                await loadInitialData();
                if (selectedProduct) await loadProductResources(selectedProduct.id);
              }}
              initialSubTab="sources"
            />
          )}

          {(activeTab === 'agents' || activeTab === 'agent_config' || activeTab === 'automation_rules' || activeTab === 'autonomy') && (
            <AgentManagementView
              agents={agents}
              runs={agentRuns}
              isPaused={isPaused}
              onRefresh={loadInitialData}
              initialTab={
                activeTab === 'agent_config' ? 'configuration' :
                activeTab === 'automation_rules' ? 'automation_rules' :
                activeTab === 'autonomy' ? 'autonomy' : 'directory'
              }
            />
          )}

          {(activeTab === 'content_studio' || activeTab === 'video_production' || activeTab === 'asset_library') && (
            <CreativeStudioView
              product={selectedProduct}
              campaigns={campaigns}
              ideas={ideas}
              scripts={scripts}
              assets={assets}
              onRefresh={async () => {
                if (selectedProduct) await loadProductResources(selectedProduct.id);
              }}
              initialTab={
                activeTab === 'video_production' ? 'video' :
                activeTab === 'asset_library' ? 'assets' : 'content'
              }
            />
          )}

          {(activeTab === 'social_accounts' || activeTab === 'publishing_centre' || activeTab === 'publishing_calendar') && (
            <SocialAccountsView
              accounts={socialAccounts}
              publications={publications}
              campaigns={campaigns}
              selectedProduct={selectedProduct}
              onRefresh={loadInitialData}
              initialTab={
                activeTab === 'publishing_centre' ? 'centre' :
                activeTab === 'publishing_calendar' ? 'calendar' : 'accounts'
              }
            />
          )}

          {(activeTab === 'team' || activeTab === 'settings' || activeTab === 'audit_logs') && (
            <AdministrationView
              health={health}
              initialTab={
                activeTab === 'settings' ? 'settings' :
                activeTab === 'audit_logs' ? 'audit_logs' : 'team'
              }
            />
          )}
        </main>
      </div>

      {/* GLOBAL MODAL: ADD PRODUCT */}
      {showGlobalAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#292C29] border border-[#414542] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#414542] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#A16C50]" />
                <h3 className="text-sm font-semibold text-[#EEE8DE]">Register New Product</h3>
              </div>
              <button onClick={() => setShowGlobalAddProduct(false)} className="text-[#B8B0A5] hover:text-[#EEE8DE]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Product Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orion-9"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Category</label>
                  <input
                    type="text"
                    value={quickCategory}
                    onChange={(e) => setQuickCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Website URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={quickWebsite}
                    onChange={(e) => setQuickWebsite(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Tagline</label>
                <input
                  type="text"
                  placeholder="Brief high-impact product descriptor"
                  value={quickTagline}
                  onChange={(e) => setQuickTagline(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Strategic Objective</label>
                <input
                  type="text"
                  value={quickObjective}
                  onChange={(e) => setQuickObjective(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGlobalAddProduct(false)}
                  className="px-4 py-2 rounded-lg border border-[#414542] text-xs text-[#B8B0A5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuick}
                  className="px-5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] disabled:opacity-50"
                >
                  {isCreatingQuick ? 'Registering...' : 'Register Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
