import React, { useState } from 'react';
import { 
  SpecialistAgent, 
  AgentRun, 
  AutonomyMode 
} from '../types';
import { 
  Bot, 
  Sliders, 
  Play, 
  Pause, 
  CheckCircle2, 
  Cpu, 
  Lock, 
  Clock, 
  X, 
  Save, 
  ShieldAlert,
  Search,
  Filter,
  Check
} from 'lucide-react';
import { pauseAutonomousEngine, resumeAutonomousEngine } from '../services/api';

interface AgentManagementViewProps {
  agents: SpecialistAgent[];
  runs: AgentRun[];
  isPaused: boolean;
  onRefresh: () => Promise<void>;
  initialTab?: 'directory' | 'configuration' | 'automation_rules' | 'autonomy';
}

export const AgentManagementView: React.FC<AgentManagementViewProps> = ({
  agents,
  runs,
  isPaused,
  onRefresh,
  initialTab = 'directory'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgent | null>(agents[0] || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isTogglingPause, setIsTogglingPause] = useState(false);

  // Agent Configuration State
  const [agentModel, setAgentModel] = useState('Gemini 1.5 Pro');
  const [approvalLevel, setApprovalLevel] = useState<'supervised' | 'manual' | 'autonomous'>('supervised');
  const [scheduleCron, setScheduleCron] = useState('0 */6 * * * (Every 6 hours)');
  const [configSaved, setConfigSaved] = useState(false);

  // Autonomy Settings State
  const [autonomyMode, setAutonomyMode] = useState<AutonomyMode>('supervised');
  const [dailyBudget, setDailyBudget] = useState(50);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [retryLimit, setRetryLimit] = useState(3);
  const [requireHumanPublish, setRequireHumanPublish] = useState(true);

  const handleToggleEmergencyPause = async () => {
    setIsTogglingPause(true);
    try {
      if (isPaused) {
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

  const handleSaveConfig = () => {
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 3000);
  };

  const filteredAgents = agents.filter((ag) => {
    const matchesSearch = ag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ag.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter === 'all' || ag.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const categories = Array.from(new Set(agents.map(a => a.category)));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">AI Workforce & Automation</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Directory of 12 specialist AI agents, execution schedules, permission boundaries, and autonomy governance.
          </p>
        </div>

        <button
          onClick={handleToggleEmergencyPause}
          disabled={isTogglingPause}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 shrink-0 ${
            isPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
              : 'bg-rose-900/60 hover:bg-rose-800 border border-rose-600/50 text-rose-200'
          }`}
        >
          {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          <span>{isPaused ? 'Resume Autonomous Engine' : 'Trigger Emergency Pause'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#414542] pb-px no-scrollbar">
        {[
          { id: 'directory', label: 'Agent Directory', count: agents.length, icon: Bot },
          { id: 'configuration', label: 'Agent Configuration', icon: Sliders },
          { id: 'automation_rules', label: 'Automation Rules', icon: Cpu },
          { id: 'autonomy', label: 'Autonomy & Spending Guardrails', icon: Lock },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors border-b-2 -mb-px shrink-0 cursor-pointer ${
                isActive
                  ? 'border-[#A16C50] text-[#A16C50] font-semibold'
                  : 'border-transparent text-[#B8B0A5] hover:text-[#EEE8DE]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#B8B0A5]">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: AGENT DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B0A5]" />
              <input
                type="text"
                placeholder="Search specialists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
            >
              <option value="all">All Departments</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAgents.map((ag) => {
              const isSelected = selectedAgent?.name === ag.name;
              return (
                <div
                  key={ag.name}
                  onClick={() => {
                    setSelectedAgent(ag);
                    setActiveTab('configuration');
                  }}
                  className={`p-4 rounded-xl border transition-colors cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#303430] border-[#A16C50]'
                      : 'bg-[#292C29] border-[#414542] hover:border-[#A16C50]/60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono-metrics uppercase text-[#A16C50]">
                        {ag.category}
                      </span>
                      <span className="flex items-center gap-1.5 text-[10px] font-mono-metrics text-emerald-400">
                        <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span>{isPaused ? 'PAUSED' : 'READY'}</span>
                      </span>
                    </div>

                    <h3 className="font-semibold text-xs text-[#EEE8DE]">{ag.name}</h3>
                    <p className="text-xs text-[#B8B0A5] mt-1.5 leading-relaxed line-clamp-2">
                      {ag.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#414542] flex items-center justify-between text-[11px]">
                    <span className="text-[#B8B0A5] font-mono-metrics">Autonomous</span>
                    <span className="text-[#A16C50] font-medium hover:underline">Configure →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: AGENT CONFIGURATION */}
      {activeTab === 'configuration' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#414542] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#202221] border border-[#A16C50] flex items-center justify-center">
                <Bot className="w-4 h-4 text-[#A16C50]" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#EEE8DE]">
                  {selectedAgent ? selectedAgent.name : 'Select Agent'}
                </h3>
                <span className="text-xs text-[#B8B0A5]">
                  {selectedAgent?.category} Specialist Configuration
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </button>
          </div>

          {configSaved && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/50 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Agent parameters saved and applied to next scheduled execution cycle.</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">
                Intelligence Model (LLM Provider)
              </label>
              <select
                value={agentModel}
                onChange={(e) => setAgentModel(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              >
                <option value="Gemini 1.5 Pro">Gemini 1.5 Pro (Deep Reasoning & Strategy)</option>
                <option value="Gemini 1.5 Flash">Gemini 1.5 Flash (Sub-Second High Velocity)</option>
                <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet (Editorial Copy & Scripting)</option>
                <option value="Local Rule Engine">Deterministic Local Engine (Zero Drift)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">
                Approval Requirements
              </label>
              <select
                value={approvalLevel}
                onChange={(e) => setApprovalLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              >
                <option value="supervised">Supervised (Generates draft; human signs off before publish)</option>
                <option value="autonomous">Full Autonomous (Direct execution within budget caps)</option>
                <option value="manual">Manual Trigger Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#EEE8DE] mb-1">
              Execution Schedule (Cron Syntax)
            </label>
            <input
              type="text"
              value={scheduleCron}
              onChange={(e) => setScheduleCron(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#202221] border border-[#414542] text-xs font-mono-metrics text-[#EEE8DE]"
            />
          </div>

          <div className="pt-4 border-t border-[#414542]">
            <h4 className="text-xs font-semibold text-[#EEE8DE] mb-2">Permitted Capability Tools</h4>
            <div className="flex flex-wrap gap-2">
              {[
                'Claims Verifier',
                'Tone & Voice Guard',
                'Alembic Database Access',
                'FFmpeg Media Renderer',
                'OAuth Token Safe'
              ].map((tool) => (
                <span key={tool} className="px-2.5 py-1 rounded bg-[#202221] border border-[#414542] text-xs font-mono-metrics text-[#C9B49B]">
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTOMATION RULES */}
      {activeTab === 'automation_rules' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-4">
          <h3 className="text-base font-semibold text-[#EEE8DE]">Automation Rules & Triggers</h3>
          <p className="text-xs text-[#B8B0A5]">
            Deterministic rules governing when agents produce scripts, review drafts, and trigger notifications.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { title: 'Weekly Content Draft Trigger', desc: 'Every Monday at 09:00 UTC, Scriptwriter drafts 3 video scripts per active campaign.', enabled: true },
              { title: 'Zero-Claim Compliance Audit', desc: 'Every draft script is scanned against the product prohibited claims list before approval.', enabled: true },
              { title: 'Token Expiration Pre-Warning', desc: 'Notifies administrator 48 hours prior to OAuth token expiration.', enabled: true },
              { title: 'Rate-Limit Exponential Backoff', desc: 'Automatically pauses publishing queue if platform API returns HTTP 429.', enabled: true }
            ].map((rule, idx) => (
              <div key={idx} className="p-3.5 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between">
                <div>
                  <div className="font-semibold text-xs text-[#EEE8DE]">{rule.title}</div>
                  <div className="text-xs text-[#B8B0A5] mt-0.5">{rule.desc}</div>
                </div>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-mono-metrics bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  ENABLED
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: AUTONOMY & SPENDING */}
      {activeTab === 'autonomy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#EEE8DE]">Autonomy Modes</h3>
            <div className="space-y-2.5">
              {[
                { id: 'manual', title: 'Manual Mode', desc: 'No background executions. Prompts trigger one-off actions.' },
                { id: 'assisted', title: 'Assisted Co-Pilot', desc: 'Agents generate draft assets; human initiates each step.' },
                { id: 'supervised', title: 'Supervised Autopilot', desc: 'Continuous research & creation. Human signs off before publishing.' },
                { id: 'autonomous', title: 'Full Autonomous', desc: 'Continuous closed loop within budget caps and approved claims.' }
              ].map((m) => {
                const isSelected = autonomyMode === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setAutonomyMode(m.id as any)}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#303430] border-[#A16C50]' : 'bg-[#202221] border-[#414542]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#EEE8DE]">{m.title}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />}
                    </div>
                    <p className="text-xs text-[#B8B0A5] mt-1">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#EEE8DE]">Spending & Retry Guardrails</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#B8B0A5]">Daily Spending Cap</span>
                  <span className="font-mono-metrics text-[#EEE8DE] font-semibold">${dailyBudget} USD</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="10"
                  value={dailyBudget}
                  onChange={(e) => setDailyBudget(Number(e.target.value))}
                  className="w-full accent-[#A16C50] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#B8B0A5]">Monthly Budget Cap</span>
                  <span className="font-mono-metrics text-[#EEE8DE] font-semibold">${monthlyBudget} USD</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  step="100"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(Number(e.target.value))}
                  className="w-full accent-[#A16C50] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[#B8B0A5]">Max Task Retries</span>
                  <span className="font-mono-metrics text-[#EEE8DE] font-semibold">{retryLimit} attempts</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={retryLimit}
                  onChange={(e) => setRetryLimit(Number(e.target.value))}
                  className="w-full accent-[#A16C50] cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
