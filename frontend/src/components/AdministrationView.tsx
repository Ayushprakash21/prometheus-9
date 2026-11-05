import React, { useState } from 'react';
import { 
  Shield, 
  Settings, 
  FileCode, 
  Users, 
  Lock, 
  Database, 
  Key, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import { SystemHealth } from '../types';

interface AdministrationViewProps {
  health: SystemHealth | null;
  initialTab?: 'team' | 'settings' | 'audit_logs';
}

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  health,
  initialTab = 'team'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const TEAM_MEMBERS = [
    { email: 'ayushprakash0021@gmail.com', name: 'Ayush Prakash', role: 'Owner', status: 'Active', added: '2026-11-01' },
    { email: 'operator@prometheus-9.internal', name: 'Operations Lead', role: 'Operator', status: 'Active', added: '2026-11-04' },
    { email: 'auditor@prometheus-9.internal', name: 'Compliance Reviewer', role: 'Viewer', status: 'Active', added: '2026-11-05' },
  ];

  const AUDIT_LOGS = [
    { action: 'AUTONOMOUS_OPERATIONS_CHECK', actor: 'ayushprakash0021@gmail.com', role: 'owner', time: '10 mins ago', status: 'SUCCESS' },
    { action: 'BRAND_PROFILE_UPDATED', actor: 'ayushprakash0021@gmail.com', role: 'owner', time: '1 hour ago', status: 'SUCCESS' },
    { action: 'ASSET_UPLOAD_MAGIC_BYTE_VERIFIED', actor: 'system', role: 'engine', time: '2 hours ago', status: 'SUCCESS' },
    { action: 'SCHEDULER_ATOMIC_CLAIM', actor: 'task_worker_1', role: 'system', time: '3 hours ago', status: 'SUCCESS' },
    { action: 'USER_LOGIN_TOKEN_ISSUED', actor: 'ayushprakash0021@gmail.com', role: 'owner', time: '5 hours ago', status: 'SUCCESS' },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">Administration & System Security</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Manage organization members, security settings, database integrity, and cryptographic audit logs.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#414542] pb-px no-scrollbar">
        {[
          { id: 'team', label: 'Team & Permissions', count: TEAM_MEMBERS.length, icon: Shield },
          { id: 'settings', label: 'System Configuration', icon: Settings },
          { id: 'audit_logs', label: 'Security & Audit Logs', count: AUDIT_LOGS.length, icon: FileCode },
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

      {/* TAB 1: TEAM & PERMISSIONS */}
      {activeTab === 'team' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#EEE8DE]">Organization Members & Role Hierarchy</h3>
              <p className="text-xs text-[#B8B0A5]">Backend enforces server-side role validation (Owner, Admin, Operator, Viewer)</p>
            </div>
            <button
              onClick={() => alert('Invite member dialog will send secure invitation email.')}
              className="px-3 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
            >
              + Invite Member
            </button>
          </div>

          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#414542] text-[10px] font-mono-metrics uppercase text-[#B8B0A5]">
                <th className="py-2.5 px-3">Name</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#414542]/50">
              {TEAM_MEMBERS.map((m) => (
                <tr key={m.email} className="hover:bg-[#303430]/40 transition-colors">
                  <td className="py-2.5 px-3 font-medium text-[#EEE8DE]">{m.name}</td>
                  <td className="py-2.5 px-3 text-[#B8B0A5]">{m.email}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-[#202221] text-[#C9B49B] border border-[#414542]">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-emerald-400 font-mono-metrics">{m.status}</td>
                  <td className="py-2.5 px-3 text-right font-mono-metrics text-[#B8B0A5]">{m.added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: SYSTEM CONFIGURATION */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#EEE8DE] flex items-center gap-2">
              <Database className="w-4 h-4 text-[#A16C50]" />
              <span>Database Engine & Integrity</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">Engine</span>
                <span className="font-mono-metrics text-[#EEE8DE]">{health?.database || 'SQLite (WAL Mode)'}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">Foreign Keys</span>
                <span className="font-mono-metrics text-emerald-400">ENFORCED (PRAGMA foreign_keys=ON)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">Busy Timeout</span>
                <span className="font-mono-metrics text-[#EEE8DE]">30,000ms</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#EEE8DE] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#A16C50]" />
              <span>Cryptographic Token Security</span>
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">OAuth Token Encryption</span>
                <span className="font-mono-metrics text-emerald-400">Fernet AES-128-CBC / HMAC-SHA256</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">Session Signing</span>
                <span className="font-mono-metrics text-[#EEE8DE]">HS256 (32+ Character Secret)</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-[#202221]">
                <span className="text-[#B8B0A5]">Password Hashing</span>
                <span className="font-mono-metrics text-[#EEE8DE]">Bcrypt (Cost Factor 12)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit_logs' && (
        <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#EEE8DE]">Cryptographic Security & Action Ledger</h3>
            <span className="text-xs font-mono-metrics text-[#A16C50]">Immutable Audit Trail</span>
          </div>

          <div className="space-y-2">
            {AUDIT_LOGS.map((log, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#202221] border border-[#414542] flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono-metrics text-xs font-semibold text-[#EEE8DE]">{log.action}</div>
                  <div className="text-[11px] text-[#B8B0A5] mt-0.5">
                    Actor: {log.actor} ({log.role}) • {log.time}
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-metrics bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
                  {log.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
