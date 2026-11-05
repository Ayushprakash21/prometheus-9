import React from "react";
import { SpecialistAgent } from "../types";
import { Bot, Sparkles, CheckCircle2, ShieldAlert, Cpu } from "lucide-react";

interface AgentWorkforceProps {
  agents: SpecialistAgent[];
  isPaused: boolean;
  onTogglePause: () => void;
}

export const AgentWorkforce: React.FC<AgentWorkforceProps> = ({
  agents,
  isPaused,
  onTogglePause
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#EEE8DE] font-['Manrope']">AI Agent Workforce</h2>
          <p className="text-xs text-[#C9B49B] mt-1">
            Central orchestration layer coordinating 15 specialized marketing agents with auditable execution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#C9B49B] font-mono-metrics">
            Orchestrator: <span className={isPaused ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
              {isPaused ? "PAUSED" : "ACTIVE"}
            </span>
          </span>
          <button
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded text-xs font-semibold ${
              isPaused ? "bg-[#A16C50] text-[#EEE8DE]" : "bg-[#414542]/40 text-[#C9B49B] hover:text-[#EEE8DE]"
            }`}
          >
            {isPaused ? "Resume Autonomy" : "Pause All Agents"}
          </button>
        </div>
      </div>

      {/* Agents Roster Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div
            key={agent.name}
            className="bg-[#202221] border border-[#414542]/60 rounded-lg p-4 flex flex-col justify-between hover:border-[#A16C50]/50 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#414542]/40 text-[#C9B49B]">
                  {agent.category}
                </span>
                <span className="flex items-center gap-1 text-[11px] font-mono-metrics text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {agent.status}
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#EEE8DE] mt-2 font-['Manrope']">{agent.name}</h3>
              <p className="text-xs text-[#C9B49B]/80 mt-1.5 leading-relaxed">{agent.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#414542]/30 flex items-center justify-between text-[11px] text-[#C9B49B]">
              <span className="font-mono-metrics">Typed I/O & Validated</span>
              <span className="text-[#A16C50] text-[10px] uppercase font-bold tracking-wider">Governed</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
