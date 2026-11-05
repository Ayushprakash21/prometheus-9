import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Layers, 
  ShieldCheck, 
  Users, 
  Target, 
  Radar, 
  Compass, 
  BarChart3, 
  Bot, 
  Sliders, 
  Cpu, 
  Lock, 
  FileText, 
  Film, 
  Upload, 
  Share2, 
  Send, 
  Calendar, 
  Shield, 
  Settings, 
  FileCode,
  ChevronLeft,
  ChevronRight
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
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface NavGroup {
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
}) => {
  const NAV_GROUPS: NavGroup[] = [
    {
      group: 'COMMAND',
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'workspace', label: 'My Workspace', icon: Briefcase },
      ],
    },
    {
      group: 'BUSINESS',
      items: [
        { id: 'products', label: 'Products & Services', icon: Layers, badge: productCount },
        { id: 'brand_profile', label: 'Brand Profile', icon: ShieldCheck },
        { id: 'audiences', label: 'Audience & Personas', icon: Users },
        { id: 'strategy', label: 'Marketing Strategy', icon: Target },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { id: 'market_research', label: 'Market Research', icon: Radar },
        { id: 'competitors', label: 'Competitor Intelligence', icon: Compass },
        { id: 'analytics', label: 'Analytics & Performance', icon: BarChart3 },
      ],
    },
    {
      group: 'AI WORKFORCE',
      items: [
        { id: 'agents', label: 'Agent Directory', icon: Bot, badge: agentCount },
        { id: 'agent_config', label: 'Agent Configuration', icon: Sliders },
        { id: 'automation_rules', label: 'Automation Rules', icon: Cpu },
        { id: 'autonomy', label: 'Autonomy Control', icon: Lock },
      ],
    },
    {
      group: 'CREATIVE STUDIO',
      items: [
        { id: 'content_studio', label: 'Content Studio', icon: FileText },
        { id: 'video_production', label: 'Video Production', icon: Film },
        { id: 'asset_library', label: 'Asset Library', icon: Upload },
      ],
    },
    {
      group: 'DISTRIBUTION',
      items: [
        { id: 'social_accounts', label: 'Social Accounts', icon: Share2 },
        { id: 'publishing_centre', label: 'Publishing Centre', icon: Send, badge: campaignCount > 0 ? campaignCount : undefined },
        { id: 'publishing_calendar', label: 'Publishing Calendar', icon: Calendar },
      ],
    },
    {
      group: 'ADMINISTRATION',
      items: [
        { id: 'team', label: 'Team & Permissions', icon: Shield },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'audit_logs', label: 'Security & Audit Logs', icon: FileCode },
      ],
    },
  ];

  const renderContent = () => (
    <div className="flex flex-col h-full bg-[#292C29] border-r border-[#414542] text-[#EEE8DE] select-none">
      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {NAV_GROUPS.map((grp) => (
          <div key={grp.group} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-mono-metrics uppercase tracking-wider text-[#B8B0A5]/70 mb-1.5">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#303430] text-[#A16C50] font-semibold border-l-2 border-[#A16C50]'
                      : 'text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430]/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#A16C50]' : 'text-[#B8B0A5]'}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>

                  {!collapsed && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#C9B49B] border border-[#414542]">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Collapse / Expand Toggle Footer */}
      <div className="p-3 border-t border-[#414542] hidden lg:block">
        <button
          onClick={onToggleCollapsed}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430] transition-colors cursor-pointer"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className={`fixed top-16 bottom-0 ${collapsed ? 'w-16' : 'w-64'}`}>
          {renderContent()}
        </div>
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10">
            {renderContent()}
          </div>
        </div>
      )}
    </>
  );
};
