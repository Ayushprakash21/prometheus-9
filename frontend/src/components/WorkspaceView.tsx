import React from 'react';
import { 
  Briefcase, 
  Sparkles, 
  CheckSquare, 
  Film, 
  Send, 
  Bot, 
  ArrowRight
} from 'lucide-react';
import { Product, NavTab } from '../types';
import { useTheme } from '../context/ThemeContext';

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
  const { isDark } = useTheme();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6 ${
        isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-mono-metrics uppercase tracking-wider font-semibold ${
              isDark ? 'text-[#C9B49B]' : 'text-[#8E7656]'
            }`}>
              Personal Operating Desk
            </span>
            <span className={isDark ? 'text-[#8E8A82]' : 'text-[#85867F]'}>•</span>
            <span className={`text-xs font-mono-metrics font-medium ${
              isDark ? 'text-emerald-400' : 'text-[#2E7D32]'
            }`}>All Systems Operational</span>
          </div>
          <h2 className={`font-editorial text-2xl sm:text-3xl font-bold tracking-tight ${
            isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'
          }`}>
            My Workspace
          </h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-2xl ${
            isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'
          }`}>
            Unified command cockpit for active campaigns, creative jobs, and pending governance gates across your product portfolio.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenOnboarding}
            className="px-4 py-2 rounded-lg bg-[#292B29] hover:bg-[#414542] text-xs font-bold text-[#FFFFFF] flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-[#D4C1A9]" />
            <span>Launch Onboarding Wizard</span>
          </button>
        </div>
      </div>

      {/* Quick Launchpad Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'New Video Render', desc: 'Create 9:16 Shorts or 16:9 MP4', icon: Film, tab: 'video_production' as NavTab, action: 'Launch Studio' },
          { title: 'Approval Queue', desc: 'Review pending agent outputs', icon: CheckSquare, tab: 'approval_centre' as NavTab, action: 'Inspect Items' },
          { title: 'Agent Directory', desc: '12 specialized AI agents active', icon: Bot, tab: 'agents' as NavTab, action: 'Manage Agents' },
          { title: 'Publishing Calendar', desc: 'Scheduled distribution ledger', icon: Send, tab: 'publishing_calendar' as NavTab, action: 'Open Calendar' },
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group space-y-3 ${
                isDark 
                  ? 'bg-[#181A18] border-[#2E332E] hover:border-[#C9B49B]' 
                  : 'bg-[#FFFFFF] border-[#E2E1DC] hover:border-[#B99A78] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-[#121312] text-[#C9B49B] border-[#2E332E] group-hover:border-[#C9B49B]' 
                    : 'bg-[#F1EAE0] text-[#997653] border-[#E2D5C5] group-hover:border-[#B99A78]'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                  isDark ? 'text-[#8E8A82] group-hover:text-[#F5F2EB]' : 'text-[#74766F] group-hover:text-[#262724]'
                }`} />
              </div>
              <div>
                <h4 className={`text-sm font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  {item.title}
                </h4>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  {item.desc}
                </p>
              </div>
              <div className={`text-[11px] font-mono-metrics font-medium pt-1 ${
                isDark ? 'text-[#C9B49B]' : 'text-[#806347]'
              }`}>
                {item.action} →
              </div>
            </div>
          );
        })}
      </div>

      {/* Priority Focus Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Active Focus: Product Portfolio */}
        <div className={`p-5 rounded-xl border space-y-4 ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
              Current Product Scope
            </h3>
            <span className={`text-xs font-mono-metrics font-medium ${isDark ? 'text-[#C9B49B]' : 'text-[#806347]'}`}>
              {selectedProduct ? 'Active' : 'Global'}
            </span>
          </div>

          {selectedProduct ? (
            <div className={`p-4 rounded-lg border space-y-2 ${
              isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  {selectedProduct.name}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                  isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F1F1EE] border-[#E2E1DC] text-[#555750]'
                }`}>
                  {selectedProduct.category}
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                {selectedProduct.description || selectedProduct.tagline || 'Autonomous growth instance registered.'}
              </p>
              <div className="flex items-center gap-4 pt-1 text-xs">
                <button
                  onClick={() => onNavigate('brand_profile')}
                  className={`hover:underline font-medium ${isDark ? 'text-[#C9B49B]' : 'text-[#806347]'}`}
                >
                  Configure Brand Voice →
                </button>
                <button
                  onClick={() => onNavigate('products')}
                  className={`hover:underline font-medium ${isDark ? 'text-[#C9B49B]' : 'text-[#806347]'}`}
                >
                  Manage Features →
                </button>
              </div>
            </div>
          ) : (
            <div className={`p-6 text-center rounded-lg border text-xs ${
              isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#74766F]'
            }`}>
              No active product selected. Click on a product from the top bar to set context.
            </div>
          )}
        </div>

        {/* Governance & Human-In-The-Loop */}
        <div className={`p-5 rounded-xl border space-y-4 ${
          isDark ? 'bg-[#181A18] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC] shadow-xs'
        }`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-bold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
              Governance & Safety Rails
            </h3>
            <span className={`text-xs font-mono-metrics font-medium ${isDark ? 'text-emerald-400' : 'text-[#2E7D32]'}`}>
              Deterministic Guard Active
            </span>
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
            }`}>
              <div>
                <div className={`font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  Human Approval Gate
                </div>
                <div className={`text-[11px] ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Requires sign-off before social publishing
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics font-medium border ${
                isDark ? 'bg-[#141614] border-[#2E332E] text-[#8E8A82]' : 'bg-[#F1F1EE] border-[#E2E1DC] text-[#555750]'
              }`}>
                ENFORCED
              </span>
            </div>

            <div className={`p-3 rounded-lg border flex items-center justify-between text-xs ${
              isDark ? 'bg-[#1F221F] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
            }`}>
              <div>
                <div className={`font-semibold ${isDark ? 'text-[#F5F2EB]' : 'text-[#262724]'}`}>
                  Zero-Hallucination Claim Verifier
                </div>
                <div className={`text-[11px] ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Bans ungrounded statistics and claims
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics font-medium border ${
                isDark ? 'bg-[#141614] border-[#2E332E] text-emerald-400' : 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]'
              }`}>
                ACTIVE
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
