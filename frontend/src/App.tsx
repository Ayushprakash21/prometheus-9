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

// Newly Integrated Autonomous Desk Views
import { OnboardingWizardModal } from "./components/OnboardingWizardModal";
import { ApprovalCentreView } from "./components/ApprovalCentreView";
import { MarketingIntelligenceView } from "./components/MarketingIntelligenceView";
import { VideoProductionView } from "./components/VideoProductionView";
import { AIProviderConfigView } from "./components/AIProviderConfigView";
import { PerformanceAnalyticsView } from "./components/PerformanceAnalyticsView";
import { WorkspaceView } from "./components/WorkspaceView";
import { ActivityCentreView } from "./components/ActivityCentreView";

import { AlertCircle, X, Sparkles, KeyRound } from "lucide-react";
import { FlowSignIn } from "./components/FlowSignIn";
import { getAuthToken, setAuthToken, clearAuthToken, fetchCurrentUser, logoutUser } from "./services/api";
import { useTheme } from "./context/ThemeContext";

export const App: React.FC = () => {
  const { isDark } = useTheme();
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

  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => !!getAuthToken());
  const [isLoginRoute, setIsLoginRoute] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname === "/login" || !getAuthToken();
    }
    return false;
  });
  const [showChangePasswordModal, setShowChangePasswordModal] = useState<boolean>(false);
  const [modalOldPassword, setModalOldPassword] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalConfirmPassword, setModalConfirmPassword] = useState("");
  const [modalPasswordError, setModalPasswordError] = useState<string | null>(null);
  const [modalPasswordSubmitting, setModalPasswordSubmitting] = useState(false);

  // Status & Telemetry
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState<boolean>(false);

  // Global Onboarding Wizard Modal
  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);

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

      const agentsData = await fetchAgentRoster().then(r => r.agents).catch(() => []);
      const runsData = await fetchAgentRuns().catch(() => []);
      const socialData = await fetchSocialAccounts().catch(() => []);
      const pubsData = await fetchPublications().catch(() => []);

      setHealth(healthData);
      setProducts(prodsData);
      setAgents(agentsData);
      setAgentRuns(runsData);
      setSocialAccounts(socialData);
      setPublications(pubsData);
      setAuthRequired(authReq);
      setConnectionError(connErr);

      if (healthData) {
        setIsPaused(healthData.autonomous_scheduler.is_paused);
      }

      if (prodsData.length > 0 && !selectedProduct) {
        const defaultProd = prodsData.find(p => p.slug === 'orion-9') || prodsData[0];
        setSelectedProduct(defaultProd);
        await loadProductResources(defaultProd.id);
      }
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      setLoading(false);
    }
  };

  const loadProductResources = async (productId: string) => {
    try {
      const [feat, brand, aud, src, camp, ide, scr, ass] = await Promise.all([
        fetchFeatures(productId).catch(() => []),
        fetchBrandProfile(productId).catch(() => null),
        fetchAudiences(productId).catch(() => []),
        fetchSources(productId).catch(() => []),
        fetchCampaigns(productId).catch(() => []),
        fetchIdeas(productId).catch(() => []),
        fetchScripts(productId).catch(() => []),
        fetchAssets(productId).catch(() => [])
      ]);
      setFeatures(feat);
      setBrandProfile(brand);
      setAudiences(aud);
      setSources(src);
      setCampaigns(camp);
      setIdeas(ide);
      setScripts(scr);
      setAssets(ass);
    } catch (err) {
      console.error("Failed to load product resources:", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      const token = getAuthToken();
      if (!token) {
        setIsAuthenticated(false);
        setIsLoginRoute(true);
        setLoading(false);
        return;
      }
      try {
        const user = await fetchCurrentUser();
        setCurrentUser(user);
        setIsAuthenticated(true);
        if (typeof window !== "undefined" && window.location.pathname === "/login") {
          window.history.pushState({}, "", "/");
          setIsLoginRoute(false);
        }
        await loadInitialData();
      } catch (err: any) {
        if (err?.message === "AUTHENTICATION_REQUIRED") {
          clearAuthToken();
          setIsAuthenticated(false);
          setIsLoginRoute(true);
        } else {
          await loadInitialData();
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleLoginSuccess = async (token: string, user: any) => {
    setAuthToken(token);
    setCurrentUser(user);
    setIsAuthenticated(true);
    setIsLoginRoute(false);
    if (typeof window !== "undefined" && window.location.pathname === "/login") {
      window.history.pushState({}, "", "/");
    }
    await loadInitialData();
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsAuthenticated(false);
    setIsLoginRoute(true);
    if (typeof window !== "undefined") {
      window.history.pushState({}, "", "/login");
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modalPasswordSubmitting) return;
    setModalPasswordError(null);

    if (modalNewPassword.length < 6) {
      setModalPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (modalNewPassword !== modalConfirmPassword) {
      setModalPasswordError("Passwords do not match.");
      return;
    }
    if (modalNewPassword === modalOldPassword) {
      setModalPasswordError("New password must be different from current password.");
      return;
    }

    setModalPasswordSubmitting(true);
    try {
      const token = getAuthToken();
      const res = await fetch("/api/v1/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: modalOldPassword,
          new_password: modalNewPassword
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || "Failed to update password.");
      }
      if (data.access_token) {
        setAuthToken(data.access_token);
      }
      setShowChangePasswordModal(false);
      setModalOldPassword("");
      setModalNewPassword("");
      setModalConfirmPassword("");
    } catch (err: any) {
      setModalPasswordError(err.message || "Failed to update password.");
    } finally {
      setModalPasswordSubmitting(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    setSelectedProduct(product);
    await loadProductResources(product.id);
  };

  const handleTogglePause = async () => {
    try {
      if (isPaused) {
        await resumeAutonomousEngine();
        setIsPaused(false);
      } else {
        await pauseAutonomousEngine();
        setIsPaused(true);
      }
      const updatedHealth = await fetchHealth().catch(() => null);
      if (updatedHealth) setHealth(updatedHealth);
    } catch (err) {
      console.error("Scheduler pause toggle failed:", err);
    }
  };

  const handleCreateQuickProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickName.trim()) return;
    setIsCreatingQuick(true);
    try {
      const newProd = await createProduct({
        name: quickName.trim(),
        category: quickCategory,
        tagline: quickTagline.trim() || undefined,
        website_url: quickWebsite.trim() || undefined,
        primary_objective: quickObjective.trim()
      });
      setProducts(prev => [newProd, ...prev]);
      setSelectedProduct(newProd);
      await loadProductResources(newProd.id);
      setShowGlobalAddProduct(false);
      setQuickName('');
      setQuickTagline('');
      setQuickWebsite('');
    } catch (err) {
      console.error("Failed to create product:", err);
    } finally {
      setIsCreatingQuick(false);
    }
  };

  const handleCompleteOnboarding = async (data: any) => {
    try {
      const newProd = await createProduct({
        name: data.name,
        category: data.category,
        tagline: data.tagline,
        website_url: data.website_url,
        primary_objective: data.primary_objective
      });
      setProducts(prev => [newProd, ...prev]);
      setSelectedProduct(newProd);
      await loadProductResources(newProd.id);
      setActiveTab('workspace');
    } catch (e) {
      console.error("Error launching onboarded product:", e);
    }
  };

  // If on login route or unauthenticated, display FlowSignIn experience
  if (isLoginRoute || !isAuthenticated) {
    return <FlowSignIn onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors selection:bg-[#B99A78]/30 ${isDark ? "bg-[#111211] text-[#F5F2EB]" : "bg-[#F7F7F5] text-[#262724]"}`}>

      {/* Top Header */}
      <AppHeader
        products={products}
        selectedProduct={selectedProduct}
        onSelectProduct={handleSelectProduct}
        onOpenAddProduct={() => setShowGlobalAddProduct(true)}
        onOpenOnboarding={() => setShowOnboardingWizard(true)}
        health={health}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
      />

      {/* Main Container */}
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
          pendingApprovalsCount={2}
        />

        {/* Dynamic Main Workspace Content */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar transition-colors ${isDark ? "bg-[#111211]" : "bg-[#F7F7F5]"} ${["products", "brand_profile", "audiences", "features", "sources", "marketing_objectives", "competitors"].includes(activeTab) ? "p-0" : "p-4 sm:p-5 lg:p-6 space-y-6"}`}>
          {/* Status Alert if Backend is in Demo/Disconnected State */}
          {connectionError && (
            <div className={`p-4 rounded-xl border flex items-center justify-between text-[13.5px] font-medium transition-colors ${
              isDark 
                ? 'bg-amber-950/40 border-amber-600/50 text-amber-200' 
                : 'bg-[#FFF4D6] border-[#E6C878] text-[#654B16]'
            }`}>
              <div className="flex items-center gap-2.5">
                <AlertCircle className={`w-5 h-5 shrink-0 ${isDark ? 'text-amber-400' : 'text-[#946B18]'}`} />
                <span>Operating in Autonomous Client-Side Edge Mode ({connectionError})</span>
              </div>
              <button 
                onClick={() => setConnectionError(null)} 
                className={`p-1 rounded-md transition-colors ${
                  isDark ? 'text-amber-300 hover:text-white' : 'text-[#654B16] hover:bg-[#E6C878]/30'
                }`}
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* VIEW ROUTING (All 37 Views handled seamlessly) */}
          {activeTab === 'overview' && (
            <OverviewPage
              products={products}
              selectedProduct={selectedProduct}
              campaigns={campaigns}
              agents={agents}
              socialAccounts={socialAccounts}
              publications={publications}
              agentRuns={agentRuns}
              isPaused={isPaused}
              onNavigate={setActiveTab}
              onOpenAddProduct={() => setShowGlobalAddProduct(true)}
              onSelectProduct={handleSelectProduct}
            />
          )}

          {activeTab === 'workspace' && (
            <WorkspaceView
              selectedProduct={selectedProduct}
              onNavigate={setActiveTab}
              onOpenOnboarding={() => setShowOnboardingWizard(true)}
            />
          )}

          {activeTab === 'activity_centre' && (
            <ActivityCentreView />
          )}

          {(activeTab === 'products' || activeTab === 'brand_profile' || activeTab === 'audiences' || activeTab === 'marketing_objectives' || activeTab === 'competitors') && (
            <ProductManagementView
              products={products}
              selectedProduct={selectedProduct}
              features={features}
              brandProfile={brandProfile}
              audiences={audiences}
              sources={sources}
              onSelectProduct={handleSelectProduct}
              onRefresh={async () => {
                if (selectedProduct) await loadProductResources(selectedProduct.id);
                const updatedProds = await fetchProducts().catch(() => []);
                setProducts(updatedProds);
              }}
              initialSubTab={
                activeTab === 'brand_profile' ? 'brand_profile' :
                activeTab === 'audiences' ? 'audiences' :
                activeTab === 'marketing_objectives' ? 'strategy' :
                activeTab === 'competitors' ? 'sources' : 'products'
              }
            />
          )}

          {(activeTab === 'market_research' || activeTab === 'trend_intelligence' || activeTab === 'seo_intelligence' || activeTab === 'strategy' || activeTab === 'growth_opportunities') && (
            <MarketingIntelligenceView
              selectedProduct={selectedProduct}
              activeSubSection={activeTab as any}
            />
          )}

          {(activeTab === 'agents' || activeTab === 'agent_config' || activeTab === 'agent_history' || activeTab === 'automation_rules' || activeTab === 'autonomy') && (
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

          {activeTab === 'approval_centre' && (
            <ApprovalCentreView />
          )}

          {(activeTab === 'content_studio' || activeTab === 'image_studio' || activeTab === 'asset_library' || activeTab === 'brand_compliance') && (
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
                activeTab === 'asset_library' ? 'assets' : 'content'
              }
            />
          )}

          {activeTab === 'video_production' && (
            <VideoProductionView
              selectedProduct={selectedProduct}
            />
          )}

          {(activeTab === 'social_accounts' || activeTab === 'publishing_centre' || activeTab === 'publishing_calendar' || activeTab === 'publication_history') && (
            <SocialAccountsView
              accounts={socialAccounts}
              publications={publications}
              campaigns={campaigns}
              selectedProduct={selectedProduct}
              onRefresh={loadInitialData}
              initialTab={
                activeTab === 'publishing_centre' ? 'centre' :
                activeTab === 'publishing_calendar' ? 'calendar' :
                activeTab === 'publication_history' ? 'calendar' : 'accounts'
              }
            />
          )}

          {(activeTab === 'analytics' || activeTab === 'campaign_analytics' || activeTab === 'conversion_intelligence' || activeTab === 'growth_optimization') && (
            <PerformanceAnalyticsView
              selectedProduct={selectedProduct}
            />
          )}

          {activeTab === 'ai_providers' && (
            <AIProviderConfigView />
          )}

          {(activeTab === 'team' || activeTab === 'settings' || activeTab === 'audit_logs' || activeTab === 'system_monitoring') && (
            <AdministrationView
              health={health}
              initialTab={
                activeTab === 'settings' ? 'settings' :
                activeTab === 'audit_logs' ? 'audit_logs' :
                activeTab === 'system_monitoring' ? 'settings' : 'team'
              }
            />
          )}
        </main>
      </div>

      {/* 8-STEP INTERACTIVE ONBOARDING WIZARD MODAL */}
      <OnboardingWizardModal
        isOpen={showOnboardingWizard}
        onClose={() => setShowOnboardingWizard(false)}
        onComplete={handleCompleteOnboarding}
      />

      {/* Authenticated User Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-2xl border p-7 shadow-2xl relative ${
            isDark ? "bg-[#181A18] border-[#2E332E] text-[#EEE8DE]" : "bg-[#FFFFFF] border-[#E2E1DC] text-[#202221]"
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#A16C50]/20 text-[#A16C50]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold font-editorial">Change Password</h2>
                  <p className={`text-[12px] ${isDark ? "text-[#8E8A82]" : "text-[#686B67]"}`}>
                    Update your account credentials
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowChangePasswordModal(false)}
                className={`p-1 rounded-lg cursor-pointer ${isDark ? "hover:bg-[#202221]" : "hover:bg-[#F3F2EE]"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalPasswordError && (
              <div className="mb-4 p-3 rounded-lg border text-[12px] bg-rose-500/10 border-rose-500/30 text-rose-500">
                {modalPasswordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                  Current Password
                </label>
                <input
                  type="password"
                  value={modalOldPassword}
                  onChange={(e) => setModalOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  required
                  className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none ${
                    isDark ? "bg-[#121312] border-[#2E332E]" : "bg-[#F8F8F6] border-[#E2E1DC]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                  New Password (min 6 characters)
                </label>
                <input
                  type="password"
                  value={modalNewPassword}
                  onChange={(e) => setModalNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none ${
                    isDark ? "bg-[#121312] border-[#2E332E]" : "bg-[#F8F8F6] border-[#E2E1DC]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono-metrics uppercase tracking-wider mb-1 font-semibold">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={modalConfirmPassword}
                  onChange={(e) => setModalConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className={`w-full h-11 px-3.5 rounded-xl border text-[13.5px] outline-none ${
                    isDark ? "bg-[#121312] border-[#2E332E]" : "bg-[#F8F8F6] border-[#E2E1DC]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className={`px-4 py-2 rounded-lg text-[13px] border cursor-pointer ${
                    isDark ? "border-[#2E332E] hover:bg-[#202221]" : "border-[#E2E1DC] hover:bg-[#F3F2EE]"
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalPasswordSubmitting}
                  className="px-5 py-2 rounded-lg text-[13px] font-semibold bg-[#202221] text-white cursor-pointer"
                >
                  {modalPasswordSubmitting ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GLOBAL MODAL: ADD PRODUCT */}
      {showGlobalAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className={`w-full max-w-lg p-6 rounded-2xl border shadow-2xl space-y-4 ${isDark ? "bg-[#161816] border-[#2E332E] text-[#F5F2EB]" : "bg-[#FFFFFF] border-[#E3E3DE] text-[#292B29]"}`}>

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
                  className="px-4 py-2 rounded-lg border border-[#E2D5C5] text-xs text-[#514334] bg-[#F1EAE0] hover:bg-[#E9DFD2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingQuick}
                  className="px-5 py-2 rounded-lg bg-[#292B29] hover:bg-[#414542] text-xs font-semibold text-[#FFFFFF] disabled:opacity-50"
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
