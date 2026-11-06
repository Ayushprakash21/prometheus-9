import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Activity,
  Layers, 
  ShieldCheck, 
  Users, 
  Target, 
  Compass, 
  Radar, 
  TrendingUp, 
  Search, 
  Zap, 
  Lightbulb, 
  Bot, 
  Sliders, 
  History, 
  Cpu, 
  Lock, 
  CheckSquare, 
  FileText, 
  Film, 
  Palette, 
  Upload, 
  AlertCircle, 
  Share2, 
  Send, 
  Calendar, 
  Clock, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Sparkles, 
  Shield, 
  Settings, 
  Server, 
  FileCode, 
  Monitor,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { NavTab } from '../types';
import { useTheme } from '../context/ThemeContext';

interface AppSidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  productCount: number;
  agentCount: number;
  campaignCount: number;
  pendingApprovalsCount?: number;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavGroup {
  id: string;
  group: string;
  items: NavItem[];
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onCloseMobile,
  productCount,
  agentCount,
  campaignCount,
  pendingApprovalsCount = 0,
}) => {
  const { isDark } = useTheme();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const NAV_GROUPS: NavGroup[] = [
    {
      id: 'cmd',
      group: 'COMMAND',
      items: [
        { id: 'overview', label: 'Overview & Telemetry', icon: LayoutDashboard },
        { id: 'workspace', label: 'Founder Workspace', icon: Briefcase },
        { id: 'activity_centre', label: 'Activity & Audit Centre', icon: Activity },
      ],
    },
    {
      id: 'biz',
      group: 'BUSINESS REGISTRY',
      items: [
        { id: 'products', label: 'Products & Services', icon: Layers, badge: productCount },
        { id: 'brand_profile', label: 'Brand Profile & Voice', icon: Sparkles },
        { id: 'audiences', label: 'Audience Personas', icon: Users },
        { id: 'marketing_objectives', label: 'Growth Objectives', icon: Target },
        { id: 'competitors', label: 'Competitive Matrix', icon: Compass },
      ],
    },
    {
      id: 'intel',
      group: 'MARKETING INTEL',
      items: [
        { id: 'market_research', label: 'Autonomous Research', icon: Radar },
        { id: 'trend_intelligence', label: 'Trend & Cultural Shifts', icon: TrendingUp },
        { id: 'seo_intelligence', label: 'Search Intent & SEO', icon: Search },
        { id: 'strategy', label: 'Growth Strategy', icon: Zap },
        { id: 'growth_opportunities', label: 'Arbitrage Opportunities', icon: Lightbulb },
      ],
    },
    {
      id: 'workforce',
      group: 'AI WORKFORCE',
      items: [
        { id: 'agents', label: 'Specialist Roster', icon: Bot, badge: agentCount },
        { id: 'agent_config', label: 'Agent Configuration', icon: Sliders },
        { id: 'agent_history', label: 'Run Execution Logs', icon: History },
        { id: 'automation_rules', label: 'Autonomous Rules', icon: Cpu },
        { id: 'autonomy', label: 'Guardrails & Safety', icon: Lock },
        { id: 'approval_centre', label: 'Human-in-the-Loop', icon: CheckSquare, badge: pendingApprovalsCount },
      ],
    },
    {
      id: 'studio',
      group: 'CREATIVE STUDIO',
      items: [
        { id: 'content_studio', label: 'Copy & Messaging', icon: FileText },
        { id: 'video_production', label: 'Automated Video Studio', icon: Film },
        { id: 'image_studio', label: 'Visual Art Direction', icon: Palette },
        { id: 'asset_library', label: 'Media Asset Vault', icon: Upload },
        { id: 'brand_compliance', label: 'Deterministic Guardrails', icon: AlertCircle },
      ],
    },
    {
      id: 'dist',
      group: 'DISTRIBUTION',
      items: [
        { id: 'social_accounts', label: 'Connected Channels', icon: Share2 },
        { id: 'publishing_centre', label: 'Autonomous Publisher', icon: Send },
        { id: 'publishing_calendar', label: 'Master Schedule', icon: Calendar },
        { id: 'publication_history', label: 'Dispatch History', icon: Clock },
      ],
    },
    {
      id: 'perf',
      group: 'PERFORMANCE',
      items: [
        { id: 'analytics', label: 'Analytics & Performance', icon: BarChart3 },
        { id: 'campaign_analytics', label: 'Campaign Analytics', icon: PieChart },
        { id: 'conversion_intelligence', label: 'Conversion Intelligence', icon: LineChart },
        { id: 'growth_optimization', label: 'Growth Optimization', icon: Sparkles },
      ],
    },
    {
      id: 'admin',
      group: 'ADMINISTRATION',
      items: [
        { id: 'team', label: 'Team & Permissions', icon: Shield },
        { id: 'settings', label: 'Organization Settings', icon: Settings },
        { id: 'ai_providers', label: 'AI Provider Config', icon: Server },
        { id: 'audit_logs', label: 'Security & Audit Logs', icon: FileCode },
        { id: 'system_monitoring', label: 'System Monitoring', icon: Monitor },
      ],
    },
  ];

  const renderContent = () => (
    <div className={`flex flex-col h-full select-none transition-colors border-r ${
      isDark 
        ? 'bg-[#181A18] border-[#2E332E] text-[#F5F2EB]' 
        : 'bg-[#FFFFFF] border-[#E2E1DC] text-[#262724]'
    }`}>
      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-4 custom-scrollbar">
        {NAV_GROUPS.map((grp) => {
          const isGroupCollapsed = !collapsed && collapsedGroups[grp.id];
          const hasActiveChild = grp.items.some(item => item.id === activeTab);

          return (
            <div key={grp.id} className="space-y-0.5">
              {!collapsed ? (
                <button
                  onClick={() => toggleGroup(grp.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-1 text-[10px] font-mono-metrics uppercase tracking-wider transition-colors ${
                    isDark
                      ? (hasActiveChild ? 'text-[#C9B49B] font-semibold' : 'text-[#8E8A82] hover:text-[#C5BFB5]')
                      : (hasActiveChild ? 'text-[#292B29] font-bold' : 'text-[#898980] hover:text-[#262724]')
                  }`}
                >
                  <span>{grp.group}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isGroupCollapsed ? '-rotate-90' : 'rotate-0'
                    }`}
                  />
                </button>
              ) : (
                <div className={`h-2 border-b mb-1 ${isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'}`} />
              )}

              {(!isGroupCollapsed || collapsed) && grp.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                      isActive
                        ? (isDark 
                            ? 'bg-[#222622] text-[#C9B49B] font-semibold border-l-2 border-[#C9B49B] shadow-xs'
                            : 'bg-[#F1EAE0] text-[#292B29] font-bold border-l-2 border-[#B99A78] shadow-xs')
                        : (isDark
                            ? 'text-[#C5BFB5] hover:text-[#F5F2EB] hover:bg-[#1E221E]'
                            : 'text-[#565851] hover:text-[#262724] hover:bg-[#F8F8F6]')
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${
                        isActive 
                          ? (isDark ? 'text-[#C9B49B]' : 'text-[#997653]') 
                          : (isDark ? 'text-[#8E8A82]' : 'text-[#777970]')
                      }`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono-metrics border ${
                        item.id === 'approval_centre' && Number(item.badge) > 0
                          ? (isDark ? 'bg-rose-950/20 text-rose-400 border-rose-500/40 font-bold' : 'bg-[#FCEBE8] text-[#A33327] border-[#FFCDD2] font-bold')
                          : isDark
                          ? 'bg-[#121312] text-[#C9B49B] border-[#2E332E]'
                          : 'bg-[#F1F1EE] text-[#555750] border-[#E2E1DC]'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Sidebar Footer with Collapse Toggle */}
      <div className={`p-3 border-t flex items-center justify-between transition-colors ${
        isDark ? 'border-[#2E332E] bg-[#141614]' : 'border-[#E2E1DC] bg-[#F8F8F6]'
      }`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full animate-pulse ${
              isDark ? 'bg-emerald-400' : 'bg-[#2E7D32]'
            }`} />
            <span className={`text-[11px] font-mono-metrics ${isDark ? 'text-[#8E8A82]' : 'text-[#555750]'}`}>
              37 Views Connected
            </span>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          className={`p-1.5 rounded-lg transition-colors ml-auto ${
            isDark ? 'text-[#8E8A82] hover:text-[#F5F2EB] hover:bg-[#2E332E]' : 'text-[#555750] hover:text-[#262724] hover:bg-[#F1F1EE]'
          }`}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 z-20 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {renderContent()}
      </aside>

      {/* Mobile Sidebar Overlay Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
