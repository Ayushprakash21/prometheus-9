import React, { useState } from 'react';
import { 
  Radar, 
  TrendingUp, 
  Search, 
  Zap, 
  Lightbulb, 
  Sparkles, 
  ArrowUpRight, 
  Globe, 
  BarChart, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  Target
} from 'lucide-react';
import { Product } from '../types';

interface MarketingIntelligenceViewProps {
  selectedProduct: Product | null;
  activeSubSection?: 'market_research' | 'trend_intelligence' | 'seo_intelligence' | 'strategy' | 'growth_opportunities';
}

export const MarketingIntelligenceView: React.FC<MarketingIntelligenceViewProps> = ({
  selectedProduct,
  activeSubSection = 'market_research',
}) => {
  const [activeTab, setActiveTab] = useState(activeSubSection);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshIntel = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 900);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Market Surveillance Engine
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-[#A16C50]">
              Active Scope: {selectedProduct ? selectedProduct.name : 'Global Portfolio'}
            </span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            Marketing Intelligence Desk
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Autonomous industry surveillance, predictive trend synthesis, high-intent search demand mapping, and positioning vectors.
          </p>
        </div>

        <button
          onClick={handleRefreshIntel}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-lg bg-[#292C29] border border-[#414542] hover:border-[#A16C50] text-xs font-semibold text-[#EEE8DE] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#A16C50] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Sync Real-Time Intelligence</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#414542] pb-2 overflow-x-auto">
        {[
          { id: 'market_research', label: 'Market Research', icon: Radar },
          { id: 'trend_intelligence', label: 'Trend Intelligence', icon: TrendingUp },
          { id: 'seo_intelligence', label: 'SEO & Search Demand', icon: Search },
          { id: 'strategy', label: 'Marketing Strategy', icon: Zap },
          { id: 'growth_opportunities', label: 'Growth Opportunities', icon: Lightbulb },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-[#303430] text-[#A16C50] border border-[#A16C50]/50 font-semibold shadow-sm'
                  : 'text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#292C29]'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#A16C50]' : 'text-[#B8B0A5]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Market Research */}
      {activeTab === 'market_research' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-1">
              <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">Total Addressable Market</span>
              <div className="text-xl font-bold font-editorial text-[#EEE8DE]">$18.4 Billion</div>
              <p className="text-[11px] text-emerald-400 font-mono-metrics">+22.4% YoY Expansion</p>
            </div>

            <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-1">
              <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">Target ICP Density</span>
              <div className="text-xl font-bold font-editorial text-[#EEE8DE]">142,000 Accounts</div>
              <p className="text-[11px] text-[#B8B0A5] font-mono-metrics">Verified High-Intent Tech Segment</p>
            </div>

            <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-1">
              <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">Market Maturity Index</span>
              <div className="text-xl font-bold font-editorial text-[#EEE8DE]">High Acceleration</div>
              <p className="text-[11px] text-[#A16C50] font-mono-metrics">Early Majority Inflection</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#EEE8DE]">Autonomous Sector Synthesis</h3>
              <span className="text-xs font-mono-metrics text-[#C9B49B]">Agent: Research Director</span>
            </div>
            <p className="text-xs text-[#B8B0A5] leading-relaxed">
              Enterprises are rapidly migrating away from fractured point solutions in creative and marketing operations. The primary inflection point in 2026 is deterministic AI workflow execution—buyers demand guaranteed verified claims, strict RBAC guardrails, and automated multi-channel publishing without hallucinations.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded bg-[#202221] border border-[#414542] text-[11px] text-[#EEE8DE]">
                Key Driver: Multi-Channel Consolidation
              </span>
              <span className="px-2.5 py-1 rounded bg-[#202221] border border-[#414542] text-[11px] text-[#EEE8DE]">
                Key Barrier: Hallucinated ROI Claims
              </span>
              <span className="px-2.5 py-1 rounded bg-[#202221] border border-[#414542] text-[11px] text-[#EEE8DE]">
                Asymmetric Angle: Autonomous FFmpeg Rendering
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Trend Intelligence */}
      {activeTab === 'trend_intelligence' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                trend: 'Autonomous Marketing Operating Systems replacing legacy agencies',
                volume: '88,000 searches/mo',
                growth: '+142%',
                urgency: 'HIGH',
                hook: 'Why Fortune 500 growth teams are running autonomous agent swarms.',
              },
              {
                trend: 'Deterministic Guardrails in Generative Copywriting',
                volume: '34,500 searches/mo',
                growth: '+89%',
                urgency: 'MEDIUM',
                hook: 'The hidden liability of unverified claims in enterprise brand marketing.',
              },
              {
                trend: 'Programmatic Video Assembly using FFmpeg and Voiceover AI',
                volume: '62,100 searches/mo',
                growth: '+210%',
                urgency: 'HIGH',
                hook: 'Generating 30 high-converting vertical video shorts in 10 minutes.',
              },
              {
                trend: 'B2B Founder-Led Thought Leadership on LinkedIn & X',
                volume: '115,000 searches/mo',
                growth: '+45%',
                urgency: 'MEDIUM',
                hook: 'How technical solo founders dominate enterprise inbound pipelines.',
              },
            ].map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#A16C50]/20 text-[#C9B49B] border border-[#A16C50]/30">
                    Urgency: {t.urgency}
                  </span>
                  <span className="text-xs font-mono-metrics text-emerald-400 font-bold">{t.growth}</span>
                </div>
                <h4 className="text-sm font-bold text-[#EEE8DE]">{t.trend}</h4>
                <div className="text-xs text-[#B8B0A5]">Search Velocity: {t.volume}</div>
                <div className="p-2.5 rounded bg-[#202221] border border-[#414542]/60 text-xs italic text-[#C9B49B]">
                  "{t.hook}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: SEO Intelligence */}
      {activeTab === 'seo_intelligence' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
            <h3 className="text-sm font-bold text-[#EEE8DE]">High-Intent Keyword Matrix</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#414542] font-mono-metrics text-[#C9B49B]">
                    <th className="pb-2">Keyword Cluster</th>
                    <th className="pb-2">Search Volume</th>
                    <th className="pb-2">Intent</th>
                    <th className="pb-2">Difficulty</th>
                    <th className="pb-2">Recommended Format</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#414542]/40 text-[#EEE8DE]">
                  {[
                    { kw: 'autonomous marketing platform', vol: '18.2K', intent: 'Commercial', diff: 'Med (42)', format: 'Landing Page + Video' },
                    { kw: 'ai creative video production', vol: '29.5K', intent: 'Transactional', diff: 'High (68)', format: 'Interactive Demo' },
                    { kw: 'verified claims brand compliance ai', vol: '6.8K', intent: 'Commercial', diff: 'Low (24)', format: 'Whitepaper / Deep Dive' },
                    { kw: 'social media publishing api automation', vol: '14.1K', intent: 'Informational', diff: 'Med (39)', format: 'Technical Guide' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-[#303430]/40 transition-colors">
                      <td className="py-2.5 font-medium">{row.kw}</td>
                      <td className="py-2.5 font-mono-metrics text-[#B8B0A5]">{row.vol}</td>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded bg-[#303430] text-[10px] font-mono-metrics text-[#C9B49B]">
                          {row.intent}
                        </span>
                      </td>
                      <td className="py-2.5 font-mono-metrics text-[#B8B0A5]">{row.diff}</td>
                      <td className="py-2.5 text-[#A16C50]">{row.format}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Marketing Strategy */}
      {activeTab === 'strategy' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-editorial text-lg font-bold text-[#EEE8DE]">
                  Quarterly Campaign Vector: "The Verified Autonomous Operator"
                </h3>
                <span className="text-xs text-[#B8B0A5]">Proposed by Strategy Director • Autonomy Tier: Supervised</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-950/30 text-emerald-300 border border-emerald-800 text-xs font-mono-metrics">
                Status: ACTIVE
              </span>
            </div>

            <p className="text-xs text-[#B8B0A5] leading-relaxed">
              Position the product as the definitive solution for high-growth tech firms that cannot afford agency latency or unverified generative AI hallucinations. Combine 3 weekly YouTube Shorts with 5 high-density LinkedIn carousels highlighting actual customer metrics.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-lg bg-[#202221] border border-[#414542]">
                <span className="text-[10px] font-mono-metrics text-[#C9B49B] uppercase block">Cadence</span>
                <span className="text-xs font-bold text-[#EEE8DE]">8 Posts / Week Multi-Platform</span>
              </div>
              <div className="p-3 rounded-lg bg-[#202221] border border-[#414542]">
                <span className="text-[10px] font-mono-metrics text-[#C9B49B] uppercase block">Primary KPI</span>
                <span className="text-xs font-bold text-[#EEE8DE]">Inbound Demo Requests</span>
              </div>
              <div className="p-3 rounded-lg bg-[#202221] border border-[#414542]">
                <span className="text-[10px] font-mono-metrics text-[#C9B49B] uppercase block">Target CPA</span>
                <span className="text-xs font-bold text-[#EEE8DE]">&lt; $45.00 Qualified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Growth Opportunities */}
      {activeTab === 'growth_opportunities' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'High-Impact LinkedIn Video Shorts',
                impact: 'VERY HIGH',
                effort: 'LOW (Automated)',
                rationale: 'LinkedIn native video algorithm is currently weighting 45-60s vertical content at 3.2x higher impression distribution than text posts.',
              },
              {
                title: 'Automated YouTube SEO Teleprompter Series',
                impact: 'HIGH',
                effort: 'MEDIUM',
                rationale: 'Targeting technical founder queries for "Autonomous Marketing Platform" with zero existing direct video competition in search results.',
              },
            ].map((opp, i) => (
              <div key={i} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#EEE8DE]">{opp.title}</span>
                  <span className="px-2 py-0.5 rounded bg-[#A16C50]/20 text-[#C9B49B] text-[10px] font-mono-metrics border border-[#A16C50]/30">
                    Impact: {opp.impact}
                  </span>
                </div>
                <div className="text-[11px] font-mono-metrics text-[#B8B0A5]">Effort: {opp.effort}</div>
                <p className="text-xs text-[#B8B0A5] leading-relaxed">{opp.rationale}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
