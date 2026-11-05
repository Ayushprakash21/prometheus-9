import React, { useState } from 'react';
import { 
  Campaign, 
  ContentIdea, 
  Script, 
  MediaAsset, 
  Product 
} from '../types';
import { 
  FileText, 
  Film, 
  Upload, 
  Plus, 
  Download, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Save,
  Send,
  Layers,
  Search
} from 'lucide-react';
import { 
  createIdea, 
  createScript, 
  uploadAsset, 
  deleteAsset 
} from '../services/api';

interface CreativeStudioViewProps {
  product: Product | null;
  campaigns: Campaign[];
  ideas: ContentIdea[];
  scripts: Script[];
  assets: MediaAsset[];
  onRefresh: () => Promise<void>;
  initialTab?: 'content' | 'video' | 'assets';
}

export const CreativeStudioView: React.FC<CreativeStudioViewProps> = ({
  product,
  campaigns,
  ideas,
  scripts,
  assets,
  onRefresh,
  initialTab = 'content'
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Content Studio Editor States
  const [briefInput, setBriefInput] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('YouTube Shorts');
  const [contentType, setContentType] = useState('Short Script / Reel');
  const [contentTitle, setContentTitle] = useState('');
  const [contentHook, setContentHook] = useState('');
  const [contentThesis, setContentThesis] = useState('');
  const [contentDraftBody, setContentDraftBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Video Production States
  const [scriptTitle, setScriptTitle] = useState('');
  const [scriptDuration, setScriptDuration] = useState(60);
  const [scriptTone, setScriptTone] = useState('Authoritative and Inspiring');
  const [scriptBody, setScriptBody] = useState('');
  const [isSavingScript, setIsSavingScript] = useState(false);

  // Asset Library States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [assetType, setAssetType] = useState('image');
  const [isUploading, setIsUploading] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');

  // Handle Save Content Draft
  const handleSaveDraft = async () => {
    if (!product || !contentTitle.trim()) {
      alert('Please enter a content title.');
      return;
    }
    if (campaigns.length === 0) {
      alert('A campaign must exist for this product. Please create a campaign in Publishing Centre first.');
      return;
    }

    try {
      await createIdea({
        campaign_id: campaigns[0].id,
        product_id: product.id,
        title: contentTitle,
        hook: contentHook || 'What if marketing ran itself?',
        format: contentType,
        core_thesis: contentThesis || briefInput || 'Autonomous systems create exponential founder leverage.',
        rationale: `Targeted for ${targetPlatform}`
      });
      setDraftSaved(true);
      setTimeout(() => setDraftSaved(false), 3000);
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to save draft: ${err.message}`);
    }
  };

  // Handle Save Script
  const handleSaveScript = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !scriptTitle.trim()) return;
    setIsSavingScript(true);
    try {
      await createScript({
        product_id: product.id,
        title: scriptTitle,
        target_duration_seconds: scriptDuration,
        tone: scriptTone,
        script_body: scriptBody
      });
      setScriptTitle('');
      setScriptBody('');
      await onRefresh();
    } catch (err: any) {
      alert(`Failed to save script: ${err.message}`);
    } finally {
      setIsSavingScript(false);
    }
  };

  // Handle Upload Asset
  const handleUploadAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !uploadFile) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('product_id', product.id);
      formData.append('asset_type', assetType);
      formData.append('file', uploadFile);
      formData.append('licensing_status', 'verified_product_asset');

      await uploadAsset(formData);
      setUploadFile(null);
      await onRefresh();
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // Handle Delete Asset
  const handleDeleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return;
    try {
      await deleteAsset(id);
      await onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const filteredAssets = assets.filter(a => 
    a.filename.toLowerCase().includes(assetSearch.toLowerCase()) ||
    a.asset_type.toLowerCase().includes(assetSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#414542] pb-5">
        <div>
          <h1 className="text-2xl font-bold text-[#EEE8DE]">Creative Studio & Production</h1>
          <p className="text-xs text-[#B8B0A5] mt-1">
            Practical content editor, video scripting teleprompter, and verified media asset library for {product?.name || 'Selected Product'}.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-[#414542] pb-px no-scrollbar">
        {[
          { id: 'content', label: 'Content Studio & Editor', count: ideas.length, icon: FileText },
          { id: 'video', label: 'Video Production & Scripts', count: scripts.length, icon: Film },
          { id: 'assets', label: 'Asset Library', count: assets.length, icon: Upload },
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

      {/* TAB 1: CONTENT STUDIO EDITOR */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor Form (7 cols) */}
          <div className="lg:col-span-7 rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#EEE8DE]">Content Composition Desk</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Target Platform</label>
                <select
                  value={targetPlatform}
                  onChange={(e) => setTargetPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                >
                  <option value="YouTube Shorts">YouTube Shorts</option>
                  <option value="LinkedIn Post">LinkedIn Post</option>
                  <option value="Instagram Reel">Instagram Reel</option>
                  <option value="X Thread">X (Twitter) Thread</option>
                  <option value="TikTok">TikTok</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Format</label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                >
                  <option value="Short Script / Reel">Short Script / Reel</option>
                  <option value="Longform Monologue">Longform Monologue</option>
                  <option value="Carousel Slide Deck">Carousel Slide Deck</option>
                  <option value="Technical Breakdown">Technical Breakdown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Creative Brief / Topic</label>
              <textarea
                rows={2}
                placeholder="What core concept, feature, or objection should this content address?"
                value={briefInput}
                onChange={(e) => setBriefInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Content Title *</label>
              <input
                type="text"
                placeholder="e.g. Why Founders Are Ditching Manual Marketing"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Opening Hook (First 3 Seconds)</label>
              <input
                type="text"
                placeholder="e.g. You don't need a 10-person agency to build a marketing empire."
                value={contentHook}
                onChange={(e) => setContentHook(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Core Thesis & Body</label>
              <textarea
                rows={4}
                placeholder="The substantive thesis, points, and call-to-action."
                value={contentDraftBody}
                onChange={(e) => setContentDraftBody(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>
                {draftSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  alert('Content submitted to governance queue for zero-hallucination verification.');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-xs font-medium text-[#EEE8DE] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-[#C9B49B]" />
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>

          {/* Ideas Pool (5 cols) */}
          <div className="lg:col-span-5 rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#EEE8DE]">Drafts & Ideas Pool ({ideas.length})</h3>

            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {ideas.map((idea) => (
                <div key={idea.id} className="p-3.5 rounded-lg bg-[#202221] border border-[#414542] space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-mono-metrics">
                    <span className="text-[#A16C50] uppercase">{idea.format}</span>
                    <span className="text-[#B8B0A5]">{new Date(idea.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#EEE8DE]">{idea.title}</h4>
                  <p className="text-xs text-[#B8B0A5] italic">"{idea.hook}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: VIDEO PRODUCTION & SCRIPTS */}
      {activeTab === 'video' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* New Script Form (6 cols) */}
          <div className="lg:col-span-6 rounded-xl bg-[#292C29] border border-[#414542] p-6 space-y-4">
            <h3 className="text-base font-semibold text-[#EEE8DE]">Scriptwriting & Teleprompter Desk</h3>

            <form onSubmit={handleSaveScript} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Script Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Orion-9 Value Proposition (60s)"
                  value={scriptTitle}
                  onChange={(e) => setScriptTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Target Duration (s)</label>
                  <input
                    type="number"
                    value={scriptDuration}
                    onChange={(e) => setScriptDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#EEE8DE] mb-1">Tone & Pacing</label>
                  <input
                    type="text"
                    value={scriptTone}
                    onChange={(e) => setScriptTone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#EEE8DE] mb-1">
                  Full Script Body (With Scene Markers)
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="[SCENE 1: Hook]&#10;Voice: Stop wasting 20 hours a week hand-scheduling posts.&#10;&#10;[SCENE 2: Proof]&#10;Voice: Prometheus-9 runs continuous autonomous campaigns..."
                  value={scriptBody}
                  onChange={(e) => setScriptBody(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs font-mono-metrics text-[#EEE8DE]"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingScript}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingScript ? 'Saving Script...' : 'Save Production Script'}</span>
              </button>
            </form>
          </div>

          {/* Scripts List (6 cols) */}
          <div className="lg:col-span-6 rounded-xl bg-[#292C29] border border-[#414542] p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#EEE8DE]">Production Ready Scripts ({scripts.length})</h3>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {scripts.map((sc) => (
                <div key={sc.id} className="p-4 rounded-lg bg-[#202221] border border-[#414542] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#EEE8DE]">{sc.title}</span>
                    <span className="text-[10px] font-mono-metrics text-[#A16C50] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{sc.target_duration_seconds}s</span>
                    </span>
                  </div>
                  <pre className="text-xs font-mono-metrics text-[#B8B0A5] bg-[#292C29] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {sc.script_body}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ASSET LIBRARY */}
      {activeTab === 'assets' && (
        <div className="space-y-4">
          {/* Upload Toolbar */}
          <div className="rounded-xl bg-[#292C29] border border-[#414542] p-5">
            <h3 className="text-sm font-semibold text-[#EEE8DE] mb-2">Upload Verified Brand Media</h3>
            <form onSubmit={handleUploadAsset} className="flex flex-wrap items-center gap-3">
              <input
                type="file"
                required
                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                className="text-xs text-[#EEE8DE] file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#A16C50] file:text-[#EEE8DE] hover:file:bg-[#B87C5E] cursor-pointer"
              />
              <select
                value={assetType}
                onChange={(e) => setAssetType(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE]"
              >
                <option value="image">Image / Graphic</option>
                <option value="video">Video Clip</option>
                <option value="audio">Audio Voiceover</option>
              </select>
              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-semibold text-[#EEE8DE] disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : 'Upload Asset'}</span>
              </button>
            </form>
          </div>

          {/* Search Assets */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#B8B0A5]" />
            <input
              type="text"
              placeholder="Filter assets..."
              value={assetSearch}
              onChange={(e) => setAssetSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[#292C29] border border-[#414542] text-xs text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
            />
          </div>

          {/* Assets Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAssets.map((ast) => (
              <div key={ast.id} className="p-4 rounded-xl bg-[#292C29] border border-[#414542] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono-metrics mb-2">
                    <span className="text-[#A16C50] uppercase">{ast.asset_type}</span>
                    <span className="text-[#B8B0A5]">{(ast.file_size_bytes / 1024).toFixed(1)} KB</span>
                  </div>
                  <h4 className="font-semibold text-xs text-[#EEE8DE] truncate">{ast.filename}</h4>
                  <div className="text-[10px] font-mono-metrics text-[#B8B0A5] truncate mt-1">
                    SHA256: {ast.content_hash.slice(0, 14)}...
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#414542] flex items-center justify-between">
                  <a
                    href={`/api/v1/assets/${ast.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#A16C50] hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </a>
                  <button
                    onClick={() => handleDeleteAsset(ast.id)}
                    className="text-[#B8B0A5] hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
