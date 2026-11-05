import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  ShieldCheck, 
  Layers, 
  Users, 
  Compass, 
  Target, 
  Share2, 
  Bot,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { createProduct, updateBrandProfile, createFeature, createAudience } from '../services/api';
import { Product } from '../types';

interface BrandCreationLabProps {
  onSuccess: (newProduct: Product) => void;
  onCancel: () => void;
}

export const BrandCreationLab: React.FC<BrandCreationLabProps> = ({ onSuccess, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Autonomous AI / SaaS');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  
  // Identity
  const [toneOfVoice, setToneOfVoice] = useState('Sophisticated, analytical, unapologetically ambitious');
  const [primaryColor, setPrimaryColor] = useState('#202221');
  const [accentColor, setAccentColor] = useState('#A16C50');
  const [missionStatement, setMissionStatement] = useState('');
  const [bannedClaims, setBannedClaims] = useState('Guaranteed 10x ROI overnight\nZero human involvement ever');

  // Product Feature
  const [featureName, setFeatureName] = useState('');
  const [featureBenefit, setFeatureBenefit] = useState('');

  // Audience
  const [personaName, setPersonaName] = useState('Technical Founder / Growth Executive');
  const [personaPainPoints, setPersonaPainPoints] = useState('Marketing takes time away from shipping code\nInconsistent social presence');

  // Market & Objective
  const [competitorNotes, setCompetitorNotes] = useState('Incumbents rely on manual agencies and generic templates.');
  const [primaryObjective, setPrimaryObjective] = useState('Autonomous brand awareness and inbound qualified pipeline');
  const [monthlyBudget, setMonthlyBudget] = useState('500');

  // Distribution & Agents
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['YouTube', 'LinkedIn', 'X']);
  const [autonomyTier, setAutonomyTier] = useState('supervised');

  // Restore draft if saved
  useEffect(() => {
    const saved = localStorage.getItem('prometheus9_brand_draft');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.brandName) setBrandName(data.brandName);
        if (data.tagline) setTagline(data.tagline);
        if (data.category) setCategory(data.category);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem('prometheus9_brand_draft', JSON.stringify({
      brandName,
      tagline,
      category,
      toneOfVoice
    }));
  }, [brandName, tagline, category, toneOfVoice]);

  const STAGES = [
    { num: 1, label: 'Discover Business', icon: Compass },
    { num: 2, label: 'Define Identity', icon: ShieldCheck },
    { num: 3, label: 'Add Products', icon: Layers },
    { num: 4, label: 'Build Audience', icon: Users },
    { num: 5, label: 'Establish Market', icon: Eye },
    { num: 6, label: 'Marketing Goals', icon: Target },
    { num: 7, label: 'Distribution', icon: Share2 },
    { num: 8, label: 'Activate Workforce', icon: Bot },
  ];

  const toggleChannel = (ch: string) => {
    if (selectedChannels.includes(ch)) {
      setSelectedChannels(selectedChannels.filter(c => c !== ch));
    } else {
      setSelectedChannels([...selectedChannels, ch]);
    }
  };

  const handleFinalSubmit = async () => {
    if (!brandName.trim()) {
      setError('Brand Name is required.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create Product
      const product = await createProduct({
        name: brandName,
        category,
        tagline: tagline || 'The future of autonomous brand intelligence.',
        description: description || missionStatement || 'Autonomous creative and marketing engine.',
        website_url: websiteUrl || undefined,
        primary_objective: primaryObjective
      });

      // 2. Set Brand Profile
      const parsedBanned = bannedClaims.split('\n').map(s => s.trim()).filter(Boolean);
      await updateBrandProfile(product.id, {
        tone_of_voice: toneOfVoice,
        primary_color: primaryColor,
        accent_color: accentColor,
        mission_statement: missionStatement || undefined,
        do_not_mention_claims: parsedBanned
      }).catch(() => {});

      // 3. Add Feature if provided
      if (featureName.trim()) {
        await createFeature(product.id, {
          name: featureName,
          description: 'Core product capability initialized during genesis.',
          benefit_statement: featureBenefit || undefined,
          is_verified: true
        }).catch(() => {});
      }

      // 4. Add Audience if provided
      if (personaName.trim()) {
        const painPoints = personaPainPoints.split('\n').map(s => s.trim()).filter(Boolean);
        await createAudience(product.id, {
          name: personaName,
          description: 'Primary customer persona created during brand genesis.',
          pain_points: painPoints,
          channels: selectedChannels
        }).catch(() => {});
      }

      localStorage.removeItem('prometheus9_brand_draft');
      onSuccess(product);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize brand world.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-140px)] bg-[#202221] text-[#EEE8DE] pb-24 px-6 md:px-12 py-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex items-center justify-between border-b border-copper-subtle pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
              GENESIS LAB // BRAND CREATION
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
            <span className="font-mono-metrics text-xs text-[#C9B49B]">STAGE 0{currentStep} / 08</span>
          </div>
          <h1 className="font-editorial text-3xl md:text-4xl text-[#EEE8DE] mt-1 font-normal">
            Ignite a New Brand World
          </h1>
        </div>
        <button
          onClick={onCancel}
          className="px-5 py-2 rounded-full border border-copper-subtle hover:border-[#A16C50] text-xs font-interface text-[#C9B49B] hover:text-[#EEE8DE] transition-colors"
        >
          Cancel Genesis
        </button>
      </div>

      {/* Visual Sequence Stage Bar */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-2 py-6 border-b border-copper-subtle/40">
        {STAGES.map((s) => {
          const Icon = s.icon;
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;
          return (
            <button
              key={s.num}
              onClick={() => setCurrentStep(s.num)}
              className={`p-2.5 rounded-xl text-left transition-all border ${
                isCurrent 
                  ? 'bg-[#A16C50]/20 border-[#A16C50] shadow-md shadow-[#A16C50]/10' 
                  : isDone
                    ? 'bg-[#292d2b]/40 border-copper-subtle text-[#C9B49B]'
                    : 'bg-transparent border-transparent text-[#C9B49B]/40 hover:text-[#C9B49B]'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono-metrics mb-1">
                <span>0{s.num}</span>
                {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : <Icon className="w-3 h-3 text-[#A16C50]" />}
              </div>
              <div className={`font-interface text-xs truncate ${isCurrent ? 'text-[#EEE8DE] font-semibold' : ''}`}>
                {s.label}
              </div>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-500/50 text-xs text-rose-200">
          {error}
        </div>
      )}

      {/* Main Creation Grid: Left Form, Right Live Luxury Preview */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STAGE 1: Discover your business */}
          {currentStep === 1 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">01 — Discover Your Business</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Anchor the core identity of the brand you want PROMETHEUS-9 to autonomously expand.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Brand / Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aetherius Studio or Orion-9"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Industry Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Editorial Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Precision luxury engineering for the modern creator"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Elevator Pitch & Essence
                </label>
                <textarea
                  rows={3}
                  placeholder="What makes this business irreplaceable?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 2: Define your identity */}
          {currentStep === 2 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">02 — Define Your Identity</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Set the voice, personality, and aesthetic guidelines that every agent will follow.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Tone of Voice
                </label>
                <input
                  type="text"
                  value={toneOfVoice}
                  onChange={(e) => setToneOfVoice(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono-metrics text-xs text-[#EEE8DE]">{primaryColor}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                    Accent Glow Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono-metrics text-xs text-[#EEE8DE]">{accentColor}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Mission Statement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Elevate human potential through automated craft"
                  value={missionStatement}
                  onChange={(e) => setMissionStatement(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#A16C50] uppercase mb-1">
                  Zero-Hallucination Claim Filter (Prohibited Statements)
                </label>
                <textarea
                  rows={2}
                  value={bannedClaims}
                  onChange={(e) => setBannedClaims(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-xs font-mono-metrics text-[#EEE8DE] focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 3: Add products & services */}
          {currentStep === 3 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">03 — Add Products & Services</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Register verified capabilities that provide the factual basis for creative generation.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Core Verified Feature Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Autonomous Closed-Loop Optimization Engine"
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Customer Value Statement
                </label>
                <input
                  type="text"
                  placeholder="e.g. Continuously tests and refines scripts based on real audience retention"
                  value={featureBenefit}
                  onChange={(e) => setFeatureBenefit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 4: Build your audience */}
          {currentStep === 4 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">04 — Build Your Audience</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Define the customer profile that script hooks and marketing hooks will address.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Primary Customer Persona
                </label>
                <input
                  type="text"
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Persona Critical Pain Points (One per line)
                </label>
                <textarea
                  rows={3}
                  value={personaPainPoints}
                  onChange={(e) => setPersonaPainPoints(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 5: Establish your market */}
          {currentStep === 5 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">05 — Establish Your Market</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Ground your positioning against competitor claims and industry vectors.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Competitor Landscape & Differentiation
                </label>
                <textarea
                  rows={3}
                  value={competitorNotes}
                  onChange={(e) => setCompetitorNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 6: Define marketing objectives */}
          {currentStep === 6 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">06 — Define Marketing Objectives</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Set target KPIs and budget guardrails for the autonomous engine.
              </p>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Primary Strategic Objective
                </label>
                <input
                  type="text"
                  value={primaryObjective}
                  onChange={(e) => setPrimaryObjective(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-metrics text-[#C9B49B] uppercase mb-1">
                  Monthly Budget Cap (USD)
                </label>
                <input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#202221] border border-copper-subtle text-[#EEE8DE] text-sm focus:outline-none focus:border-[#A16C50]"
                />
              </div>
            </div>
          )}

          {/* STAGE 7: Connect distribution channels */}
          {currentStep === 7 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">07 — Distribution Channels</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Select authorized destination platforms where creative content will be distributed.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['YouTube', 'Instagram', 'LinkedIn', 'X', 'TikTok', 'Facebook'].map((plat) => {
                  const isSelected = selectedChannels.includes(plat);
                  return (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => toggleChannel(plat)}
                      className={`p-3 rounded-xl border text-xs font-interface text-left transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-[#A16C50]/20 border-[#A16C50] text-[#EEE8DE] font-semibold' 
                          : 'bg-[#202221] border-copper-subtle text-[#C9B49B]'
                      }`}
                    >
                      <span>{plat}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-[#A16C50]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STAGE 8: Activate creative workforce */}
          {currentStep === 8 && (
            <div className="p-6 rounded-2xl bg-[#292d2b]/40 border border-copper-subtle space-y-4">
              <h3 className="font-editorial text-2xl text-[#EEE8DE]">08 — Activate Creative Workforce</h3>
              <p className="font-expressive text-sm text-[#C9B49B] italic">
                Assign autonomy governance for this brand.
              </p>

              <div className="space-y-3">
                {[
                  { id: 'supervised', title: 'Supervised Autopilot', desc: 'Specialists draft all scripts, storyboards and schedules; human one-click signoff required before publishing.' },
                  { id: 'assisted', title: 'Assisted Co-Pilot', desc: 'Specialists generate ideas and components upon manual prompt triggers.' },
                  { id: 'autonomous', title: 'Autonomous Closed-Loop', desc: 'Continuous research, scriptwriting, and publishing within strict budget and verified claims.' }
                ].map((tier) => (
                  <div
                    key={tier.id}
                    onClick={() => setAutonomyTier(tier.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      autonomyTier === tier.id 
                        ? 'bg-[#A16C50]/20 border-[#A16C50]' 
                        : 'bg-[#202221] border-copper-subtle hover:border-[#A16C50]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-interface text-sm font-semibold text-[#EEE8DE]">{tier.title}</span>
                      {autonomyTier === tier.id && <span className="w-2 h-2 rounded-full bg-[#A16C50]" />}
                    </div>
                    <p className="font-interface text-xs text-[#C9B49B] mt-1">{tier.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Navigation Controls */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              disabled={currentStep === 1}
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-copper-subtle text-xs font-interface text-[#C9B49B] hover:text-[#EEE8DE] disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Stage</span>
            </button>

            {currentStep < 8 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface font-semibold text-[#EEE8DE] shadow-lg shadow-[#A16C50]/20 cursor-pointer"
              >
                <span>Proceed to Stage 0{currentStep + 1}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleFinalSubmit}
                className="flex items-center gap-2 px-8 py-3 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-interface font-bold text-[#EEE8DE] shadow-xl shadow-[#A16C50]/30 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'Igniting Universe...' : 'Launch Living Brand World'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Live Luxury Preview (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="sticky top-8 p-6 rounded-2xl bg-[#202221] border border-copper-subtle shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-copper-subtle pb-3">
              <span className="font-mono-metrics text-[10px] text-[#A16C50] uppercase tracking-widest">
                LIVE WORLD MANIFEST PREVIEW
              </span>
              <span className="flex items-center gap-1.5 font-mono-metrics text-[10px] text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>REAL-TIME DRAFT</span>
              </span>
            </div>

            {/* Simulated Luxury Screen Visualizer */}
            <div className="p-6 rounded-xl bg-obsidian-gradient border border-copper-subtle/80 flex flex-col justify-between min-h-[280px]">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#A16C50]/30 border border-[#A16C50]/60 text-[9px] font-mono-metrics text-[#EEE8DE] uppercase">
                  {category}
                </span>
                <h2 className="font-editorial text-3xl text-[#EEE8DE] mt-3">
                  {brandName || 'Untitled Brand'}
                </h2>
                <p className="font-expressive text-sm text-[#C9B49B] italic mt-1">
                  "{tagline || 'Editorial tagline defining market authority.'}"
                </p>
              </div>

              <div className="pt-4 border-t border-copper-subtle/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-metrics text-[10px] text-[#C9B49B]/70">VOICE:</span>
                  <span className="font-interface text-xs text-[#EEE8DE] truncate max-w-[200px]">{toneOfVoice}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-metrics text-[10px] text-[#C9B49B]/70">TARGET:</span>
                  <span className="font-interface text-xs text-[#EEE8DE]">{personaName}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono-metrics text-[10px] text-[#C9B49B]/70">CHANNELS:</span>
                  <span className="font-mono-metrics text-[10px] text-[#A16C50]">
                    {selectedChannels.join(', ') || 'None selected'}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-[11px] font-interface text-[#C9B49B]/80 leading-relaxed">
              Once ignited, this brand world becomes an operational celestial node in PROMETHEUS-9, populated with verified models, research capabilities, and autonomous specialists.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
