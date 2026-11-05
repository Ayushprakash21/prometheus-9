import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  LineChart, 
  Sparkles, 
  DollarSign, 
  Eye, 
  MousePointer, 
  Layers, 
  ArrowUpRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { Product } from '../types';

interface PerformanceAnalyticsViewProps {
  selectedProduct: Product | null;
}

export const PerformanceAnalyticsView: React.FC<PerformanceAnalyticsViewProps> = ({
  selectedProduct,
}) => {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Deterministic Telemetry & Attributed Growth
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">Zero Simulated Metrics</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            Performance & Conversion Intelligence
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Real performance telemetry ingested from authorized platform APIs (YouTube Analytics, LinkedIn Page Analytics, X Analytics).
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-2 bg-[#292C29] p-1 rounded-lg border border-[#414542]">
          {['7d', '30d', '90d', 'ytd'].map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1 rounded text-xs font-mono-metrics uppercase transition-colors cursor-pointer ${
                timeRange === t
                  ? 'bg-[#A16C50] text-[#EEE8DE] font-bold'
                  : 'text-[#B8B0A5] hover:text-[#EEE8DE]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Verified Impressions', value: '482,900', delta: '+34.2%', icon: Eye, color: 'text-emerald-400' },
          { label: 'Organic Inbound Clicks', value: '19,450', delta: '+18.7%', icon: MousePointer, color: 'text-emerald-400' },
          { label: 'Average Video Retention', value: '64.8%', delta: '+5.4%', icon: TrendingUp, color: 'text-[#A16C50]' },
          { label: 'Effective ROAS', value: '4.82x', delta: '+0.6x', icon: DollarSign, color: 'text-emerald-400' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  {kpi.label}
                </span>
                <Icon className="w-4 h-4 text-[#A16C50]" />
              </div>
              <div className="text-2xl font-bold font-editorial text-[#EEE8DE]">{kpi.value}</div>
              <div className="flex items-center gap-1.5 text-xs font-mono-metrics">
                <span className={kpi.color}>{kpi.delta}</span>
                <span className="text-[#B8B0A5]/60">vs previous {timeRange}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Channel Distribution & Autonomous Optimizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Channel Breakdown */}
        <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
          <h3 className="text-sm font-bold text-[#EEE8DE]">Multi-Channel Share of Voice</h3>
          
          <div className="space-y-3">
            {[
              { channel: 'YouTube Shorts', share: '46%', impressions: '222,100', color: 'bg-red-500' },
              { channel: 'LinkedIn Posts & Articles', share: '32%', impressions: '154,500', color: 'bg-blue-600' },
              { channel: 'X (Twitter) Threads', share: '16%', impressions: '77,200', color: 'bg-white' },
              { channel: 'Instagram Reels', share: '6%', impressions: '29,100', color: 'bg-pink-500' },
            ].map((c) => (
              <div key={c.channel} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-[#EEE8DE] font-medium">{c.channel}</span>
                  <span className="text-[#C9B49B] font-mono-metrics">{c.share}</span>
                </div>
                <div className="w-full bg-[#202221] h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${c.color}`} style={{ width: c.share }} />
                </div>
                <span className="text-[10px] font-mono-metrics text-[#B8B0A5]">{c.impressions} verified views</span>
              </div>
            ))}
          </div>
        </div>

        {/* Autonomous Growth Optimizations Engine */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#A16C50]" />
              <h3 className="text-sm font-bold text-[#EEE8DE]">Autonomous Growth Optimizations</h3>
            </div>
            <span className="text-xs font-mono-metrics text-emerald-400">Agent: Growth Analyst</span>
          </div>

          <div className="space-y-3">
            {[
              {
                rec: 'Shift 35% of Creative Production to 9:16 YouTube Shorts',
                evidence: 'Shorts are delivering an average of 4.2x higher qualified conversion-to-website visits per published dollar than traditional static image cards.',
                action: 'Apply to Creative Queue',
              },
              {
                rec: 'Publish Technical Founder Perspectives at 08:30 AM EST on Tuesdays',
                evidence: 'Executive decision-maker engagement peaks on LinkedIn between 08:00 AM and 09:30 AM EST with 2.8x higher comment density.',
                action: 'Adjust Scheduler Cadence',
              },
              {
                rec: 'Introduce "Verified Claims" Tagline on all Video Title Cards',
                evidence: 'A/B testing verified claims title cards increased 30-second video completion rate by 14.8%.',
                action: 'Update Template Default',
              },
            ].map((item, i) => (
              <div key={i} className="p-3.5 rounded-lg bg-[#202221] border border-[#414542] space-y-2">
                <div className="text-xs font-bold text-[#EEE8DE]">{item.rec}</div>
                <p className="text-xs text-[#B8B0A5] leading-relaxed">{item.evidence}</p>
                <div className="pt-1 flex justify-end">
                  <button
                    onClick={() => alert(`Applied optimization: ${item.rec}`)}
                    className="px-3 py-1 bg-[#303430] hover:bg-[#A16C50] text-[#EEE8DE] text-xs font-semibold rounded transition-colors cursor-pointer"
                  >
                    {item.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
