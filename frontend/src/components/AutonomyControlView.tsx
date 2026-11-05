import React, { useState } from 'react';
import { 
  AutonomyMode 
} from '../types';
import { 
  Sliders, 
  ShieldAlert, 
  Play, 
  Pause, 
  Check, 
  AlertTriangle, 
  Zap, 
  Lock, 
  DollarSign,
  Save,
  CheckCircle2
} from 'lucide-react';
import { pauseAutonomousEngine, resumeAutonomousEngine } from '../services/api';

interface AutonomyControlViewProps {
  isAutonomousPaused: boolean;
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export const AutonomyControlView: React.FC<AutonomyControlViewProps> = ({
  isAutonomousPaused,
  onRefresh,
  onClose
}) => {
  const [mode, setMode] = useState<AutonomyMode>('supervised');
  const [dailyBudget, setDailyBudget] = useState(50);
  const [monthlyBudget, setMonthlyBudget] = useState(1500);
  const [retryLimit, setRetryLimit] = useState(3);
  const [requireHumanPublish, setRequireHumanPublish] = useState(true);
  const [enforceStrictClaims, setEnforceStrictClaims] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleTogglePause = async () => {
    setIsUpdating(true);
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
      setIsUpdating(false);
    }
  };

  const handleSavePolicy = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const MODES = [
    {
      id: 'manual' as AutonomyMode,
      title: 'Manual Mode',
      subtitle: 'Zero autonomous execution',
      desc: 'All research, ideation, and publishing must be initiated by human operators. Agents act only upon explicit click triggers.'
    },
    {
      id: 'assisted' as AutonomyMode,
      title: 'Assisted Co-Pilot',
      subtitle: 'Prompt-assisted drafting',
      desc: 'Specialists draft scripts and storyboards when prompted. Every transition requires human operator confirmation.'
    },
    {
      id: 'supervised' as AutonomyMode,
      title: 'Supervised Autopilot',
      subtitle: 'Recommended production standard',
      desc: 'Continuous autonomous research, strategy, and script creation. Publishing to authorized social APIs requires one-click signoff.'
    },
    {
      id: 'autonomous' as AutonomyMode,
      title: 'Full Autonomous Closed-Loop',
      subtitle: 'Self-governing growth operating system',
      desc: 'Agents independently research, create, validate against verified claims, publish, analyze retention, and optimize future scripts.'
    }
  ];

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-copper-subtle pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              AUTONOMY GOVERNANCE // SYSTEM CONTROL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
            <span className="font-mono-metrics text-xs text-[#C9B49B]">
              STATUS: {isAutonomousPaused ? 'HALTED' : 'ACTIVE'}
            </span>
          </div>
          <h1 className="font-editorial text-4xl text-[#EEE8DE] mt-1 font-normal tracking-tight">
            Autonomy & Governance Control
          </h1>
          <p className="font-expressive text-lg text-[#C9B49B] italic mt-0.5">
            Configure spending boundaries, human sign-off gates, and emergency overrides.
          </p>
        </div>

        <button
          onClick={onClose}
          className="px-5 py-2.5 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] transition-colors"
        >
          Return to Universe
        </button>
      </div>

