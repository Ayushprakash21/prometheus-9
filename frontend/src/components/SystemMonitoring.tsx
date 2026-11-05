import React from "react";
import { SystemHealth } from "../types";
import { Activity, Cpu, HardDrive, CheckCircle2, AlertCircle, Database, Film } from "lucide-react";

interface SystemMonitoringProps {
  health: SystemHealth | null;
  onRefresh: () => void;
}

export const SystemMonitoring: React.FC<SystemMonitoringProps> = ({ health, onRefresh }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#EEE8DE] font-['Manrope']">System Monitoring & Telemetry</h2>
          <p className="text-xs text-[#C9B49B] mt-1">
            Real-time server infrastructure, persistent task scheduler, database integrity, and media engine health.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="px-3 py-1.5 bg-[#414542]/40 hover:bg-[#A16C50] text-[#EEE8DE] text-xs font-medium rounded transition-all"
        >
          Refresh Telemetry
        </button>
      </div>

      {/* Subsystem Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Database Status */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C9B49B] font-medium uppercase">Primary Database</span>
            <Database className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-[#EEE8DE] capitalize font-mono-metrics">
              {health?.database || "Checking..."}
            </span>
          </div>
          <div className="text-[11px] text-[#C9B49B]/70 mt-2">
            SQLite Async + SQLAlchemy ORM (Storage: storage/prometheus9.db)
          </div>
        </div>

        {/* FFmpeg Video Engine Status */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C9B49B] font-medium uppercase">FFmpeg Media Engine</span>
            <Film className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            {health?.ffmpeg_available ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-[#EEE8DE] font-mono-metrics">Operational (v9.0.2)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-rose-400" />
                <span className="text-sm font-bold text-rose-400 font-mono-metrics">Not Detected</span>
              </>
            )}
          </div>
          <div className="text-[11px] text-[#C9B49B]/70 mt-2 truncate">
            {health?.ffmpeg_version || "Video rendering and audio synthesis ready"}
          </div>
        </div>

        {/* Persistent Scheduler Status */}
        <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#C9B49B] font-medium uppercase">Task Queue & Scheduler</span>
            <Activity className="w-4 h-4 text-[#A16C50]" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold text-[#EEE8DE] font-mono-metrics">
              {health?.autonomous_scheduler?.is_running ? "Engine Running" : "Stopped"}
            </span>
          </div>
          <div className="text-[11px] text-[#C9B49B]/70 mt-2 font-mono-metrics">
            State: {health?.autonomous_scheduler?.is_paused ? "PAUSED (Manual Override)" : "ACTIVE (Autonomous)"}
          </div>
        </div>
      </div>

      {/* Host Metrics Detailed Bar */}
      <div className="bg-[#202221] border border-[#414542]/60 rounded-lg p-5 space-y-4">
        <h3 className="text-sm font-bold text-[#EEE8DE] font-['Manrope']">Workstation Resource Telemetry</h3>
        
        <div className="space-y-3">
          {/* CPU Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono-metrics">
              <span className="text-[#C9B49B]">CPU Load</span>
              <span className="text-[#EEE8DE]">{health?.system_metrics?.cpu_usage_percent || 0}%</span>
            </div>
            <div className="w-full bg-[#414542]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#A16C50] h-full transition-all"
                style={{ width: `${Math.min(health?.system_metrics?.cpu_usage_percent || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* RAM Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono-metrics">
              <span className="text-[#C9B49B]">RAM Utilization ({health?.system_metrics?.ram_available_mb || 0} MB Free)</span>
              <span className="text-[#EEE8DE]">{health?.system_metrics?.ram_usage_percent || 0}%</span>
            </div>
            <div className="w-full bg-[#414542]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#C9B49B] h-full transition-all"
                style={{ width: `${Math.min(health?.system_metrics?.ram_usage_percent || 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Storage Bar */}
          <div>
            <div className="flex justify-between text-xs mb-1 font-mono-metrics">
              <span className="text-[#C9B49B]">Storage Disk Usage</span>
              <span className="text-[#EEE8DE]">{health?.system_metrics?.storage_disk_percent || 0}%</span>
            </div>
            <div className="w-full bg-[#414542]/30 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#414542] h-full transition-all"
                style={{ width: `${Math.min(health?.system_metrics?.storage_disk_percent || 0, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
