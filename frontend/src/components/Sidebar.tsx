import React from "react";
import {
  LayoutDashboard,
  Boxes,
  Compass,
  Target,
  FileText,
  Video,
  Image,
  Share2,
  Calendar,
  BarChart3,
  TrendingUp,
  Bot,
  Layers,
  Sliders,
  ShieldCheck,
  Activity,
  Settings
} from "lucide-react";

export type NavSection =
  | "overview"
  | "portfolio"
  | "intelligence"
  | "campaigns"
  | "content_studio"
  | "video_studio"
  | "assets"
  | "social_publishing"
  | "calendar"
  | "analytics"
  | "growth"
  | "agent_workforce"
  | "integrations"
  | "automation_rules"
  | "brand_compliance"
  | "system_monitoring"
  | "settings";

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
}

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: "Command" | "Studio" | "Distribution" | "Intelligence" | "Operations";
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Executive Overview", icon: LayoutDashboard, group: "Command" },
  { id: "portfolio", label: "Product Portfolio", icon: Boxes, group: "Command" },
  { id: "campaigns", label: "Campaign Command", icon: Target, group: "Command" },

  { id: "intelligence", label: "Marketing Intelligence", icon: Compass, group: "Intelligence" },
  { id: "agent_workforce", label: "AI Agent Workforce", icon: Bot, group: "Intelligence" },
  { id: "analytics", label: "Analytics & Performance", icon: BarChart3, group: "Intelligence" },
  { id: "growth", label: "Growth Optimization", icon: TrendingUp, group: "Intelligence" },

  { id: "content_studio", label: "Content Studio", icon: FileText, group: "Studio" },
  { id: "video_studio", label: "Video Production", icon: Video, group: "Studio" },
  { id: "assets", label: "Creative Asset Library", icon: Image, group: "Studio" },

  { id: "social_publishing", label: "Social Publishing", icon: Share2, group: "Distribution" },
  { id: "calendar", label: "Publishing Calendar", icon: Calendar, group: "Distribution" },
  { id: "integrations", label: "Integrations & Accounts", icon: Layers, group: "Distribution" },

  { id: "brand_compliance", label: "Brand & Compliance", icon: ShieldCheck, group: "Operations" },
  { id: "automation_rules", label: "Automation Rules", icon: Sliders, group: "Operations" },
  { id: "system_monitoring", label: "System Monitoring", icon: Activity, group: "Operations" },
  { id: "settings", label: "Settings & Admin", icon: Settings, group: "Operations" }
];

export const Sidebar: React.FC<SidebarProps> = ({ currentSection, onSelectSection }) => {
  const groups: Array<NavItem["group"]> = ["Command", "Intelligence", "Studio", "Distribution", "Operations"];

  return (
    <aside className="w-64 bg-[#202221] border-r border-[#414542]/50 flex flex-col h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="py-4 px-3 space-y-6">
        {groups.map((groupName) => {
          const items = NAV_ITEMS.filter((item) => item.group === groupName);
          return (
            <div key={groupName} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-[#C9B49B]/50 px-3 py-1 font-mono-metrics">
                {groupName}
              </div>
              {items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-all text-left ${
                      isActive
                        ? "bg-[#A16C50]/20 text-[#EEE8DE] border-l-2 border-[#A16C50] pl-2.5 font-semibold"
                        : "text-[#C9B49B]/80 hover:bg-[#414542]/20 hover:text-[#EEE8DE]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#A16C50]" : "text-[#C9B49B]/60"}`} />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
      
      {/* Footer Info */}
      <div className="mt-auto p-4 border-t border-[#414542]/40 text-[11px] text-[#C9B49B]/60">
        <div className="flex items-center justify-between font-mono-metrics text-[10px]">
          <span>PROMETHEUS-9</span>
          <span className="text-[#A16C50]">v1.0.0</span>
        </div>
        <div className="mt-1 text-[10px] text-[#414542]">Zero-Hallucination Marketing Engine</div>
      </div>
    </aside>
  );
};
