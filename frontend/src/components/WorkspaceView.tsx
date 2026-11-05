import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  Plus, 
  CheckSquare, 
  Film, 
  Send, 
  Layers, 
  Bot, 
  ArrowRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { Product, NavTab } from '../types';

interface WorkspaceViewProps {
  selectedProduct: Product | null;
  onNavigate: (tab: NavTab) => void;
  onOpenOnboarding: () => void;
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  selectedProduct,
  onNavigate,
  onOpenOnboarding,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Personal Operating Desk
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">All Systems Operational</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            My Workspace
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Unified command cockpit for active campaigns, creative jobs, and pending governance gates across your product portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2 rounded-lg bg-[#A16C50] hover:bg-[#8F5D43] text-xs font-bold text-[#EEE8DE] flex items-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Onboarding Wizard</span>
          </button>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'New Video Render', desc: 'Create 9:16 Shorts or 16:9 MP4', icon: Film, tab: 'video_production' as NavTab, action: 'Launch Studio' },
          { title: 'Approval Queue', desc: 'Review 2 pending agent outputs', icon: CheckSquare, tab: 'approval_centre' as NavTab, action: 'Inspect Items' },
          { title: 'Agent Directory', desc: '12 specialized AI agents active', icon: Bot, tab: 'agents' as NavTab, action: 'Manage Agents' },
          { title: 'Publishing Calendar', desc: 'Scheduled distribution ledger', icon: Send, tab: 'publishing_calendar' as NavTab, action: 'Open Calendar' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className="p-4 rounded-xl bg-[#292C29] border border-[#414542] hover:border-[#A16C50] transition-all cursor-pointer group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-[#202221] text-[#A16C50] border border-[#414542] group-hover:border-[#A16C50] transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className="w-4 h-4 text-[#B8B0A5] group-hover:text-[#EEE8DE] transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#EEE8DE]">{item.title}</h4>
                <p className="text-xs text-[#B8B0A5] mt-0.5">{item.desc}</p>
              </div>
              <div className="text-[11px] font-mono-metrics text-[#C9B49B] pt-1">
                {item.action} →
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Focus Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Focus: Product Portfolio */}
        <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EEE8DE]">Current Product Scope</h3>
            <span className="text-xs font-mono-metrics text-[#C9B49B]">
              {selectedProduct ? 'Active' : 'Global'}
            </span>
          </div>

          {selectedProduct ? (
            <div className="p-4 rounded-lg bg-[#202221] border border-[#414542] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#EEE8DE]">{selectedProduct.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/20 text-emerald-400 border border-emerald-800/40 text-[10px] font-mono-metrics">
                  VERIFIED CLAIMS GUARD ACTIVE
                </span>
              </div>
              <p className="text-xs text-[#B8B0A5] leading-relaxed">
                {selectedProduct.tagline || selectedProduct.description || 'Autonomous growth enabled.'}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-[#C9B49B]">
                <span>Category: {selectedProduct.category}</span>
                <button
                  onClick={() => onNavigate('products')}
                  className="text-[#A16C50] hover:underline cursor-pointer"
                >
                  Edit Configuration →
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center text-xs text-[#B8B0A5] bg-[#202221] rounded-lg border border-[#414542]">
              Select a product from the top portfolio dropdown or register a new one to focus this workspace.
            </div>
          )}
        </div>

        {/* Autonomous Scheduler Health & Status */}
        <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EEE8DE]">Persistent Scheduler Desk</h3>
            <span className="text-xs font-mono-metrics text-emerald-400">NOMINAL</span>
          </div>

          <div className="space-y-2.5">
            {[
              { task: 'Autonomous Research Ingestion', time: 'Every 6 hours', status: 'Running', agent: 'Research Director' },
              { task: 'Daily Trend Synthesis & SEO Cluster Update', time: 'Daily @ 04:00 UTC', status: 'Scheduled', agent: 'Strategy Director' },
              { task: 'Social Publication Queue Sweep', time: 'Every 5 minutes', status: 'Active (Idempotent)', agent: 'Publishing Operations' },
            ].map((sch, i) => (
              <div key={i} className="p-3 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[#EEE8DE]">{sch.task}</div>
                  <div className="text-[10px] font-mono-metrics text-[#B8B0A5]">{sch.time} • {sch.agent}</div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#303430] text-[#C9B49B] border border-[#414542]">
                  {sch.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
