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
    <div className="space-y-8 pb-16 max-w-[1600px] mx-auto">
      {/* Page Title & Operational Status Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'
      }`}>
        <div>
          <h1 className={`text-[28px] font-[650] tracking-tight leading-tight ${
            isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'
          }`}>
            Operational Overview
          </h1>
          <p className={`text-[13.5px] mt-1.5 ${
            isDark ? 'text-[#8E8A82]' : 'text-[#555750]'
          }`}>
            Real-time status of your autonomous marketing engine, registered products, and creative operations.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onOpenAddProduct}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#292B29] hover:bg-[#414542] text-[13.5px] font-semibold text-[#FFFFFF] transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#D4C1A9]" />
            <span>Add Product</span>
          </button>
          <button
            onClick={() => onNavigate('brand_profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-medium border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-[#1C1E1C] border-[#2E332E] hover:border-[#C9B49B] text-[#F5F2EB]' 
                : 'bg-[#F1EAE0] border-[#E2D5C5] hover:bg-[#E9DFD2] text-[#514334]'
            }`}
          >
            <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
            <span>Brand Profile</span>
          </button>
          <button
            onClick={() => onNavigate('social_accounts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13.5px] font-medium border transition-colors cursor-pointer ${
              isDark 
                ? 'bg-[#1C1E1C] border-[#2E332E] hover:border-[#C9B49B] text-[#F5F2EB]' 
                : 'bg-[#F1EAE0] border-[#E2D5C5] hover:bg-[#E9DFD2] text-[#514334]'
            }`}
          >
            <Share2 className={`w-4 h-4 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
            <span>Connect Social</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* FIRST ROW: SIX METRIC CARDS (Full visibility, no ellipsis) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
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
              className={`p-3 sm:p-3.5 xl:p-3 2xl:p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between min-h-[125px] ${
                isDark 
                  ? 'bg-[#181A18] border-[#2E332E] hover:border-[#C9B49B]' 
                  : 'bg-[#FFFFFF] border-[#E2E1DC] hover:border-[#B99A78] shadow-xs'
              }`}
            >
              {/* Header with Title (wrapping enabled, no truncation) & Icon */}
              <div className="flex items-start justify-between gap-1.5">
                <span className={`text-[12.5px] sm:text-[13px] font-medium leading-tight min-h-[34px] flex items-center break-normal ${
                  isDark ? 'text-[#8E8A82]' : 'text-[#555750]'
                }`}>
                  {m.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  isDark ? 'bg-[#121312] text-[#C9B49B]' : 'bg-[#F1EAE0] text-[#997653]'
                }`}>
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
              </div>

              {/* Metric Value */}
              <div className={`text-[26px] sm:text-[28px] font-bold tracking-tight mt-2 ${
                m.statusColor || (isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]')
              }`}>
                {m.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* SECOND ROW: ACTIVE CAMPAIGNS (60%) + ACTIVE PRODUCTS (40%) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Active Campaigns Table (approx 60% -> 7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-6 flex flex-col justify-between ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-[17px] font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>
                  Active Campaigns
                </h2>
                <p className={`text-[13px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>
                  Campaigns currently executing in your active portfolio
                </p>
              </div>
              <button
                onClick={() => onNavigate('publishing_centre')}
                className={`text-[13px] hover:underline flex items-center gap-1.5 font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border text-[13.5px] leading-relaxed my-auto ${
                isDark 
                  ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' 
                  : 'bg-[#F3F2EE] border-[#E2E1DC] text-[#555750]'
              }`}>
                No active campaigns found. Launch a campaign from Creative Studio.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-[13.5px]">
                  <thead>
                    <tr className={`border-b text-[11px] font-mono-metrics uppercase tracking-wider ${
                      isDark ? 'border-[#2E332E] text-[#8E8A82] bg-[#141614]' : 'border-[#E2E1DC] text-[#555750] bg-[#F3F1ED]'
                    }`}>
                      <th className="py-2.5 px-3 rounded-l">Campaign Title</th>
                      <th className="py-2.5 px-3">Objective</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right rounded-r">Created</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#2E332E]' : 'divide-[#E2E1DC]'}`}>
                    {campaigns.slice(0, 4).map((c) => (
                      <tr key={c.id} className={`transition-colors ${isDark ? 'hover:bg-[#1E221E]' : 'hover:bg-[#F8F8F6]'}`}>
                        <td className={`py-3 px-3 font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>{c.title}</td>
                        <td className={`py-3 px-3 truncate max-w-[200px] ${isDark ? 'text-[#C5BFB5]' : 'text-[#555750]'}`}>{c.objective}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2.5 py-0.5 rounded text-[11px] font-mono-metrics uppercase font-semibold border ${
                            isDark 
                              ? 'bg-[#141614] text-emerald-400 border-emerald-500/30' 
                              : 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className={`py-3 px-3 text-right font-mono-metrics text-[12px] ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>
                          {new Date(c.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Active Products Portfolio (approx 40% -> 5 cols) */}
        <div className={`lg:col-span-5 rounded-xl border p-6 flex flex-col justify-between ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-[17px] font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>
                  Active Products
                </h2>
                <p className={`text-[13px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>
                  Target brands in your marketing workspace
                </p>
              </div>
              <button
                onClick={() => onNavigate('products')}
                className={`text-[13px] hover:underline font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                Manage ({products.length})
              </button>
            </div>

            <div className="space-y-3">
              {products.slice(0, 4).map((p) => {
                const isSelected = selectedProduct?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => onSelectProduct(p)}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? (isDark ? 'bg-[#222522] border-[#C9B49B]' : 'bg-[#F1EAE0] border-[#B99A78]')
                        : (isDark ? 'bg-[#1F221F] border-[#2E332E] hover:border-[#C9B49B]/60' : 'bg-[#F3F2EE] border-[#E2E1DC] hover:border-[#B99A78]')
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-[14px] flex items-center gap-2 ${
                        isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'
                      }`}>
                        <span>{p.name}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#B99A78]" />}
                      </div>
                      <div className={`text-[12.5px] truncate max-w-[240px] mt-0.5 ${
                        isDark ? 'text-[#8E8A82]' : 'text-[#555750]'
                      }`}>
                        {p.tagline || p.category}
                      </div>
                    </div>
                    <span className={`text-[11px] font-mono-metrics font-medium px-2 py-0.5 rounded border ${
                      isDark ? 'bg-[#141614] border-[#2E332E] text-[#C9B49B]' : 'bg-[#FFFFFF] border-[#E2E1DC] text-[#806347]'
                    }`}>
                      {p.features_count || 0} features
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* THIRD ROW: RECENT PUBLICATIONS (60%) + WORKFORCE (40%)   */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Recent Publications Ledger (approx 60% -> 7 cols) */}
        <div className={`lg:col-span-7 rounded-xl border p-6 flex flex-col justify-between ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-[17px] font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>
                  Recent Publications
                </h2>
                <p className={`text-[13px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>
                  Verified posts published via platform APIs
                </p>
              </div>
              <button
                onClick={() => onNavigate('social_accounts')}
                className={`text-[13px] hover:underline flex items-center gap-1.5 font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                <span>Social Accounts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {publications.length === 0 ? (
              <div className={`p-8 text-center rounded-xl border text-[13.5px] leading-relaxed my-auto ${
                isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F3F2EE] border-[#E2E1DC] text-[#555750]'
              }`}>
                No publications recorded. Connect authorized social channels to begin.
              </div>
            ) : (
              <div className="space-y-3">
                {publications.slice(0, 4).map((pub) => (
                  <div 
                    key={pub.id} 
                    className={`p-3.5 rounded-lg border flex items-center justify-between text-[13.5px] ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F3F2EE] border-[#E2E1DC]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-semibold uppercase ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>{pub.platform}</span>
                      <span className={`font-mono-metrics text-[12px] ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>ID: {pub.platform_post_id}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-mono-metrics font-semibold ${
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
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Workforce Activity & Standby (approx 40% -> 5 cols) */}
        <div className={`lg:col-span-5 rounded-xl border p-6 flex flex-col justify-between ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className={`text-[17px] font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>
                  AI Workforce Activity
                </h2>
                <p className={`text-[13px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>
                  Autonomous agents and execution runtimes
                </p>
              </div>
              <button
                onClick={() => onNavigate('agents')}
                className={`text-[13px] hover:underline font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347] hover:text-[#5E4935]'
                }`}
              >
                Directory ({agents.length})
              </button>
            </div>

            {agentRuns.length === 0 ? (
              <div className="space-y-3">
                {agents.slice(0, 4).map((ag) => (
                  <div 
                    key={ag.name} 
                    className={`p-3 rounded-lg border flex items-center justify-between text-[13.5px] ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F3F2EE] border-[#E2E1DC]'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-[14px] ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>{ag.name}</div>
                      <div className={`text-[12px] font-mono-metrics mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>{ag.category} Specialist</div>
                    </div>
                    <span className={`flex items-center gap-1.5 text-[11px] font-mono-metrics font-semibold px-2 py-0.5 rounded border ${
                      isDark 
                        ? 'bg-[#141614] border-emerald-500/30 text-emerald-400' 
                        : 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-[#2E7D32]'}`} />
                      <span>READY</span>
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {agentRuns.slice(0, 4).map((r) => (
                  <div 
                    key={r.id} 
                    className={`p-3 rounded-lg border flex items-center justify-between text-[13.5px] ${
                      isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F3F2EE] border-[#E2E1DC]'
                    }`}
                  >
                    <div>
                      <div className={`font-semibold text-[14px] ${isDark ? 'text-[#F5F2EB]' : 'text-[#292B29]'}`}>{r.agent_role}</div>
                      <div className={`text-[12px] font-mono-metrics mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'}`}>{r.duration_ms}ms runtime</div>
                    </div>
                    <span className={`text-[11px] font-mono-metrics uppercase font-semibold px-2 py-0.5 rounded border ${
                      isDark 
                        ? 'bg-[#141614] border-emerald-500/30 text-emerald-400' 
                        : 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
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
