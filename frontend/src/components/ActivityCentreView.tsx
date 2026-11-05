import React, { useState } from 'react';
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  Filter, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  Bot, 
  Film, 
  Send,
  RefreshCw
} from 'lucide-react';

export const ActivityCentreView: React.FC = () => {
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [activities, setActivities] = useState([
    {
      id: 'act-101',
      event: 'Autonomous Video Render Completed',
      details: 'FFmpeg assembled 1080x1920 MP4 with burned subtitles and audio overlay.',
      actor: 'Video Producer (Agent)',
      severity: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'act-102',
      event: 'Verified Claims Gate Passed',
      details: 'Evaluated script against 5 registered product claims. Zero unverified assertions detected.',
      actor: 'Compliance Guardian (Agent)',
      severity: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
    {
      id: 'act-103',
      event: 'Deterministic Scheduler Heartbeat',
      details: 'Task runner swept SQLite WAL queue; 0 stale tasks, 2 active jobs processed.',
      actor: 'Scheduler Engine',
      severity: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'act-104',
      event: 'Social Token Refreshed',
      details: 'Automated OAuth refresh cycle completed for YouTube Analytics API.',
      actor: 'Security Vault',
      severity: 'success',
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Real-Time Platform Telemetry
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">Cryptographic Audit Trail</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            Activity Centre & System Telemetry
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Live chronological stream of agent decisions, security validations, render events, and autonomous background executions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-lg bg-[#292C29] border border-[#414542] hover:border-[#A16C50] text-xs font-semibold text-[#EEE8DE] flex items-center gap-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#A16C50] ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="bg-[#292C29] border border-[#414542] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[#414542]">
          <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
            Chronological Audit Events
          </span>
          <span className="text-xs font-mono-metrics text-[#B8B0A5]">{activities.length} Recorded Events</span>
        </div>

        <div className="space-y-3">
          {activities.map((act) => (
            <div key={act.id} className="p-3.5 rounded-lg bg-[#202221] border border-[#414542] flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className={`p-1.5 rounded-lg border mt-0.5 ${
                  act.severity === 'success'
                    ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40'
                    : 'bg-[#303430] text-[#A16C50] border-[#414542]'
                }`}>
                  <Activity className="w-4 h-4" />
                </span>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#EEE8DE]">{act.event}</span>
                    <span className="text-[10px] font-mono-metrics px-1.5 py-0.2 rounded bg-[#303430] text-[#C9B49B]">
                      {act.actor}
                    </span>
                  </div>
                  <p className="text-xs text-[#B8B0A5] leading-relaxed">{act.details}</p>
                </div>
              </div>

              <div className="text-[11px] font-mono-metrics text-[#B8B0A5] shrink-0 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#414542]" />
                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
