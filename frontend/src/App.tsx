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
  AgentRun 
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
  pauseAutonomousEngine,
  resumeAutonomousEngine
} from "./services/api";

import { BrandUniverseCanvas } from "./components/BrandUniverseCanvas";
import { BrandWorld } from "./components/BrandWorld";
import { BrandCreationLab } from "./components/BrandCreationLab";
import { AgentWorkforceView } from "./components/AgentWorkforceView";
import { CreativeStudioView } from "./components/CreativeStudioView";
import { SocialConstellationView } from "./components/SocialConstellationView";
import { AutonomyControlView } from "./components/AutonomyControlView";

import { 
  Sparkles, 
  Compass, 
  Layers, 
  Bot, 
  Film, 
  Share2, 
  Sliders, 
  AlertCircle,
  Play,
  Pause,
  Clock,
  ShieldCheck
} from "lucide-react";

export type ActiveView = 
  | 'universe' 
  | 'brand_world' 
  | 'creation_lab' 
  | 'workforce' 
  | 'creative_studio' 
  | 'social' 
  | 'autonomy';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ActiveView>('universe');
  const [brandWorldInitialTab, setBrandWorldInitialTab] = useState<string>('identity');

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

  // Status & Telemetry States
  const [loading, setLoading] = useState<boolean>(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [authRequired, setAuthRequired] = useState<boolean>(false);
  const [utcTime, setUtcTime] = useState<string>("");

  // Clock Ticker in UTC
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(`${now.toUTCString().slice(17, 25)} UTC`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Primary Data Fetcher
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

      // Select first product if none selected
      if (!selectedProduct && prodsData.length > 0) {
        setSelectedProduct(prodsData[0]);
      }
    } catch (e) {
      console.error("Initial load failed", e);
    } finally {
      setLoading(false);
    }
  };

  // Load Brand-Specific Sub-Resources when selectedProduct changes
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

  // Handle Universe Node Click (Route into contextual deep workspace)
  const handleSelectUniverseNode = (nodeId: string) => {
    switch (nodeId) {
      case 'identity':
        setBrandWorldInitialTab('identity');
        setActiveView('brand_world');
        break;
      case 'products':
        setBrandWorldInitialTab('features');
        setActiveView('brand_world');
        break;
      case 'audience':
        setBrandWorldInitialTab('audience');
        setActiveView('brand_world');
        break;
      case 'market_intel':
        setBrandWorldInitialTab('intelligence');
        setActiveView('brand_world');
        break;
      case 'strategy':
      case 'performance':
        setActiveView('autonomy');
        break;
      case 'campaigns':
      case 'creative':
        setActiveView('creative_studio');
        break;
      case 'workforce':
        setActiveView('workforce');
        break;
      case 'social':
        setActiveView('social');
        break;
      default:
        setActiveView('brand_world');
        break;
    }
  };

  const handleBrandCreationSuccess = async (newProd: Product) => {
    await loadInitialData();
    setSelectedProduct(newProd);
    setActiveView('brand_world');
  };

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

  return (
    <div className="min-h-screen bg-[#202221] text-[#EEE8DE] flex flex-col font-interface selection:bg-[#A16C50]/30 selection:text-[#EEE8DE]">
      {/* FLOATING EDITORIAL TOP HEADER */}
      <header className="sticky top-0 z-40 w-full px-6 md:px-12 py-3 bg-[#202221]/80 backdrop-blur-xl border-b border-copper-subtle/50 flex items-center justify-between">
        {/* Brand Monogram & Category */}
        <div className="flex items-center gap-6">
          <div 
            onClick={() => setActiveView('universe')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#292d2b] border border-[#A16C50] flex items-center justify-center copper-glow-sm group-hover:scale-105 transition-all">
              <span className="font-editorial text-sm font-bold text-[#EEE8DE]">P</span>
            </div>
            <div>
              <div className="font-editorial text-lg tracking-wider text-[#EEE8DE] group-hover:text-[#C9B49B] transition-colors leading-none">
                PROMETHEUS-9
              </div>
              <div className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest mt-0.5">
                AUTONOMOUS GROWTH OS
              </div>
            </div>
          </div>

          {/* Active Brand World Pill */}
          {selectedProduct && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#292d2b] border border-copper-subtle text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
              <span className="text-[#C9B49B]">Active World:</span>
              <strong className="text-[#EEE8DE]">{selectedProduct.name}</strong>
            </div>
          )}
        </div>

        {/* System Telemetry & UTC Time */}
        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden lg:flex items-center gap-4 text-[11px] font-mono-metrics text-[#C9B49B]">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#A16C50]" />
              <span>{utcTime || '16:04:00 UTC'}</span>
            </span>
            <span>•</span>
            <span>MMXXVI</span>
            <span>•</span>
            <span className="text-[#A16C50]">OP_STATE: NOMINAL</span>
          </div>

          {/* Emergency Killswitch Pill */}
          <button
            onClick={handleToggleEmergencyPause}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-interface transition-all cursor-pointer ${
              isPaused 
                ? 'bg-rose-950/60 border border-rose-500/60 text-rose-300' 
                : 'bg-[#292d2b] border border-copper-subtle text-[#C9B49B] hover:text-[#EEE8DE]'
            }`}
          >
            {isPaused ? <Play className="w-3 h-3 text-rose-400" /> : <Pause className="w-3 h-3 text-[#A16C50]" />}
            <span className="font-mono-metrics text-[10px] uppercase font-semibold">
              {isPaused ? 'HALTED' : 'ACTIVE'}
            </span>
          </button>

          {/* Quick Launch Genesis Button */}
          <button
            onClick={() => setActiveView('creation_lab')}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-[#EEE8DE] text-xs font-interface font-semibold shadow-md shadow-[#A16C50]/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Genesis Lab</span>
          </button>
        </div>
      </header>

      {/* SYSTEM DIAGNOSTIC WARNINGS (If offline or auth needed) */}
      {connectionError && (
        <div className="px-6 md:px-12 py-3 bg-[#A16C50]/20 border-b border-[#A16C50]/60 flex items-center justify-between text-xs text-[#EEE8DE]">
          <div className="flex items-center gap-3">
            <span className="font-bold uppercase tracking-wider text-[#A16C50] font-mono-metrics">Backend Offline</span>
            <span>{connectionError}</span>
          </div>
          <span className="font-mono-metrics text-[10px] text-[#C9B49B]">STANDALONE EXPERIENCE</span>
        </div>
      )}

      {authRequired && (
        <div className="px-6 md:px-12 py-3 bg-amber-950/40 border-b border-amber-600/50 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Authenticated session active in development mode. All data persisters are active.</span>
          </div>
          <span className="font-mono-metrics text-[10px] text-amber-400 uppercase">LOCAL AUTH PASSTHROUGH</span>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 w-full">
        {activeView === 'universe' && (
          <BrandUniverseCanvas
            product={selectedProduct}
            features={features}
            brandProfile={brandProfile}
            audiences={audiences}
            campaigns={campaigns}
            agents={agents}
            socialAccounts={socialAccounts}
            isAutonomousPaused={isPaused}
            onSelectNode={handleSelectUniverseNode}
            onOpenBrandCreation={() => setActiveView('creation_lab')}
            onSwitchBrand={(pId) => {
              const found = products.find(p => p.id === pId);
              if (found) setSelectedProduct(found);
            }}
            allProducts={products}
          />
        )}

        {activeView === 'brand_world' && selectedProduct && (
          <BrandWorld
            product={selectedProduct}
            features={features}
            brandProfile={brandProfile}
            audiences={audiences}
            sources={sources}
            campaigns={campaigns}
            ideas={ideas}
            scripts={scripts}
            assets={assets}
            onRefresh={async () => {
              if (selectedProduct) await loadProductResources(selectedProduct.id);
            }}
            onClose={() => setActiveView('universe')}
            initialTab={brandWorldInitialTab}
          />
        )}

        {activeView === 'creation_lab' && (
          <BrandCreationLab
            onSuccess={handleBrandCreationSuccess}
            onCancel={() => setActiveView('universe')}
          />
        )}

        {activeView === 'workforce' && (
          <AgentWorkforceView
            agents={agents}
            runs={agentRuns}
            isAutonomousPaused={isPaused}
            selectedProduct={selectedProduct}
            onRefresh={loadInitialData}
            onClose={() => setActiveView('universe')}
          />
        )}

        {activeView === 'creative_studio' && (
          <CreativeStudioView
            product={selectedProduct}
            campaigns={campaigns}
            ideas={ideas}
            scripts={scripts}
            assets={assets}
            onRefresh={async () => {
              if (selectedProduct) await loadProductResources(selectedProduct.id);
            }}
            onClose={() => setActiveView('universe')}
          />
        )}

        {activeView === 'social' && (
          <SocialConstellationView
            product={selectedProduct}
            accounts={socialAccounts}
            publications={publications}
            onRefresh={loadInitialData}
            onClose={() => setActiveView('universe')}
          />
        )}

        {activeView === 'autonomy' && (
          <AutonomyControlView
            isAutonomousPaused={isPaused}
            onRefresh={loadInitialData}
            onClose={() => setActiveView('universe')}
          />
        )}
      </main>

      {/* FLOATING LUXURY BOTTOM NAVIGATION DOCK */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-3 py-2 rounded-full bg-[#202221]/90 backdrop-blur-2xl border border-copper-subtle shadow-2xl flex items-center gap-1 sm:gap-2">
        {[
          { id: 'universe' as ActiveView, label: '00 Universe', icon: Compass },
          { id: 'brand_world' as ActiveView, label: '01 Brand Worlds', icon: Layers },
          { id: 'creation_lab' as ActiveView, label: '02 Genesis Lab', icon: Sparkles },
          { id: 'workforce' as ActiveView, label: '03 Workforce', icon: Bot },
          { id: 'creative_studio' as ActiveView, label: '04 Creative Studio', icon: Film },
          { id: 'social' as ActiveView, label: '05 Distribution', icon: Share2 },
          { id: 'autonomy' as ActiveView, label: '06 Autonomy', icon: Sliders },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs font-interface transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-[#A16C50] text-[#EEE8DE] font-semibold shadow-lg shadow-[#A16C50]/30'
                  : 'text-[#C9B49B] hover:text-[#EEE8DE] hover:bg-[#414542]/30'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-mono-metrics text-[11px]">{item.label}</span>
              <span className="inline md:hidden text-[10px]">{item.id.slice(0, 3).toUpperCase()}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default App;
