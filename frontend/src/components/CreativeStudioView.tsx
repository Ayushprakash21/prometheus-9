import React, { useState } from 'react';
import { 
  Campaign, 
  ContentIdea, 
  Script, 
  MediaAsset, 
  Product 
} from '../types';
import { 
  Film, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Check, 
  ChevronRight, 
  Layers, 
  Compass, 
  Target, 
  FileText, 
  Share2, 
  BarChart3,
  Bot
} from 'lucide-react';
import { createCampaign } from '../services/api';

interface CreativeStudioViewProps {
  product: Product | null;
  campaigns: Campaign[];
  ideas: ContentIdea[];
  scripts: Script[];
  assets: MediaAsset[];
  onRefresh: () => Promise<void>;
  onClose: () => void;
}

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({
  product,
  campaigns,
  ideas,
  scripts,
  assets,
  onRefresh,
  onClose
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns[0] || null);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(2); // e.g. Concept / Creation
  const [showAddCampaign, setShowAddCampaign] = useState(false);
  const [newCampTitle, setNewCampTitle] = useState('');
  const [newCampObjective, setNewCampObjective] = useState('');
  const [newCampBudget, setNewCampBudget] = useState(1000);

  const CAMPAIGN_STAGES = [
    { name: 'RESEARCH', agent: 'Market Research Agent', status: 'Completed', input: 'Product Knowledge & Competitors', output: 'Audience Insight Dossier' },
    { name: 'STRATEGY', agent: 'Marketing Strategy Agent', status: 'Completed', input: 'Audience Insight Dossier', output: 'Core Positioning & Angle' },
    { name: 'CONCEPT', agent: 'Ideation Specialist', status: 'Active', input: 'Angle & Value Propositions', output: `${ideas.length} Content Ideas Generated` },
    { name: 'CREATION', agent: 'Scriptwriter & Storyboard', status: 'In Progress', input: 'Selected Concept Hook', output: `${scripts.length} Production Scripts` },
    { name: 'VALIDATION', agent: 'Brand Compliance Agent', status: 'Pending', input: 'Generated Scripts & Visuals', output: 'Zero-Claim Violation Audit' },
    { name: 'APPROVAL', agent: 'Human Operator Signoff', status: 'Awaiting', input: 'Validated Creative Package', output: 'One-Click Publish Authorization' },
    { name: 'PUBLISHING', agent: 'Distribution Agent', status: 'Scheduled', input: 'Approved Video & Meta', output: 'OAuth Destination Distribution' },
    { name: 'MEASUREMENT', agent: 'Analytics Specialist', status: 'Standby', input: 'Live Platform Telemetry', output: 'Retention & Conversion Attribution' },
    { name: 'OPTIMIZATION', agent: 'Growth Agent', status: 'Standby', input: 'Attribution Insights', output: 'Iterated Creative Variants' },
  ];

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newCampTitle.trim()) return;
    try {
      const camp = await createCampaign({
        product_id: product.id,
        title: newCampTitle,
        objective: newCampObjective || 'Brand Awareness and Customer Acquisition',
        budget_cap_cents: newCampBudget * 100,
        status: 'active'
      });
      setNewCampTitle('');
      setNewCampObjective('');
      setShowAddCampaign(false);
      await onRefresh();
      setSelectedCampaign(camp);
    } catch (err: any) {
      alert(`Failed to launch campaign: ${err.message}`);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-copper-subtle pb-6 gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              CREATIVE UNIVERSE // CAMPAIGN ENGINE
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
            <span className="font-mono-metrics text-xs text-[#C9B49B]">
              {product ? product.name.toUpperCase() : 'NO BRAND SELECTED'}
            </span>
          </div>
          <h1 className="font-editorial text-4xl text-[#EEE8DE] mt-1 font-normal tracking-tight">
            Autonomous Creative Studio
          </h1>
          <p className="font-expressive text-lg text-[#C9B49B] italic mt-0.5">
            9-Stage deterministic campaign lifecycle uniting research, scripts, storyboards, and publishing.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowAddCampaign(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] font-semibold shadow-lg shadow-[#A16C50]/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Launch Campaign</span>
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#EEE8DE] transition-colors"
          >
            Return to Universe
          </button>
        </div>
      </div>

      {/* New Campaign Modal */}
      {showAddCampaign && (
        <form onSubmit={handleCreateCampaign} className="mt-6 p-6 rounded-2xl bg-[#292d2b] border border-[#A16C50] space-y-4">
          <h3 className="font-editorial text-xl text-[#EEE8DE]">Initiate Autonomous Campaign</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Q4 Growth: The Autonomous Advantage"
                value={newCampTitle}
                onChange={(e) => setNewCampTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>
            <div>
              <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                Budget Cap (USD)
              </label>
              <input
                type="number"
                value={newCampBudget}
                onChange={(e) => setNewCampBudget(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
              Primary Strategic Objective
            </label>
            <input
              type="text"
              placeholder="e.g. Establish category leadership and generate 50 qualified trials"
              value={newCampObjective}
              onChange={(e) => setNewCampObjective(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-sm text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button type="submit" className="px-6 py-2.5 rounded-full bg-[#A16C50] text-xs font-interface text-[#EEE8DE] font-semibold">
              Initialize Lifecycle
            </button>
            <button type="button" onClick={() => setShowAddCampaign(false)} className="px-4 py-2.5 rounded-full border border-copper-subtle text-xs text-[#C9B49B]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Campaign Selector Pill Bar */}
      <div className="flex items-center gap-3 py-4 border-b border-copper-subtle/40 overflow-x-auto no-scrollbar">
        <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest shrink-0">
          ACTIVE CAMPAIGNS:
        </span>
        {campaigns.map((camp) => (
          <button
            key={camp.id}
            onClick={() => setSelectedCampaign(camp)}
            className={`px-4 py-1.5 rounded-full text-xs font-interface transition-all shrink-0 cursor-pointer ${
              selectedCampaign?.id === camp.id
                ? 'bg-[#A16C50] text-[#EEE8DE] font-semibold shadow-md shadow-[#A16C50]/20'
                : 'bg-[#292d2b]/60 border border-copper-subtle text-[#C9B49B] hover:text-[#EEE8DE]'
            }`}
          >
            {camp.title}
          </button>
        ))}
      </div>

      {/* 9-STAGE CAMPAIGN JOURNEY VISUALIZATION */}
      <div className="mt-8 p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              LIFECYCLE ARCHITECTURE
            </span>
            <h3 className="font-editorial text-2xl text-[#EEE8DE] mt-0.5">
              Campaign Lifecycle: {selectedCampaign?.title || 'Autonomous Production Pipeline'}
            </h3>
          </div>
          <div className="font-mono-metrics text-xs text-[#C9B49B]">
            STATUS: <span className="text-emerald-400 font-semibold">{selectedCampaign?.status?.toUpperCase() || 'ACTIVE'}</span>
          </div>
        </div>

        {/* 9 Stages Interactive Step Chain */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-9 gap-2">
          {CAMPAIGN_STAGES.map((st, idx) => {
            const isCurrent = idx === activeStageIndex;
            const isDone = idx < activeStageIndex;
            return (
              <div
                key={st.name}
                onClick={() => setActiveStageIndex(idx)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#A16C50]/20 border-[#A16C50] shadow-md shadow-[#A16C50]/20'
                    : isDone
                      ? 'bg-[#202221] border-copper-subtle/60 text-[#C9B49B]'
                      : 'bg-[#202221]/40 border-transparent text-[#C9B49B]/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[9px] font-mono-metrics mb-1">
                    <span className="text-[#A16C50]">0{idx + 1}</span>
                    {isDone ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <span className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-[#A16C50] animate-ping' : 'bg-[#414542]'}`} />
                    )}
                  </div>
                  <div className={`font-interface text-xs font-semibold ${isCurrent ? 'text-[#EEE8DE]' : ''}`}>
                    {st.name}
                  </div>
                </div>

                <div className="mt-3 text-[9px] font-mono-metrics text-[#C9B49B]/70 truncate">
                  {st.agent}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Stage Detail Panel */}
        <div className="mt-6 p-5 rounded-xl bg-[#202221] border border-copper-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              STAGE 0{activeStageIndex + 1}: {CAMPAIGN_STAGES[activeStageIndex].name}
            </span>
            <div className="font-editorial text-lg text-[#EEE8DE]">
              Responsible Specialist: {CAMPAIGN_STAGES[activeStageIndex].agent}
            </div>
            <div className="text-xs font-interface text-[#C9B49B] flex items-center gap-4">
              <span>INPUT: <strong className="text-[#EEE8DE]">{CAMPAIGN_STAGES[activeStageIndex].input}</strong></span>
              <span>•</span>
              <span>OUTPUT: <strong className="text-[#EEE8DE]">{CAMPAIGN_STAGES[activeStageIndex].output}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveStageIndex(prev => Math.min(8, prev + 1))}
              className="px-5 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface text-[#EEE8DE] font-semibold cursor-pointer"
            >
              Sign Off & Advance Stage →
            </button>
          </div>
        </div>
      </div>

      {/* Production Deliverables: Ideas & Scripts */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Content Ideas */}
        <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl text-[#EEE8DE]">Content Ideas Pool ({ideas.length})</h3>
            <span className="font-mono-metrics text-[10px] text-[#A16C50]">VIRALITY OPTIMIZED</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {ideas.map((idea) => (
              <div key={idea.id} className="p-4 rounded-xl bg-[#202221] border border-copper-subtle/60">
                <div className="flex items-center justify-between text-[10px] font-mono-metrics text-[#C9B49B] mb-1">
                  <span className="text-[#A16C50] uppercase">{idea.format}</span>
                  <span>{new Date(idea.created_at).toLocaleDateString()}</span>
                </div>
                <h4 className="font-interface text-sm font-semibold text-[#EEE8DE]">{idea.title}</h4>
                <div className="mt-2 p-2 rounded-lg bg-[#292d2b] text-xs font-expressive text-[#C9B49B] italic">
                  "{idea.hook}"
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Production Scripts */}
        <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-editorial text-xl text-[#EEE8DE]">Ready Scripts Desk ({scripts.length})</h3>
            <span className="font-mono-metrics text-[10px] text-emerald-400">TELEPROMPTER VERIFIED</span>
          </div>

          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {scripts.map((sc) => (
              <div key={sc.id} className="p-4 rounded-xl bg-[#202221] border border-copper-subtle/60">
                <div className="flex items-center justify-between text-[10px] font-mono-metrics text-[#C9B49B] mb-1">
                  <span className="text-[#A16C50]">{sc.target_duration_seconds} SECONDS</span>
                  <span className="uppercase text-emerald-400">{sc.status}</span>
                </div>
                <h4 className="font-interface text-sm font-semibold text-[#EEE8DE]">{sc.title}</h4>
                <p className="mt-2 text-xs font-mono-metrics text-[#C9B49B] line-clamp-3 bg-[#292d2b] p-2 rounded-lg">
                  {sc.script_body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
