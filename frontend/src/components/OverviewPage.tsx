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
  Plus, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();

  const connectedSocialCount = socialAccounts.filter(
    (a) => a.authorization_status === 'connected' || a.authorization_status === 'active'
  ).length;

  const activeCampaignsCount = campaigns.filter(c => c.status === 'active').length;
  const readyAgentsCount = agents.filter(a => a.status === 'idle' || a.status === 'active').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Title & Operational Status Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-5 ${
        isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'
      }`}>
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
            Operational Overview
          </h1>
          <p className={`text-xs mt-1 ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
            Real-time status of your autonomous marketing engine, registered products, and creative operations.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#292B29] hover:bg-[#414542] text-xs font-semibold text-[#FFFFFF] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate('brand_profile')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-[#1C1E1C] border-[#2E332E] hover:border-[#C9B49B] text-[#F5F2EB]' 
                : 'bg-[#F1EAE0] border-[#E2D5C5] hover:bg-[#E9DFD2] text-[#514334]'
            }`}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
            <span>Brand Profile</span>
          </button>
          <button
            onClick={() => onNavigate('social_accounts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-[#1C1E1C] border-[#2E332E] hover:border-[#C9B49B] text-[#F5F2EB]' 
                : 'bg-[#F1EAE0] border-[#E2D5C5] hover:bg-[#E9DFD2] text-[#514334]'
            }`}
          >
            <Share2 className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
            <span>Connect Social</span>
          </button>
        </div>
      </div>

      {/* METRIC CARDS GRID */}
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
            statusColor: isPaused 
              ? (isDark ? 'text-amber-400' : 'text-[#B78103]') 
              : (isDark ? 'text-emerald-400' : 'text-[#2E7D32]')
          },
        ].map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(m.tab)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isDark 
                  ? 'bg-[#181A18] border-[#2E332E] hover:border-[#C9B49B]' 
                  : 'bg-[#FFFFFF] border-[#E2E1DC] hover:border-[#B99A78] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-medium truncate ${isDark ? 'text-[#8E8A82]' : 'text-[#555750]'}`}>
                  {m.label}
                </span>
                <Icon className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
              </div>
              <div className={`text-xl font-bold ${m.statusColor || (isDark ? 'text-[#F5F2EB]' : 'text-[#262724]')}`}>
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
          <div className={`rounded-xl border p-5 ${
            isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  Active Campaigns
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Campaigns currently executing in your active portfolio
                </p>
              </div>
              <button
                onClick={() => onNavigate('publishing_centre')}
                className={`text-xs hover:underline flex items-center gap-1 font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                <span>View all</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className={`p-8 text-center rounded-lg border text-xs ${
                isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#74766F]'
              }`}>
                No active campaigns found. Launch a campaign from Creative Studio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[10px] font-mono-metrics uppercase ${
                      isDark ? 'border-[#2E332E] text-[#8E8A82]' : 'border-[#E2E1DC] text-[#74766F]'
                    }`}>
                      <th className="pb-2.5">Campaign Title</th>
                      <th className="pb-2.5">Objective</th>
                      <th className="pb-2.5">Status</th>
                      <th className="pb-2.5 text-right">Created</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#2E332E]' : 'divide-[#E2E1DC]'}`}>
                    {campaigns.slice(0, 4).map((c) => (
                      <tr key={c.id} className={`transition-colors ${isDark ? 'hover:bg-[#1E221E]' : 'hover:bg-[#F8F8F6]'}`}>
                        <td className={`py-2.5 font-medium ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>{c.title}</td>
                        <td className={`py-2.5 truncate max-w-[160px] ${isDark ? 'text-[#C5BFB5]' : 'text-[#555750]'}`}>{c.objective}</td>
                        <td className="py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics uppercase font-medium border ${
                            isDark 
                              ? 'bg-[#141614] text-emerald-400 border-emerald-500/30' 
                              : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className={`py-2.5 text-right font-mono-metrics ${isDark ? 'text-[#8E8A82]' : 'text-[#74766F]'}`}>
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
          <div className={`rounded-xl border p-5 ${
            isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  Recent Publications
                </h3>
                <p className={`text-[11px] ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Verified posts published via platform APIs
                </p>
              </div>
              <button
                onClick={() => onNavigate('social_accounts')}
                className={`text-xs hover:underline flex items-center gap-1 font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                <span>Social Accounts</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {publications.length === 0 ? (
              <div className={`p-8 text-center rounded-lg border text-xs ${
                isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#74766F]'
              }`}>
                No publications recorded. Connect authorized social channels to begin.
              </div>
            ) : (
              <div className="space-y-2">
                {publications.slice(0, 4).map((pub) => (
                  <div 
                    key={pub.id} 
                    className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold uppercase ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>{pub.platform}</span>
                      <span className={`font-mono-metrics text-[11px] ${isDark ? 'text-[#8E8A82]' : 'text-[#74766F]'}`}>ID: {pub.platform_post_id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-mono-metrics font-semibold ${
                        isDark ? 'text-emerald-400' : 'text-[#2E7D32]'
                      }`}>✓ VERIFIED BY API</span>
                      <a 
                        href={pub.platform_post_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className={`hover:underline flex items-center gap-1 font-medium ${
                          isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                        }`}
                      >
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
          <div className={`rounded-xl border p-5 ${
            isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                Active Products
              </h3>
              <button
                onClick={() => onNavigate('products')}
                className={`text-xs hover:underline font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
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
                        ? (isDark ? 'bg-[#222522] border-[#C9B49B]' : 'bg-[#F1EAE0] border-[#B99A78]')
                        : (isDark ? 'bg-[#1F221F] border-[#2E332E] hover:border-[#C9B49B]/60' : 'bg-[#F8F8F6] border-[#E2E1DC] hover:border-[#B99A78]')
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-xs flex items-center gap-2 ${
                        isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'
                      }`}>
                        <span>{p.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#B99A78]" />}
                      </div>
                      <div className={`text-[11px] truncate max-w-[200px] ${
                        isDark ? 'text-[#8E8A82]' : 'text-[#555750]'
                      }`}>
                        {p.tagline || p.category}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono-metrics font-medium ${
                      isDark ? 'text-[#C9B49B]' : 'text-[#806347]'
                    }`}>
                      {p.features_count || 0} features
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Agent Activity & Standby */}
          <div className={`rounded-xl border p-5 ${
            isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={`text-sm font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                AI Workforce Activity
              </h3>
              <button
                onClick={() => onNavigate('agents')}
                className={`text-xs hover:underline font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                Directory ({agents.length})
              </button>
            </div>

            {agentRuns.length === 0 ? (
              <div className="space-y-2">
                {agents.slice(0, 4).map((ag) => (
                  <div 
                    key={ag.name} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>{ag.name}</div>
                      <div className={`text-[10px] font-mono-metrics ${isDark ? 'text-[#8E8A82]' : 'text-[#74766F]'}`}>{ag.category} Specialist</div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[10px] font-mono-metrics font-semibold ${
                      isDark ? 'text-emerald-400' : 'text-[#2E7D32]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-[#2E7D32]'}`} />
                      <span>READY</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {agentRuns.slice(0, 4).map((r) => (
                  <div 
                    key={r.id} 
                    className={`p-2.5 rounded-lg border flex items-center justify-between text-xs ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
                    }`}
                  >
                    <div>
                      <div className={`font-medium ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>{r.agent_role}</div>
                      <div className={`text-[10px] font-mono-metrics ${isDark ? 'text-[#8E8A82]' : 'text-[#74766F]'}`}>{r.duration_ms}ms runtime</div>
                    </div>
                    <span className={`text-[10px] font-mono-metrics uppercase font-semibold ${
                      isDark ? 'text-emerald-400' : 'text-[#2E7D32]'
                    }`}>
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
