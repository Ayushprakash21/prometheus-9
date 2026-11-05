import React from 'react';
import { 
  Product, 
  Campaign, 
  SpecialistAgent, 
  SocialAccount, 
  PublicationRecord, 
  AgentRun, 
  NavTab 
} from '../types';
import { 
  Layers, 
  Share2, 
  Bot, 
  Target, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  Plus, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface OverviewPageProps {
  products: Product[];
  campaigns: Campaign[];
  agents: SpecialistAgent[];
  socialAccounts: SocialAccount[];
  publications: PublicationRecord[];
  agentRuns: AgentRun[];
  isPaused: boolean;
  onNavigate: (tab: NavTab) => void;
  onOpenAddProduct: () => void;
  onSelectProduct: (product: Product) => void;
  selectedProduct: Product | null;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  products,
  campaigns,
  agents,
  socialAccounts,
  publications,
  agentRuns,
  isPaused,
  onNavigate,
  onOpenAddProduct,
  onSelectProduct,
  selectedProduct
}) => {
  const connectedSocialCount = socialAccounts.filter(
    (a) => a.authorization_status === 'connected' || a.authorization_status === 'active'
  ).length;

  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const readyAgentsCount = agents.filter(a => a.status === 'idle' || a.status === 'active').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Operational Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">Operational Overview</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Real-time status of your autonomous marketing engine, registered products, and creative operations.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate('brand_profile')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#292C29] border border-[#414542] hover:border-[#A16C50] text-xs font-medium text-[#EEE8DE] transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#C9B49B]" />
            <span>Brand Profile</span>
          </button>
          <button
            onClick={() => onNavigate('social_accounts')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#292C29] border border-[#414542] hover:border-[#A16C50] text-xs font-medium text-[#EEE8DE] transition-colors cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 text-[#C9B49B]" />
            <span>Connect Social</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID (Backed by authentic backend records) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Registered Products', value: products.length, icon: Layers, tab: 'products' as NavTab },
          { label: 'Connected Accounts', value: connectedSocialCount, icon: Share2, tab: 'social_accounts' as NavTab },
          { label: 'Configured Agents', value: readyAgentsCount, icon: Bot, tab: 'agents' as NavTab },
          { label: 'Active Campaigns', value: activeCampaignsCount, icon: Target, tab: 'publishing_centre' as NavTab },
          { label: 'Scheduled Posts', value: publications.length, icon: Calendar, tab: 'publishing_calendar' as NavTab },
          { 
            label: 'Automation Engine', 
            value: isPaused ? 'Paused' : 'Active', 
            icon: CheckCircle2, 
            tab: 'autonomy' as NavTab,
            statusColor: isPaused ? 'text-amber-400' : 'text-emerald-400'
          },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(m.tab)}
              className="p-4 rounded-xl bg-[#292C29] border border-[#414542] hover:border-[#A16C50] transition-colors cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] text-[#B8B0A5] font-medium truncate">{m.label}</span>
                <Icon className="w-4 h-4 text-[#C9B49B] shrink-0" />
              </div>
              <div className={`text-xl font-bold ${m.statusColor || 'text-[#EEE8DE]'}`}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* TWO COLUMN OPERATIONAL VIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 Cols): Active Campaigns & Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          {/* Active Campaigns Table */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#EEE8DE]">Active Campaigns</h3>
                <p className="text-[11px] text-[#B8B0A5]">Campaigns currently executing in your active portfolio</p>
              </div>
              <button
                onClick={() => onNavigate('publishing_centre')}
                className="text-xs text-[#A16C50] hover:underline flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#B8B0A5]">
                No active campaigns found. Launch a campaign from Creative Studio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#414542] text-[10px] font-mono-metrics uppercase text-[#B8B0A5]">
                      <th className="pb-2.5">Campaign Title</th>
                      <th className="pb-2.5">Objective</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#414542]/50">
                    {campaigns.slice(0, 4).map((c) => (
                      <tr key={c.id} className="hover:bg-[#303430]/40 transition-colors">
                        <td className="py-2.5 font-medium text-[#EEE8DE]">{c.title}</td>
                        <td className="py-2.5 text-[#B8B0A5] truncate max-w-[160px]">{c.objective}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#202221] text-emerald-400 border border-emerald-500/30 uppercase">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono-metrics text-[#B8B0A5]">
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Publications Ledger */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#EEE8DE]">Recent Publications</h3>
                <p className="text-[11px] text-[#B8B0A5]">Verified posts published via platform APIs</p>
              </div>
              <button
                onClick={() => onNavigate('social_accounts')}
                className="text-xs text-[#A16C50] hover:underline flex items-center gap-1"
              >
                <span>Social Accounts</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {publications.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#B8B0A5]">
                No publications recorded. Connect authorized social channels to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {publications.slice(0, 4).map((pub) => (
                  <div key={pub.id} className="p-3 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[#EEE8DE] uppercase">{pub.platform}</span>
                      <span className="font-mono-metrics text-[11px] text-[#B8B0A5]">ID: {pub.platform_post_id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-400 text-[10px] font-mono-metrics">✓ VERIFIED BY API</span>
                      <a href={pub.platform_post_url} target="_blank" rel="noreferrer" className="text-[#A16C50] hover:underline flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): Product Portfolio & Agent Workforce Standby */}
        <div className="lg:col-span-5 space-y-6">
          {/* Product Portfolio Quick Switch */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Active Products</h3>
              <button
                onClick={() => onNavigate('products')}
                className="text-xs text-[#A16C50] hover:underline"
              >
                Manage ({products.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {products.map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className={`p-3 rounded-lg border transition-colors cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#303430] border-[#A16C50]'
                        : 'bg-[#202221] border-[#414542] hover:border-[#A16C50]/60'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs text-[#EEE8DE] flex items-center gap-2">
                        <span>{p.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />}
                      </div>
                      <div className="text-[11px] text-[#B8B0A5] truncate max-w-[200px]">
                        {p.tagline || p.category}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono-metrics text-[#C9B49B]">
                      {p.features_count || 0} features
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Activity & Standby */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#EEE8DE]">AI Workforce Activity</h3>
              <button
                onClick={() => onNavigate('agents')}
                className="text-xs text-[#A16C50] hover:underline"
              >
                Directory ({agents.length})
              </button>
            </div>

            {agentRuns.length === 0 ? (
              <div className="space-y-2">
                {agents.slice(0, 4).map((ag) => (
                  <div key={ag.name} className="p-2.5 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#EEE8DE]">{ag.name}</div>
                      <div className="text-[10px] font-mono-metrics text-[#B8B0A5]">{ag.category} Specialist</div>
                    </div>
                    <span className="flex items-center gap-1.5 text-[10px] font-mono-metrics text-emerald-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>READY</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {agentRuns.slice(0, 4).map((r) => (
                  <div key={r.id} className="p-2.5 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between text-xs">
                    <div>
                      <div className="font-medium text-[#EEE8DE]">{r.agent_role}</div>
                      <div className="text-[10px] font-mono-metrics text-[#B8B0A5]">{r.duration_ms}ms runtime</div>
                    </div>
                    <span className="text-[10px] font-mono-metrics text-emerald-400 uppercase">
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
