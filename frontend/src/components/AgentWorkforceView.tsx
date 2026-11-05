import React, { useState } from 'react';
import { 
  SpecialistAgent, 
  AgentRun,
  Product 
} from '../types';
import { 
  Bot, 
  Play, 
  Pause, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Layers, 
  Cpu, 
  X,
  Compass,
  Film,
  BarChart3,
  Share2,
  FileCode
} from 'lucide-react';
import { pauseAutonomousEngine, resumeAutonomousEngine } from '../services/api';

interface AgentWorkforceViewProps {
  agents: SpecialistAgent[];
  runs: AgentRun[];
  isAutonomousPaused: boolean;
  selectedProduct: Product | null;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export const AgentWorkforceView: React.FC<AgentWorkforceViewProps> = ({
  agents,
  runs,
  isAutonomousPaused,
  selectedProduct,
  onRefresh,
  onClose
}) => {
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgent | null>(agents[0] || null);
  const [isTogglingPause, setIsTogglingPause] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Agent configuration state (configurable per agent)
  const [agentModel, setAgentModel] = useState('Gemini 1.5 Pro');
  const [approvalLevel, setApprovalLevel] = useState<'supervised' | 'manual' | 'autonomous'>('supervised');
  const [scheduleCron, setScheduleCron] = useState('0 */6 * * * (Every 6 hours)');

  const handleToggleEmergencyPause = async () => {
    setIsTogglingPause(true);
    try {
      if (isAutonomousPaused) {
        await resumeAutonomousEngine();
      } else {
        await pauseAutonomousEngine();
      }
      await onRefresh();
    } catch (err: any) {
      alert(`Action failed: ${err.message}`);
    } finally {
      setIsTogglingPause(false);
    }
  };

  const CATEGORIES = [
    { id: 'all', label: 'Entire Workforce' },
    { id: 'Strategy', label: 'Strategy & Research' },
    { id: 'Creative', label: 'Creative & Scripting' },
    { id: 'Video', label: 'Video & Audio' },
    { id: 'Governance', label: 'Governance & Compliance' },
    { id: 'Distribution', label: 'Distribution & Analytics' },
  ];

  const filteredAgents = activeCategory === 'all' 
    ? agents 
    : agents.filter(a => {
        if (activeCategory === 'Strategy') return a.category === 'Strategy' || a.category === 'Research';
        if (activeCategory === 'Video') return a.category === 'Video' || a.category === 'Audio';
        if (activeCategory === 'Distribution') return a.category === 'Distribution' || a.category === 'Measurement' || a.category === 'Optimization';
        return a.category === activeCategory;
      });

  const getCategoryIcon = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'strategy':
      case 'research':
        return <Compass className="w-4 h-4 text-[#A16C50]" />;
      case 'creative':
        return <Film className="w-4 h-4 text-[#C9B49B]" />;
      case 'video':
      case 'audio':
        return <Layers className="w-4 h-4 text-[#EEE8DE]" />;
      case 'measurement':
      case 'optimization':
        return <BarChart3 className="w-4 h-4 text-[#A16C50]" />;
      case 'distribution':
        return <Share2 className="w-4 h-4 text-[#C9B49B]" />;
      default:
        return <Bot className="w-4 h-4 text-[#A16C50]" />;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-copper-subtle pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              AUTONOMOUS WORKFORCE // 12 SPECIALISTS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
            <span className="font-mono-metrics text-xs text-[#C9B49B]">
              {selectedProduct ? `ASSIGNED TO ${selectedProduct.name.toUpperCase()}` : 'GLOBAL ROSTER'}
            </span>
          </div>
          <h1 className="font-editorial text-4xl text-[#EEE8DE] mt-1 font-normal tracking-tight">
            Specialist Creative Workforce
          </h1>
          <p className="font-expressive text-lg text-[#C9B49B] italic mt-0.5">
            An interconnected digital organization of specialized AI minds executing your brand strategy.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleEmergencyPause}
            disabled={isTogglingPause}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-interface font-semibold transition-all shadow-lg cursor-pointer disabled:opacity-50 ${
              isAutonomousPaused
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                : 'bg-[#A16C50] hover:bg-[#B87C5E] text-[#EEE8DE] shadow-[#A16C50]/20'
            }`}
          >
            {isAutonomousPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            <span>{isAutonomousPaused ? 'Resume Autonomous Engine' : 'Emergency Stop Engine'}</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] transition-colors"
          >
            Return to Universe
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto py-5 border-b border-copper-subtle/50 no-scrollbar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-interface transition-all shrink-0 cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-[#A16C50] text-[#EEE8DE] font-semibold'
                : 'bg-[#292d2b]/60 border border-copper-subtle text-[#C9B49B] hover:text-[#EEE8DE]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Specialists Cards (7 Cols) & Configuration Inspector (5 Cols) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Specialists Roster (7 Cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAgents.map((ag) => {
            const isSelected = selectedAgent?.name === ag.name;
            return (
              <div
                key={ag.name}
                onClick={() => setSelectedAgent(ag)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected 
                    ? 'bg-[#292d2b] border-[#A16C50] copper-glow-sm' 
                    : 'bg-[#292d2b]/40 border-copper-subtle hover:border-[#A16C50]/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="p-2 rounded-xl bg-[#202221] border border-copper-subtle/40">
                      {getCategoryIcon(ag.category)}
                    </span>
                    <span className="flex items-center gap-1.5 font-mono-metrics text-[10px] text-[#C9B49B]">
                      <span className={`w-1.5 h-1.5 rounded-full ${isAutonomousPaused ? 'bg-amber-500' : 'bg-emerald-400'}`} />
                      <span>{isAutonomousPaused ? 'PAUSED' : ag.status.toUpperCase()}</span>
                    </span>
                  </div>

                  <h3 className="font-editorial text-lg text-[#EEE8DE]">{ag.name}</h3>
                  <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-wider block mt-0.5">
                    {ag.category} SPECIALIST
                  </span>
                  <p className="font-interface text-xs text-[#C9B49B]/90 mt-2.5 leading-relaxed">
                    {ag.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-copper-subtle/30 flex items-center justify-between text-[10px] font-mono-metrics text-[#C9B49B]/70">
                  <span>TIER: AUTONOMOUS</span>
                  <span className="text-[#A16C50] font-semibold">Inspect Config →</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Inspector & Live Telemetry (5 Cols) */}
        <div className="lg:col-span-5">
          {selectedAgent ? (
            <div className="sticky top-8 p-6 rounded-2xl bg-[#202221] border border-copper-subtle shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-copper-subtle pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#A16C50]/20 border border-[#A16C50]/40">
                    <Bot className="w-5 h-5 text-[#A16C50]" />
                  </div>
                  <div>
                    <h3 className="font-editorial text-xl text-[#EEE8DE]">{selectedAgent.name}</h3>
                    <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
                      SPECIALIST CONFIGURATION
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="p-1 rounded-full text-[#C9B49B] hover:text-[#EEE8DE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Model & Reasoning Settings */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Intelligence Engine (LLM Model)
                  </label>
                  <select
                    value={agentModel}
                    onChange={(e) => setAgentModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#292d2b] border border-copper-subtle text-xs font-interface text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  >
                    <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Reasoning & Strategy)</option>
                    <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Sub-Second High Velocity)</option>
                    <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Editorial & Scriptwriting)</option>
                    <option value="Local Deterministic">Deterministic Rule Engine (Zero Drift)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Approval Governance Level
                  </label>
                  <select
                    value={approvalLevel}
                    onChange={(e) => setApprovalLevel(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#292d2b] border border-copper-subtle text-xs font-interface text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                  >
                    <option value="supervised">Supervised (Generates draft; human signs off)</option>
                    <option value="autonomous">Full Autonomous (Authorized to execute)</option>
                    <option value="manual">Manual Trigger Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Execution Schedule
                  </label>
                  <input
                    type="text"
                    value={scheduleCron}
                    onChange={(e) => setScheduleCron(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#292d2b] border border-copper-subtle text-xs font-mono-metrics text-[#EEE8DE]"
                  />
                </div>
              </div>

              {/* Tools & Boundaries */}
              <div className="pt-4 border-t border-copper-subtle/40 space-y-2">
                <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest block mb-2">
                  PERMITTED CAPABILITY TOOLS
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Product Claims Verifier',
                    'Tone Guard',
                    'Alembic Core DB',
                    'FFmpeg Render Hook',
                    'OAuth Token Safe'
                  ].map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg bg-[#292d2b] border border-copper-subtle/60 text-[10px] font-mono-metrics text-[#C9B49B]"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              {/* Task Run History */}
              <div className="pt-4 border-t border-copper-subtle/40">
                <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest block mb-2">
                  VERIFIED EXECUTION RUNS ({runs.length})
                </span>
                {runs.length === 0 ? (
                  <div className="p-3 rounded-xl bg-[#292d2b]/30 border border-copper-subtle/30 text-xs font-interface text-[#C9B49B] italic">
                    No run errors recorded. Agent operates in nominal standby.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {runs.slice(0, 5).map((r) => (
                      <div key={r.id} className="p-2 rounded-lg bg-[#292d2b] text-[10px] font-mono-metrics flex items-center justify-between">
                        <span className="text-[#EEE8DE]">{r.agent_role}</span>
                        <span className="text-emerald-400">{r.status.toUpperCase()} ({r.duration_ms}ms)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-2xl bg-[#202221] border border-copper-subtle text-center text-xs font-interface text-[#C9B49B]">
              Select a specialist to inspect configuration and telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
