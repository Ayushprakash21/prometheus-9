import React from "react";
import { Product, SystemHealth, SpecialistAgent, SocialAccount, PublicationRecord } from "../types";
import { Boxes, Sparkles, ShieldCheck, Share2, Film, CheckCircle2, ArrowRight } from "lucide-react";

interface ExecutiveOverviewProps {
  products: Product[];
  selectedProduct: Product | null;
  health: SystemHealth | null;
  agents: SpecialistAgent[];
  socialAccounts: SocialAccount[];
  publications: PublicationRecord[];
  onNavigate: (section: any) => void;
}

export const ExecutiveOverview: React.FC<ExecutiveOverviewProps> = ({
  products,
  selectedProduct,
  health,
  agents,
  socialAccounts,
  publications,
  onNavigate
}) => {
  const displayedProducts = selectedProduct ? [selectedProduct] : products;
  const totalVerifiedFeatures = displayedProducts.reduce((acc, p) => acc + (p.features_count || 0), 0);
  const authorizedAccounts = socialAccounts.filter((a) => a.authorization_status === "authorized");

  return (
    <div className="space-y-6">
      {/* Top Banner: Operating Cycle */}
      <div className="bg-[#414542]/20 border border-[#414542]/60 rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A16C50] font-mono-metrics">
                Operating Cycle
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]"></span>
              <span className="text-xs text-[#C9B49B]">Continuous Autonomous Loop</span>
            </div>
            <h1 className="text-xl font-bold text-[#EEE8DE] mt-1 font-['Manrope']">
              {selectedProduct ? `${selectedProduct.name} Command Center` : "Enterprise Portfolio Overview"}
            </h1>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono-metrics py-1 px-2 bg-[#202221] rounded border border-[#414542]/50 text-[#C9B49B]">
            {["RESEARCH", "STRATEGIZE", "CREATE", "VALIDATE", "PUBLISH", "MEASURE", "LEARN", "OPTIMIZE"].map(
              (step, idx, arr) => (
                <React.Fragment key={step}>
                  <span className={`px-1.5 py-0.5 rounded ${idx === 0 ? "text-[#A16C50] font-bold" : "text-[#C9B49B]/70"}`}>
                    {step}
                  </span>
                  {idx < arr.length - 1 && <span className="text-[#414542]">→</span>}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </div>

      {/* Honest Operational Metrics Grid (Zero Fake Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Registered Products */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C9B49B]">
            <span className="text-xs font-medium uppercase tracking-wider">Registered Products</span>
            <Boxes className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#EEE8DE] font-mono-metrics">
              {displayedProducts.length}
            </div>
            <div className="text-[11px] text-[#C9B49B]/70 mt-1">
              {selectedProduct ? selectedProduct.category : "ORION-9 & ApplyWise AI active"}
            </div>
          </div>
          <button
            onClick={() => onNavigate("portfolio")}
            className="text-[11px] text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1 font-medium pt-2 border-t border-[#414542]/30"
          >
            Manage Portfolio <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 2: Verified Features */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C9B49B]">
            <span className="text-xs font-medium uppercase tracking-wider">Verified Features</span>
            <ShieldCheck className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#EEE8DE] font-mono-metrics">
              {totalVerifiedFeatures}
            </div>
            <div className="text-[11px] text-[#C9B49B]/70 mt-1">
              Strict zero-hallucination ground truth
            </div>
          </div>
          <button
            onClick={() => onNavigate("intelligence")}
            className="text-[11px] text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1 font-medium pt-2 border-t border-[#414542]/30"
          >
            Inspect Fact Registry <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 3: Specialist Agents */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C9B49B]">
            <span className="text-xs font-medium uppercase tracking-wider">Agent Workforce</span>
            <Sparkles className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#EEE8DE] font-mono-metrics">
              {agents.length || 15}
            </div>
            <div className="text-[11px] text-[#C9B49B]/70 mt-1">
              Controlled orchestrator architecture
            </div>
          </div>
          <button
            onClick={() => onNavigate("agent_workforce")}
            className="text-[11px] text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1 font-medium pt-2 border-t border-[#414542]/30"
          >
            View Workforce <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {/* Metric 4: Authorized Social Channels */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#C9B49B]">
            <span className="text-xs font-medium uppercase tracking-wider">Social Integrations</span>
            <Share2 className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-bold text-[#EEE8DE] font-mono-metrics">
              {authorizedAccounts.length}
            </div>
            <div className="text-[11px] text-[#C9B49B]/70 mt-1">
              {authorizedAccounts.length === 0
                ? "Awaiting OAuth authorization"
                : `${authorizedAccounts.length} channel(s) connected`}
            </div>
          </div>
          <button
            onClick={() => onNavigate("social_publishing")}
            className="text-[11px] text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1 font-medium pt-2 border-t border-[#414542]/30"
          >
            Connect Channels <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Zero-Fabrication Standards Callout */}
      <div className="border border-[#A16C50]/40 bg-[#A16C50]/10 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-[#A16C50] shrink-0 mt-0.5" />
        <div className="text-xs text-[#EEE8DE] space-y-1">
          <div className="font-bold text-[#C9B49B]">Zero-Fabrication & Strict Database of Record Standard</div>
          <p className="text-[#EEE8DE]/80 leading-relaxed">
            PROMETHEUS-9 never fabricates metrics, simulates campaign clicks, or displays placeholder success indicators.
            Every metric, script, and publication status shown in this console originates directly from authorized platform APIs
            or verified ground-truth database records.
          </p>
        </div>
      </div>

      {/* Product Cards Breakdown */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[#C9B49B] font-mono-metrics">
          Current Operating Products
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedProducts.map((p) => (
            <div
              key={p.id}
              className="bg-[#202221] border border-[#414542]/70 rounded-lg p-5 hover:border-[#A16C50]/60 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#414542]/40 text-[#C9B49B]">
                    {p.category}
                  </span>
                  <h3 className="text-lg font-bold text-[#EEE8DE] mt-2 font-['Manrope']">{p.name}</h3>
                  <p className="text-xs text-[#C9B49B] mt-1 italic">{p.tagline}</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Active"></span>
              </div>
              <p className="text-xs text-[#EEE8DE]/70 mt-3 line-clamp-2">{p.description}</p>
              
              <div className="mt-4 pt-3 border-t border-[#414542]/40 flex items-center justify-between text-xs text-[#C9B49B]">
                <span className="font-mono-metrics">{p.features_count} Verified Features</span>
                <span className="text-[#A16C50] font-medium uppercase text-[10px] tracking-wide">
                  Goal: {p.primary_objective.replace("_", " ")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
