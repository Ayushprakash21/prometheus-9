import React, { useState } from 'react';
import { 
  Film, 
  Play, 
  Download, 
  Sparkles, 
  Layers, 
  Sliders, 
  CheckCircle2, 
  Clock, 
  Tv, 
  Smartphone, 
  Square,
  Volume2,
  Subtitles,
  Share2,
  RefreshCw
} from 'lucide-react';
import { Product, VideoRenderJob } from '../types';

interface VideoProductionViewProps {
  selectedProduct: Product | null;
}

export const VideoProductionView: React.FC<VideoProductionViewProps> = ({
  selectedProduct,
}) => {
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9' | '1:1'>('9:16');
  const [templateStyle, setTemplateStyle] = useState<'luxury_cinematic' | 'saas_explainer' | 'minimal_editorial' | 'high_impact'>('luxury_cinematic');
  const [voiceoverModel, setVoiceoverModel] = useState('Neural British Editorial (Male)');
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [titleOverlay, setTitleOverlay] = useState('Autonomous Growth in 60 Seconds');
  const [isRendering, setIsRendering] = useState(false);

  const [renderJobs, setRenderJobs] = useState<VideoRenderJob[]>([
    {
      id: 'job-901',
      organization_id: 'org-main',
      product_id: selectedProduct?.id || 'prod-01',
      title: 'Shorts Edition: The Death of Manual Ads',
      aspect_ratio: '9:16',
      template_style: 'luxury_cinematic',
      voiceover_model: 'Neural British Editorial (Male)',
      subtitles_enabled: true,
      resolution: '1080x1920',
      duration_seconds: 48,
      status: 'completed',
      progress_percent: 100,
      preview_url: 'https://assets.prometheus9.ai/renders/job-901.mp4',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
    {
      id: 'job-902',
      organization_id: 'org-main',
      product_id: selectedProduct?.id || 'prod-01',
      title: 'Widescreen Demo: Knowledge Graph Ingestion',
      aspect_ratio: '16:9',
      template_style: 'saas_explainer',
      voiceover_model: 'Neural Studio Direct (Female)',
      subtitles_enabled: true,
      resolution: '1920x1080',
      duration_seconds: 120,
      status: 'completed',
      progress_percent: 100,
      preview_url: 'https://assets.prometheus9.ai/renders/job-902.mp4',
      created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
  ]);

  const handleStartRender = () => {
    setIsRendering(true);
    const newJob: VideoRenderJob = {
      id: `job-${Date.now().toString().slice(-4)}`,
      organization_id: 'org-main',
      product_id: selectedProduct?.id || 'prod-01',
      title: titleOverlay || 'Untitled Autonomous Render',
      aspect_ratio: aspectRatio,
      template_style: templateStyle,
      voiceover_model: voiceoverModel,
      subtitles_enabled: subtitlesEnabled,
      resolution: aspectRatio === '9:16' ? '1080x1920' : aspectRatio === '16:9' ? '1920x1080' : '1080x1080',
      duration_seconds: 52,
      status: 'rendering',
      progress_percent: 15,
      created_at: new Date().toISOString(),
    };

    setRenderJobs(prev => [newJob, ...prev]);

    // Simulate FFmpeg render progress
    let currentProg = 15;
    const interval = setInterval(() => {
      currentProg += 25;
      if (currentProg >= 100) {
        clearInterval(interval);
        setRenderJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: 'completed', progress_percent: 100 } : j));
        setIsRendering(false);
      } else {
        setRenderJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, progress_percent: currentProg } : j));
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Programmatic Creative Engine
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">FFmpeg 7.1 Hardware Accelerated</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            Autonomous Video Production Studio
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Render high-converting video creative programmatically. Generates synchronized voiceovers, burned typography subtitles, and editorial title sequences for social distribution.
          </p>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Video Configuration & Live Preview Mock */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Format & Style Selection */}
          <div className="p-5 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B] block">
              1. Aspect Ratio & Target Platform
            </span>

            <div className="grid grid-cols-3 gap-3">
              {[
                { id: '9:16', label: '9:16 Vertical', desc: 'YouTube Shorts, Reels, TikTok', icon: Smartphone },
                { id: '16:9', label: '16:9 Widescreen', desc: 'YouTube Long-Form, LinkedIn Web', icon: Tv },
                { id: '1:1', label: '1:1 Square', desc: 'Instagram & Facebook Feed', icon: Square },
              ].map((fmt) => {
                const Icon = fmt.icon;
                const isSelected = aspectRatio === fmt.id;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => setAspectRatio(fmt.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#303430] border-[#A16C50] text-[#EEE8DE] shadow-sm'
                        : 'bg-[#202221] border-[#414542] text-[#B8B0A5] hover:border-[#B8B0A5]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-[#A16C50]' : 'text-[#B8B0A5]'}`} />
                    <div className="text-xs font-bold">{fmt.label}</div>
                    <div className="text-[10px] text-[#B8B0A5]">{fmt.desc}</div>
                  </button>
                );
              })}
            </div>

            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B] block pt-2">
              2. Visual Art Direction & Template
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'luxury_cinematic', label: 'Luxury Charcoal' },
                { id: 'saas_explainer', label: 'SaaS Explainer' },
                { id: 'minimal_editorial', label: 'Editorial Typography' },
                { id: 'high_impact', label: 'High-Impact Hook' },
              ].map((tmpl) => {
                const isSelected = templateStyle === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => setTemplateStyle(tmpl.id as any)}
                    className={`p-2.5 rounded-lg border text-xs text-center transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#A16C50]/20 border-[#A16C50] text-[#EEE8DE] font-semibold'
                        : 'bg-[#202221] border-[#414542] text-[#B8B0A5] hover:text-[#EEE8DE]'
                    }`}
                  >
                    {tmpl.label}
                  </button>
                );
              })}
            </div>

            {/* Inputs: Title, Voiceover, Subtitle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Title Card Headline</label>
                <input
                  type="text"
                  value={titleOverlay}
                  onChange={(e) => setTitleOverlay(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Voiceover Synthesizer</label>
                <select
                  value={voiceoverModel}
                  onChange={(e) => setVoiceoverModel(e.target.value)}
                  className="w-full px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                >
                  <option value="Neural British Editorial (Male)">Neural British Editorial (Male)</option>
                  <option value="Neural Studio Direct (Female)">Neural Studio Direct (Female)</option>
                  <option value="Deep Executive Baritone (Male)">Deep Executive Baritone (Male)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-[#EEE8DE]">
                <input
                  type="checkbox"
                  checked={subtitlesEnabled}
                  onChange={(e) => setSubtitlesEnabled(e.target.checked)}
                  className="rounded border-[#414542] text-[#A16C50] focus:ring-0"
                />
                <Subtitles className="w-3.5 h-3.5 text-[#A16C50]" />
                <span>Burn Synchronized SRT Subtitles Directly into MP4</span>
              </label>

              <button
                type="button"
                onClick={handleStartRender}
                disabled={isRendering}
                className="px-5 py-2.5 rounded-lg bg-[#A16C50] hover:bg-[#8F5D43] disabled:opacity-50 text-xs font-bold text-[#EEE8DE] flex items-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                {isRendering ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Rendering with FFmpeg...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Queue Render Job</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Visual Preview Frame Mock */}
          <div className="p-6 rounded-xl bg-[#202221] border border-[#414542] flex flex-col items-center justify-center">
            <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B] mb-4">
              Real-Time Frame Preview ({aspectRatio})
            </span>

            <div className={`relative bg-gradient-to-br from-[#202221] via-[#292C29] to-[#303430] border-2 border-[#A16C50]/40 rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center text-center p-6 ${
              aspectRatio === '9:16' ? 'w-56 h-96' : aspectRatio === '16:9' ? 'w-full max-w-md h-60' : 'w-64 h-64'
            }`}>
              {/* Overlay brand badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#A16C50]" />
                <span className="text-[10px] font-mono-metrics text-[#C9B49B] tracking-wider uppercase">
                  {selectedProduct?.name || 'PROMETHEUS-9'}
                </span>
              </div>

              {/* Title overlay */}
              <div className="space-y-2">
                <h4 className="font-editorial text-lg font-bold text-[#EEE8DE] tracking-tight px-2 leading-tight">
                  {titleOverlay}
                </h4>
                <p className="text-[10px] text-[#B8B0A5] font-sans">
                  Autonomous Marketing OS
                </p>
              </div>

              {/* Subtitles mock */}
              {subtitlesEnabled && (
                <div className="absolute bottom-6 px-3 py-1 bg-black/60 rounded text-[11px] font-bold text-[#EEE8DE] border border-[#A16C50]/30">
                  "Autonomous intelligence replacing manual operations."
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Col: Render History & Export Queue */}
        <div className="bg-[#292C29] border border-[#414542] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#EEE8DE]">Render Output Queue</h3>
            <span className="text-xs font-mono-metrics text-[#C9B49B]">{renderJobs.length} Jobs</span>
          </div>

          <div className="space-y-3">
            {renderJobs.map((job) => (
              <div key={job.id} className="p-3.5 rounded-lg bg-[#202221] border border-[#414542] space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-mono-metrics uppercase px-1.5 py-0.5 rounded bg-[#303430] text-[#C9B49B] border border-[#414542]">
                      {job.aspect_ratio} • {job.resolution}
                    </span>
                    <h5 className="text-xs font-bold text-[#EEE8DE] mt-1 truncate">{job.title}</h5>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono-metrics border ${
                    job.status === 'completed'
                      ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40'
                      : 'bg-[#A16C50]/20 text-[#C9B49B] border-[#A16C50]/40'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                </div>

                {job.status === 'rendering' ? (
                  <div className="w-full bg-[#303430] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#A16C50] h-full transition-all duration-300"
                      style={{ width: `${job.progress_percent}%` }}
                    />
                  </div>
                ) : (
                  <div className="pt-2 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono-metrics text-[#B8B0A5]">
                      {job.duration_seconds}s • MP4 H.264
                    </span>
                    <button
                      onClick={() => alert(`Exporting ${job.title} to Creative Asset Library.`)}
                      className="text-[#A16C50] hover:text-[#C9B49B] flex items-center gap-1 font-semibold text-xs cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
