import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { Sidebar, NavSection } from "./components/Sidebar";
import { ExecutiveOverview } from "./components/ExecutiveOverview";
import { ProductPortfolio } from "./components/ProductPortfolio";
import { AgentWorkforce } from "./components/AgentWorkforce";
import { SocialPublishingCenter } from "./components/SocialPublishingCenter";
import { SystemMonitoring } from "./components/SystemMonitoring";
import { PlaceholderSection } from "./components/PlaceholderSection";
import {
  Compass, Target, FileText, Video, Image, Calendar,
  BarChart3, TrendingUp, Layers, Sliders, ShieldCheck, Settings
} from "lucide-react";
import {
  Product, SystemHealth, SpecialistAgent,
  SocialAccount, PublicationRecord
} from "./types";
import {
  fetchProducts, fetchHealth, fetchAgentRoster,
  fetchSocialAccounts, fetchPublications,
  pauseAutonomousEngine, resumeAutonomousEngine
} from "./services/api";

export const App: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<NavSection>("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [agents, setAgents] = useState<SpecialistAgent[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [publications, setPublications] = useState<PublicationRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      const [prodsData, healthData, agentData, accountsData, pubsData] = await Promise.all([
        fetchProducts().catch(() => []),
        fetchHealth().catch(() => null),
        fetchAgentRoster().catch(() => ({ is_autonomous_paused: false, agents: [] })),
        fetchSocialAccounts().catch(() => []),
        fetchPublications().catch(() => [])
      ]);

      setProducts(prodsData);
      setHealth(healthData);
      setAgents(agentData.agents);
      setIsPaused(agentData.is_autonomous_paused);
      setSocialAccounts(accountsData);
      setPublications(pubsData);
    } catch (e) {
      console.error("Data loading failure", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(() => {
      fetchHealth().then(setHealth).catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleTogglePause = async () => {
    try {
      if (isPaused) {
        const res = await resumeAutonomousEngine();
        setIsPaused(res.is_paused);
      } else {
        const res = await pauseAutonomousEngine();
        setIsPaused(res.is_paused);
      }
    } catch (e) {
      console.error("Pause/Resume toggle failed", e);
    }
  };

  return (
    <div className="min-h-screen bg-[#202221] text-[#EEE8DE] flex flex-col font-['Inter']">
      <Header
        products={products}
        selectedProduct={selectedProduct}
        onSelectProduct={setSelectedProduct}
        health={health}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          currentSection={currentSection}
          onSelectSection={setCurrentSection}
        />

        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#202221]">
          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#C9B49B] font-mono-metrics text-xs">
              Initializing PROMETHEUS-9 Operating System...
            </div>
          ) : (
            <>
              {currentSection === "overview" && (
                <ExecutiveOverview
                  products={products}
                  selectedProduct={selectedProduct}
                  health={health}
                  agents={agents}
                  socialAccounts={socialAccounts}
                  publications={publications}
                  onNavigate={setCurrentSection}
                />
              )}

              {currentSection === "portfolio" && (
                <ProductPortfolio
                  products={products}
                  selectedProduct={selectedProduct}
                  onSelectProduct={setSelectedProduct}
                  onRefresh={loadData}
                />
              )}

              {currentSection === "agent_workforce" && (
                <AgentWorkforce
                  agents={agents}
                  isPaused={isPaused}
                  onTogglePause={handleTogglePause}
                />
              )}

              {currentSection === "social_publishing" && (
                <SocialPublishingCenter
                  socialAccounts={socialAccounts}
                  publications={publications}
                  selectedProduct={selectedProduct}
                />
              )}

              {currentSection === "system_monitoring" && (
                <SystemMonitoring
                  health={health}
                  onRefresh={() => fetchHealth().then(setHealth)}
                />
              )}

              {/* Placeholder views for phased rollout */}
              {currentSection === "intelligence" && (
                <PlaceholderSection
                  title="Marketing Intelligence"
                  phase="PHASE 2"
                  icon={Compass}
                  description="Autonomous product website scanning, verifiable fact extraction, competitor differentiation, and audience intelligence."
                  plannedDeliverables={[
                    "Website HTML & sitemap crawler with SSRF protection",
                    "Deterministic fact-extraction parser mapping to ProductFeature",
                    "Competitor positioning matrix and claim isolation engine",
                    "Audience persona generation and channel affinity mapping"
                  ]}
                />
              )}

              {currentSection === "campaigns" && (
                <PlaceholderSection
                  title="Campaign Command Center"
                  phase="PHASE 2"
                  icon={Target}
                  description="Strategic campaign architecture, objective definition, and content ideation engine."
                  plannedDeliverables={[
                    "Objective-aligned campaign planning (Awareness, Leads, Demos, Registrations)",
                    "Content idea generation with hook, thesis, and format specification",
                    "Cross-product budget capping and timeline orchestration"
                  ]}
                />
              )}

              {currentSection === "content_studio" && (
                <PlaceholderSection
                  title="Content Studio"
                  phase="PHASE 3"
                  icon={FileText}
                  description="Scriptwriting engine, hook-body-CTA structured generation, and narrative verification."
                  plannedDeliverables={[
                    "Multi-format script generation (Shorts, Reels, Tutorials, Carousels)",
                    "Hook strength scoring and target duration timing constraints",
                    "Versioned script editor with visual prompt annotations"
                  ]}
                />
              )}

              {currentSection === "video_studio" && (
                <PlaceholderSection
                  title="Video Production Studio"
                  phase="PHASE 3"
                  icon={Video}
                  description="FFmpeg 9.0.2 programmatic rendering engine, motion graphic templates, and Kokoro/Piper audio synchronization."
                  plannedDeliverables={[
                    "FFmpeg template-driven video compilation (9:16 Shorts & 16:9 Landscape)",
                    "Low-VRAM video pipeline engineered for GTX 1650 (4 GB VRAM)",
                    "Synchronized subtitle burn-in and audio normalization"
                  ]}
                />
              )}

              {currentSection === "assets" && (
                <PlaceholderSection
                  title="Creative Asset Library"
                  phase="PHASE 3"
                  icon={Image}
                  description="Content-addressed storage engine with SHA-256 deduplication and licensing attribution tracking."
                  plannedDeliverables={[
                    "Local asset storage with cryptographic SHA-256 integrity verification",
                    "Licensing status tracking (Proprietary, CC0, Licensed)",
                    "Dynamic thumbnail generation with Burnished Copper brand accents"
                  ]}
                />
              )}

              {currentSection === "calendar" && (
                <PlaceholderSection
                  title="Publishing Calendar"
                  phase="PHASE 5"
                  icon={Calendar}
                  description="Multi-platform scheduled publishing timeline with rate-limit and time-window awareness."
                  plannedDeliverables={[
                    "Visual chronological calendar for YouTube, LinkedIn, Meta, TikTok, and X",
                    "Persistent queue scheduling with automatic retry and dead-letter detection"
                  ]}
                />
              )}

              {currentSection === "analytics" && (
                <PlaceholderSection
                  title="Analytics & Performance"
                  phase="PHASE 6"
                  icon={BarChart3}
                  description="True performance telemetry retrieved directly from authorized platform APIs and website UTM parameters."
                  plannedDeliverables={[
                    "Platform API metrics sync (YouTube Analytics, Meta Insights, LinkedIn Analytics)",
                    "Zero-Fabrication chart engine displaying only authentic observed metrics"
                  ]}
                />
              )}

              {currentSection === "growth" && (
                <PlaceholderSection
                  title="Growth Optimization"
                  phase="PHASE 7"
                  icon={TrendingUp}
                  description="Autonomous campaign optimization, creative variant experiments, and audience conversion learning."
                  plannedDeliverables={[
                    "Attribution modeling linking content publications to product registrations",
                    "Autonomous creative iteration recommendations"
                  ]}
                />
              )}

              {currentSection === "integrations" && (
                <PlaceholderSection
                  title="Integrations & Accounts"
                  phase="PHASE 5"
                  icon={Layers}
                  description="OAuth 2.0 social channel management, encrypted token storage, and permission validation."
                  plannedDeliverables={[
                    "Official YouTube Data API v3 integration with Fernet-encrypted refresh tokens",
                    "Meta, LinkedIn, TikTok, and X official API connectors"
                  ]}
                />
              )}

              {currentSection === "automation_rules" && (
                <PlaceholderSection
                  title="Automation Rules"
                  phase="PHASE 7"
                  icon={Sliders}
                  description="Governed autonomous execution triggers, frequency limits, and threshold constraints."
                  plannedDeliverables={[
                    "Configurable autonomous publishing schedules and maximum frequency caps",
                    "Strict safety triggers halting operations upon token expiry or claim mismatch"
                  ]}
                />
              )}

              {currentSection === "brand_compliance" && (
                <PlaceholderSection
                  title="Brand & Compliance"
                  phase="PHASE 4"
                  icon={ShieldCheck}
                  description="Pre-publishing verification engine ensuring zero-hallucination standards, copyright safety, and Charcoal & Copper adherence."
                  plannedDeliverables={[
                    "Factual claim verifier rejecting scripts containing unverified capabilities",
                    "Prohibited claims and blacklist scanner per product",
                    "Brand palette and contrast validator"
                  ]}
                />
              )}

              {currentSection === "settings" && (
                <PlaceholderSection
                  title="Settings & Administration"
                  phase="PHASE 1"
                  icon={Settings}
                  description="System configuration, database backups, audit trail inspection, and environment controls."
                  plannedDeliverables={[
                    "Master encryption key rotation and storage configuration",
                    "Audit log inspection across all user and agent actions"
                  ]}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
export default App;
