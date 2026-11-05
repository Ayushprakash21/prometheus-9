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
  pendingApprovalsCount = 2,
}) => {
  // Collapsible state for each nav section in non-collapsed mode
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({
    dist: false,
    perf: false,
  });

  const toggleGroup = (groupId: string) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const NAV_GROUPS: NavGroup[] = [
    {
      id: 'cmd',
      group: 'COMMAND',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'workspace', label: 'My Workspace', icon: Briefcase },
        { id: 'activity_centre', label: 'Activity Centre', icon: Activity },
      ],
    },
    {
      id: 'biz',
      group: 'BUSINESS MANAGEMENT',
      items: [
        { id: 'products', label: 'Products & Services', icon: Layers, badge: productCount },
        { id: 'brand_profile', label: 'Brand Profile', icon: ShieldCheck },
        { id: 'audiences', label: 'Audience & Personas', icon: Users },
        { id: 'marketing_objectives', label: 'Marketing Objectives', icon: Target },
        { id: 'competitors', label: 'Competitor Intelligence', icon: Compass },
      ],
    },
    {
      id: 'intel',
      group: 'MARKETING INTELLIGENCE',
      items: [
        { id: 'market_research', label: 'Market Research', icon: Radar },
        { id: 'trend_intelligence', label: 'Trend Intelligence', icon: TrendingUp },
        { id: 'seo_intelligence', label: 'Keyword & SEO Intel', icon: Search },
        { id: 'strategy', label: 'Marketing Strategy', icon: Zap },
        { id: 'growth_opportunities', label: 'Growth Opportunities', icon: Lightbulb },
      ],
    },
    {
      id: 'workforce',
      group: 'AI WORKFORCE',
      items: [
        { id: 'agents', label: 'Agent Directory', icon: Bot, badge: agentCount },
        { id: 'agent_config', label: 'Agent Configuration', icon: Sliders },
        { id: 'agent_history', label: 'Execution History', icon: History },
        { id: 'automation_rules', label: 'Automation Rules', icon: Cpu },
        { id: 'autonomy', label: 'Autonomy Control', icon: Lock },
        { id: 'approval_centre', label: 'Approval Centre', icon: CheckSquare, badge: pendingApprovalsCount },
      ],
    },
    {
      id: 'creative',
      group: 'CREATIVE STUDIO',
      items: [
        { id: 'content_studio', label: 'Content Studio', icon: FileText },
        { id: 'video_production', label: 'Video Production', icon: Film },
        { id: 'image_studio', label: 'Image & Design Studio', icon: Palette },
        { id: 'asset_library', label: 'Creative Asset Library', icon: Upload },
        { id: 'brand_compliance', label: 'Brand Compliance', icon: AlertCircle },
      ],
    },
    {
      id: 'dist',
      group: 'DISTRIBUTION',
      items: [
        { id: 'social_accounts', label: 'Social Accounts', icon: Share2 },
        { id: 'publishing_centre', label: 'Social Publishing', icon: Send, badge: campaignCount > 0 ? campaignCount : undefined },
        { id: 'publishing_calendar', label: 'Publishing Calendar', icon: Calendar },
        { id: 'publication_history', label: 'Publication History', icon: Clock },
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
    <div className="flex flex-col h-full bg-[#292C29] border-r border-[#414542] text-[#EEE8DE] select-none">
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
                    hasActiveChild ? 'text-[#C9B49B] font-semibold' : 'text-[#B8B0A5]/60 hover:text-[#B8B0A5]'
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
                <div className="h-2 border-b border-[#414542]/40 mb-1" />
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
                        ? 'bg-[#303430] text-[#A16C50] font-semibold border-l-2 border-[#A16C50] shadow-sm'
                        : 'text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430]/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#A16C50]' : 'text-[#B8B0A5]'}`} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!collapsed && item.badge !== undefined && (
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono-metrics border ${
                        item.id === 'approval_centre' && Number(item.badge) > 0
                          ? 'bg-[#A16C50]/20 text-[#C9B49B] border-[#A16C50]/40'
                          : 'bg-[#202221] text-[#C9B49B] border-[#414542]'
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
      <div className="p-3 border-t border-[#414542] flex items-center justify-between bg-[#202221]/50">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono-metrics text-[#B8B0A5]">37 Views Connected</span>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          className="p-1.5 rounded-lg text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430] transition-colors ml-auto"
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
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
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
