import React from "react";
import { LucideIcon } from "lucide-react";

interface PlaceholderSectionProps {
  title: string;
  phase: string;
  icon: LucideIcon;
  description: string;
  plannedDeliverables: string[];
}

export const PlaceholderSection: React.FC<PlaceholderSectionProps> = ({
  title,
  phase,
  icon: Icon,
  description,
  plannedDeliverables
}) => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#A16C50] font-mono-metrics">
            {phase} Architecture
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]"></span>
          <span className="text-xs text-[#C9B49B]">Engine Specification Ready</span>
        </div>
        <h2 className="text-xl font-bold text-[#EEE8DE] mt-1 font-['Manrope']">{title}</h2>
        <p className="text-xs text-[#C9B49B] mt-1">{description}</p>
      </div>

      <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-6 max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-[#414542]/30 rounded-lg text-[#A16C50]">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#EEE8DE] font-['Manrope']">{title} Module</h3>
            <div className="text-xs text-[#C9B49B]/70 font-mono-metrics">Integrated with Central Orchestrator</div>
          </div>
        </div>

        <div className="text-xs text-[#EEE8DE]/80 leading-relaxed mb-6">
          In alignment with Engineering Rule #5 and #6, PROMETHEUS-9 never presents simulated metrics or mock features
          as functional. This module's data contracts and backend schemas are live in Phase 1; active autonomous workers
          will be engaged in sequence.
        </div>

        <div className="border-t border-[#414542]/40 pt-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#C9B49B] mb-3 font-mono-metrics">
            Phase Deliverables
          </div>
          <ul className="space-y-2">
            {plannedDeliverables.map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-xs text-[#EEE8DE]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]"></span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