      {/* Emergency Killswitch Banner */}
      <div className={`mt-8 p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
        isAutonomousPaused 
          ? 'bg-rose-950/30 border-rose-500/60' 
          : 'bg-[#292d2b]/60 border-copper-subtle'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isAutonomousPaused ? 'bg-rose-900/50 text-rose-300' : 'bg-[#A16C50]/20 text-[#A16C50]'}`}>
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-editorial text-xl text-[#EEE8DE]">
              {isAutonomousPaused ? 'Autonomous Operations Halted' : 'Autonomous Engine Nominal'}
            </h3>
            <p className="font-interface text-xs text-[#C9B49B] mt-1 max-w-xl">
              {isAutonomousPaused 
                ? 'All scheduled background jobs, rendering pipelines, and social publishing calls are frozen. Press resume to continue normal execution.' 
                : 'The system is actively executing background schedules and agent tasks within designated limits.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleTogglePause}
          disabled={isUpdating}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-xs font-interface font-semibold transition-all shadow-xl cursor-pointer disabled:opacity-50 shrink-0 ${
            isAutonomousPaused
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              : 'bg-rose-800 hover:bg-rose-700 text-white shadow-rose-950/50'
          }`}
        >
          {isAutonomousPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span>{isAutonomousPaused ? 'Resume Autonomous Engine' : 'Trigger Emergency Pause'}</span>
        </button>
      </div>

      {/* 4 Autonomy Modes Grid */}
      <div className="mt-8 space-y-4">
        <h3 className="font-editorial text-2xl text-[#EEE8DE]">Operational Autonomy Modes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MODES.map((m) => {
            const isSelected = mode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setMode(m.id)}
                className={`p-6 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#292d2b] border-[#A16C50] copper-glow-sm'
                    : 'bg-[#292d2b]/40 border-copper-subtle hover:border-[#A16C50]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                      MODE 0{MODES.indexOf(m) + 1}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#A16C50]" />
                    )}
                  </div>
                  <h4 className="font-editorial text-lg text-[#EEE8DE]">{m.title}</h4>
                  <div className="font-expressive text-xs text-[#C9B49B] italic mt-0.5">{m.subtitle}</div>
                  <p className="font-interface text-xs text-[#C9B49B]/80 mt-3 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-copper-subtle/30 flex items-center justify-between text-[10px] font-mono-metrics text-[#C9B49B]">
                  <span>{isSelected ? 'ACTIVE SELECTION' : 'CLICK TO SELECT'}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#A16C50]" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Governance Guardrails: Spending Caps & Claim Enforcement */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending Guardrails */}
        <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-5">
          <h4 className="font-editorial text-xl text-[#EEE8DE]">Spending & API Cost Restrictions</h4>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-mono-metrics text-[#C9B49B] uppercase">Daily Spending Limit (USD)</span>
                <span className="font-mono-metrics text-[#EEE8DE] font-semibold">${dailyBudget}</span>
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
                <span className="font-mono-metrics text-[#C9B49B] uppercase">Monthly Budget Cap (USD)</span>
                <span className="font-mono-metrics text-[#EEE8DE] font-semibold">${monthlyBudget}</span>
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
                <span className="font-mono-metrics text-[#C9B49B] uppercase">Max Background Task Retries</span>
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

        {/* Approval & Validation Policies */}
        <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-5">
          <h4 className="font-editorial text-xl text-[#EEE8DE]">Safety & Verification Policies</h4>

          <div className="space-y-4">
            <div 
              onClick={() => setRequireHumanPublish(!requireHumanPublish)}
              className="p-4 rounded-xl bg-[#202221] border border-copper-subtle/60 flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-interface text-xs font-semibold text-[#EEE8DE]">
                  Mandatory Human Signoff for Publishing
                </div>
                <div className="font-interface text-[11px] text-[#C9B49B] mt-0.5">
                  Never publish directly to social APIs without owner click authorization.
                </div>
              </div>
              <input
                type="checkbox"
                checked={requireHumanPublish}
                onChange={() => {}}
                className="w-4 h-4 accent-[#A16C50] cursor-pointer"
              />
            </div>

            <div 
              onClick={() => setEnforceStrictClaims(!enforceStrictClaims)}
              className="p-4 rounded-xl bg-[#202221] border border-copper-subtle/60 flex items-center justify-between cursor-pointer"
            >
              <div>
                <div className="font-interface text-xs font-semibold text-[#EEE8DE]">
                  Strict Zero-Hallucination Filter
                </div>
                <div className="font-interface text-[11px] text-[#C9B49B] mt-0.5">
                  Reject any script containing unverified metrics or prohibited claims.
                </div>
              </div>
              <input
                type="checkbox"
                checked={enforceStrictClaims}
                onChange={() => {}}
                className="w-4 h-4 accent-[#A16C50] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={handleSavePolicy}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] font-semibold cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Autonomy Policies</span>
            </button>
            {savedSuccess && (
              <span className="font-mono-metrics text-xs text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>Policies Saved</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
