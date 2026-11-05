import React, { useState } from 'react';
import { 
  CheckSquare, 
  Check, 
  X, 
  RotateCcw, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Film, 
  Send, 
  DollarSign, 
  ChevronRight,
  Filter,
  Eye
} from 'lucide-react';
import { ApprovalItem } from '../types';

export const ApprovalCentreView: React.FC = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [revisionNotes, setRevisionNotes] = useState<string>('');

  const [items, setItems] = useState<ApprovalItem[]>([
    {
      id: 'app-001',
      organization_id: 'org-main',
      product_id: 'prod-01',
      item_type: 'marketing_strategy',
      title: 'Q4 Autonomous Growth Blueprint: Asymmetric Search Dominance',
      summary: 'Targeting 25 high-intent long-tail keywords around AI agent observability with 12 organic video shorts and 4 LinkedIn deep-dives.',
      proposed_by_agent: 'Strategy Director',
      risk_score: 'low',
      status: 'pending',
      payload: {
        channels: ['LinkedIn', 'YouTube Shorts'],
        duration_weeks: 6,
        projected_reach: '150,000 Impressions',
        verified_claims_checked: true,
      },
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: 'app-002',
      organization_id: 'org-main',
      product_id: 'prod-01',
      item_type: 'creative_script',
      title: 'Short-Form Video Script: "The Death of Brittle RPA Scripts"',
      summary: '60-second vertical teleprompter script for YouTube Shorts contrasting fragile legacy scrapers against autonomous semantic graphs.',
      proposed_by_agent: 'Script Supervisor',
      risk_score: 'low',
      status: 'pending',
      payload: {
        hook: '90% of RPA automations fail when a website changes a single CSS class.',
        duration_seconds: 58,
        tone: 'Provocative & Direct',
        target_persona: 'VP of Engineering',
      },
      created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
    },
    {
      id: 'app-003',
      organization_id: 'org-main',
      product_id: 'prod-01',
      item_type: 'video_render',
      title: 'FFmpeg 9:16 Render: "Autonomous Observability in 30 Seconds"',
      summary: 'Completed high-definition 1080x1920 video with burned SRT subtitles and neural voiceover track ready for distribution.',
      proposed_by_agent: 'Video Producer',
      risk_score: 'medium',
      status: 'pending',
      payload: {
        aspect_ratio: '9:16',
        file_size_mb: 18.4,
        resolution: '1080x1920',
        subtitles_burned: true,
      },
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: 'app-004',
      organization_id: 'org-main',
      product_id: 'prod-01',
      item_type: 'scheduled_post',
      title: 'LinkedIn Article: "Why Deterministic Claims Guard AI Marketing"',
      summary: 'Direct publication to authorized company LinkedIn page scheduled for 09:00 AM EST tomorrow.',
      proposed_by_agent: 'Publishing Operations',
      risk_score: 'low',
      status: 'pending',
      payload: {
        platform: 'LinkedIn',
        character_count: 1420,
        hashtags: ['#EnterpriseAI', '#MarketingOps', '#AutonomousGrowth'],
      },
      created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },
  ]);

  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'approved' } : item));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleReject = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'rejected' } : item));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleRequestRevision = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { 
      ...item, 
      status: 'revising',
      reviewer_notes: revisionNotes || 'Please revise tone to be more technical.' 
    } : item));
    setRevisionNotes('');
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const filteredItems = items.filter(item => {
    if (filterType === 'all') return true;
    return item.item_type === filterType;
  });

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'marketing_strategy': return FileText;
      case 'creative_script': return FileText;
      case 'video_render': return Film;
      case 'scheduled_post': return Send;
      case 'budget_allocation': return DollarSign;
      default: return CheckSquare;
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Autonomous Governance
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">Zero Unauthorized Actions</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            Central Approval Desk
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Human-in-the-loop review station. High-impact strategies, creative scripts, video renders, and publishing schedules queue here for explicit validation before execution.
          </p>
        </div>

        {/* Quick Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#B8B0A5]" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
          >
            <option value="all">All Items ({items.length})</option>
            <option value="marketing_strategy">Marketing Strategies</option>
            <option value="creative_script">Scripts</option>
            <option value="video_render">Video Renders</option>
            <option value="scheduled_post">Scheduled Posts</option>
          </select>
        </div>
      </div>

      {/* Main Approval Grid & Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 space-y-3">
          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-[#292C29] border border-[#414542] rounded-xl text-xs text-[#B8B0A5]">
              No pending approval requests in this category.
            </div>
          ) : (
            filteredItems.map((item) => {
              const Icon = getItemIcon(item.item_type);
              const isSelected = selectedItem?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#303430] border-[#A16C50] shadow-md'
                      : 'bg-[#292C29] border-[#414542] hover:border-[#B8B0A5]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="p-1.5 rounded-lg bg-[#202221] text-[#A16C50] border border-[#414542]">
                        <Icon className="w-4 h-4" />
                      </span>
                      <div>
                        <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                          {item.item_type.replace('_', ' ')}
                        </span>
                        <div className="text-xs text-[#B8B0A5]">By {item.proposed_by_agent}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics border ${
                        item.risk_score === 'low'
                          ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40'
                          : 'bg-amber-950/20 text-amber-400 border-amber-800/40'
                      }`}>
                        Risk: {item.risk_score.toUpperCase()}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics border ${
                        item.status === 'approved'
                          ? 'bg-emerald-950/30 text-emerald-300 border-emerald-700'
                          : item.status === 'rejected'
                          ? 'bg-red-950/30 text-red-400 border-red-700'
                          : item.status === 'revising'
                          ? 'bg-amber-950/30 text-amber-300 border-amber-700'
                          : 'bg-[#202221] text-[#EEE8DE] border-[#414542]'
                      }`}>
                        {item.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-[#EEE8DE] mb-1">{item.title}</h4>
                  <p className="text-xs text-[#B8B0A5] line-clamp-2 leading-relaxed">{item.summary}</p>

                  <div className="mt-3 pt-3 border-t border-[#414542]/50 flex items-center justify-between text-[11px] font-mono-metrics text-[#B8B0A5]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-[#A16C50] flex items-center gap-1">
                      Inspect Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detail & Action Panel */}
        <div className="bg-[#292C29] border border-[#414542] rounded-xl p-5 space-y-5">
          {selectedItem ? (
            <>
              <div>
                <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  Inspection Dossier
                </span>
                <h3 className="text-base font-bold text-[#EEE8DE] mt-1">{selectedItem.title}</h3>
                <div className="text-xs text-[#B8B0A5] mt-0.5">Origin: {selectedItem.proposed_by_agent}</div>
              </div>

              <div className="p-3.5 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] leading-relaxed">
                <span className="font-semibold block text-[#C9B49B] mb-1 text-[11px] font-mono-metrics uppercase">
                  Proposed Core Content
                </span>
                {selectedItem.summary}
              </div>

              {/* Payload Parameters */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono-metrics text-[#C9B49B] uppercase">Execution Payload</span>
                <div className="p-3 bg-[#202221] border border-[#414542] rounded-lg font-mono-metrics text-xs text-[#EEE8DE] space-y-1">
                  {Object.entries(selectedItem.payload).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-[#B8B0A5]">{k}:</span>
                      <span className="text-[#EEE8DE]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revision Notes Input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#B8B0A5]">
                  Revision Directives (if requesting changes)
                </label>
                <textarea
                  rows={2}
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  placeholder="e.g. Tighten the hook and emphasize SOC-2 compliance..."
                  className="w-full px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => handleApprove(selectedItem.id)}
                  disabled={selectedItem.status === 'approved'}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-xs font-bold text-white rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>Authorize & Execute Operation</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRequestRevision(selectedItem.id)}
                    className="py-2 bg-[#303430] hover:bg-[#414542] text-xs font-semibold text-[#C9B49B] rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Revision</span>
                  </button>

                  <button
                    onClick={() => handleReject(selectedItem.id)}
                    disabled={selectedItem.status === 'rejected'}
                    className="py-2 bg-red-950/40 hover:bg-red-900/60 border border-red-800/40 text-xs font-semibold text-red-300 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center text-[#B8B0A5]">
              <Eye className="w-8 h-8 text-[#414542] mb-2" />
              <div className="text-xs font-semibold text-[#EEE8DE]">No Item Selected</div>
              <p className="text-[11px] text-[#B8B0A5] max-w-xs mt-1">
                Select any pending item from the approval queue to inspect parameters, review claims, and authorize execution.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
