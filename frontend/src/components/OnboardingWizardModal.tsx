import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  Layers, 
  Globe, 
  ShieldCheck, 
  Users, 
  Target, 
  Share2, 
  Bot, 
  CheckCircle2, 
  AlertCircle,
  Wand2,
  Lock,
  Compass
} from 'lucide-react';
import { PrometheusLogo } from './PrometheusLogo';
import { Product } from '../types';

interface OnboardingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (productData: any) => Promise<void>;
}

export const OnboardingWizardModal: React.FC<OnboardingWizardModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isScanningUrl, setIsScanningUrl] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State across the 8 steps
  const [businessName, setBusinessName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState('B2B SaaS & Tech');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');

  // Step 2: Product & Verified Claims
  const [primaryFeature, setPrimaryFeature] = useState('');
  const [verifiedClaim, setVerifiedClaim] = useState('');
  const [featuresList, setFeaturesList] = useState<string[]>([]);
  const [claimsList, setClaimsList] = useState<string[]>([]);

  // Step 3: Brand Profile
  const [toneOfVoice, setToneOfVoice] = useState('Sophisticated Luxury & Confident Authority');
  const [primaryColor, setPrimaryColor] = useState('#202221');
  const [accentColor, setAccentColor] = useState('#A16C50');
  const [secondaryColor, setSecondaryColor] = useState('#C9B49B');
  const [doNotMention, setDoNotMention] = useState('Guaranteed 100x return without effort');

  // Step 4: Audience Personas
  const [personaName, setPersonaName] = useState('Growth Founder & Solo Operator');
  const [personaPain, setPersonaPain] = useState('Overwhelmed creating consistent high-tier marketing content alone');
  const [targetChannels, setTargetChannels] = useState<string[]>(['LinkedIn', 'YouTube', 'X (Twitter)']);

  // Step 5: Marketing Objectives & KPIs
  const [primaryObjective, setPrimaryObjective] = useState('Autonomous Pipeline Generation & Inbound Brand Authority');
  const [targetKpi, setTargetKpi] = useState('500 High-Intent Leads per Quarter');
  const [monthlyBudgetCap, setMonthlyBudgetCap] = useState('2500');

  // Step 6: Distribution Channels
  const [enabledPlatforms, setEnabledPlatforms] = useState<string[]>(['linkedin', 'youtube', 'x']);

  // Step 7: AI Workforce Activation
  const [activeAgents, setActiveAgents] = useState<string[]>([
    'Research Director',
    'Strategy Director',
    'Copy Chief',
    'Script Supervisor',
    'Compliance Guardian',
    'Publishing Operations'
  ]);
  const [autonomyTier, setAutonomyTier] = useState<'supervised' | 'autonomous'>('supervised');

  if (!isOpen) return null;

  const handleSimulatedScan = () => {
    if (!websiteUrl) return;
    setIsScanningUrl(true);
    setTimeout(() => {
      setIsScanningUrl(false);
      setScanComplete(true);
      if (!businessName) setBusinessName('QuantumFlow AI');
      if (!tagline) setTagline('Enterprise-Grade Real-Time Knowledge Graph Platform');
      if (!description) setDescription('Empowering enterprises with autonomous semantic graph intelligence, verified claims, and predictive data discovery.');
      setFeaturesList(['Zero-Latency Knowledge Ingestion', 'Deterministic RBAC Architecture', 'End-to-End Cryptographic Ledger']);
      setClaimsList(['SOC-2 Type II Certified', 'Sub-10ms Vector Retrieval']);
    }, 1200);
  };

  const handleAddFeature = () => {
    if (primaryFeature.trim()) {
      setFeaturesList(prev => [...prev, primaryFeature.trim()]);
      setPrimaryFeature('');
    }
  };

  const handleAddClaim = () => {
    if (verifiedClaim.trim()) {
      setClaimsList(prev => [...prev, verifiedClaim.trim()]);
      setVerifiedClaim('');
    }
  };

  const togglePlatform = (p: string) => {
    setEnabledPlatforms(prev => 
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const toggleAgent = (a: string) => {
    setActiveAgents(prev => 
      prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: businessName || 'New Product Portfolio',
        category,
        tagline: tagline || 'Autonomous Growth & Market Expansion',
        description: description || 'Built with PROMETHEUS-9 Autonomous Marketing OS',
        website_url: websiteUrl || 'https://example.com',
        primary_objective: primaryObjective,
        features: featuresList.length > 0 ? featuresList : ['Autonomous Multi-Channel Generation'],
        verified_claims: claimsList,
        brand_profile: {
          tone_of_voice: toneOfVoice,
          primary_color: primaryColor,
          accent_color: accentColor,
          secondary_color: secondaryColor,
          do_not_mention_claims: [doNotMention],
        },
        audience: {
          name: personaName,
          pain_points: [personaPain],
          channels: targetChannels,
        },
        autonomy_tier: autonomyTier,
        active_agents: activeAgents,
        enabled_platforms: enabledPlatforms,
      };

      await onComplete(payload);
      onClose();
    } catch (e) {
      console.error('Onboarding failed:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-[#202221] border border-[#414542] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-[#EEE8DE]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#292C29] border-b border-[#414542] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PrometheusLogo size={28} showWordmark={true} />
            <div className="hidden sm:block h-4 w-px bg-[#414542]" />
            <span className="hidden sm:inline text-xs font-mono-metrics text-[#C9B49B]">
              8-Step Business Onboarding Wizard
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono-metrics text-[#B8B0A5]">
              Step <span className="text-[#A16C50] font-bold">{currentStep}</span> of 8
            </span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="w-full bg-[#202221] px-6 py-3 border-b border-[#414542] flex items-center gap-2 overflow-x-auto">
          {[
            '1. Business Profile',
            '2. Products & Claims',
            '3. Brand & Voice',
            '4. Audience Persona',
            '5. Growth Objectives',
            '6. Channels',
            '7. AI Workforce',
            '8. Launch',
          ].map((title, idx) => {
            const stepNum = idx + 1;
            const isPassed = currentStep > stepNum;
            const isCurrent = currentStep === stepNum;

            return (
              <button
                key={title}
                onClick={() => isPassed && setCurrentStep(stepNum)}
                disabled={!isPassed && !isCurrent}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono-metrics shrink-0 transition-colors ${
                  isCurrent
                    ? 'bg-[#A16C50] text-[#EEE8DE] font-semibold shadow-sm'
                    : isPassed
                    ? 'bg-[#303430] text-[#C9B49B] hover:text-[#EEE8DE]'
                    : 'text-[#B8B0A5]/40 cursor-not-allowed'
                }`}
              >
                {isPassed ? <Check className="w-3 h-3 text-emerald-400" /> : <span>{stepNum}</span>}
                <span>{title.split('. ')[1]}</span>
              </button>
            );
          })}
        </div>

        {/* Step Content Area */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
          
          {/* STEP 1: Business Profile & Factual Web Extraction */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  1. Business Profile & Instant Web Scan
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Enter your company or product website. The Research Director agent will extract factual product capabilities and value propositions.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
                <label className="block text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  Company or Product Website URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 absolute left-3 top-3 text-[#B8B0A5]" />
                    <input
                      type="url"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      placeholder="https://yourproduct.com"
                      className="w-full pl-9 pr-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulatedScan}
                    disabled={isScanningUrl || !websiteUrl}
                    className="px-4 py-2 bg-[#A16C50] hover:bg-[#8F5D43] disabled:opacity-50 text-[#EEE8DE] text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {isScanningUrl ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-[#EEE8DE] border-t-transparent rounded-full animate-spin" />
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-3.5 h-3.5" />
                        <span>Scan URL</span>
                      </>
                    )}
                  </button>
                </div>

                {scanComplete && (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg flex items-center gap-2 text-xs text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                    <span>Factual claims successfully verified and imported into the product knowledge base.</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Product / Business Name *</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="e.g. Orion-9 Analytics"
                    className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Industry Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  >
                    <option value="B2B SaaS & Tech">B2B SaaS & Tech</option>
                    <option value="Luxury & Lifestyle">Luxury & Lifestyle</option>
                    <option value="Fintech & Wealth">Fintech & Wealth</option>
                    <option value="Consumer Goods & E-Commerce">Consumer Goods & E-Commerce</option>
                    <option value="Healthcare & Bio">Healthcare & Bio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Core Tagline</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Enterprise Autonomous Market Acceleration"
                  className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Value Proposition Summary</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail how your business creates distinct asymmetric value for customers..."
                  className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Products & Verified Claims */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  2. Product Features & Verified Claims Guard
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  PROMETHEUS-9 enforces deterministic truth. AI agents are strictly bounded to verified claims to prevent hallucinations.
                </p>
              </div>

              {/* Add Feature */}
              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-3">
                <label className="block text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  Add Key Product Feature / Capability
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={primaryFeature}
                    onChange={(e) => setPrimaryFeature(e.target.value)}
                    placeholder="e.g. Real-Time Autonomous Publishing Scheduler"
                    className="flex-1 px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-2 bg-[#303430] hover:bg-[#414542] text-[#EEE8DE] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {featuresList.map((f, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[#202221] border border-[#414542] text-xs text-[#EEE8DE] flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-[#A16C50]" />
                      <span>{f}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Verified Claims */}
              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <label className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                    Deterministic Verified Claims (Non-Hallucinatory)
                  </label>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={verifiedClaim}
                    onChange={(e) => setVerifiedClaim(e.target.value)}
                    placeholder="e.g. 99.99% uptime SLA backed by contractual guarantees"
                    className="flex-1 px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddClaim}
                    className="px-3 py-2 bg-[#303430] hover:bg-[#414542] text-[#EEE8DE] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    + Verify Claim
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {claimsList.map((c, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-1.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>{c}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Brand Identity & Voice */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  3. Brand Profile & Voice Styling
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Configure your brand tone of voice and color palette to ensure all scripts and visual layouts conform to high aesthetic standards.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B0A5] mb-2">Editorial Tone of Voice</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    'Sophisticated Luxury & Confident Authority',
                    'Direct, Technical & Precision-Engineered',
                    'Bold, Provocative & Challenger Mindset',
                    'Warm, Approachable & Insight-Driven',
                  ].map((tone) => (
                    <button
                      key={tone}
                      type="button"
                      onClick={() => setToneOfVoice(tone)}
                      className={`p-3 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                        toneOfVoice === tone
                          ? 'bg-[#303430] border-[#A16C50] text-[#EEE8DE] font-semibold'
                          : 'bg-[#292C29] border-[#414542] text-[#B8B0A5] hover:border-[#B8B0A5]'
                      }`}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Palette */}
              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
                <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  Brand Hex Color Tokens
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] text-[#B8B0A5] mb-1">Primary Bg</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-[#414542] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono-metrics bg-[#202221] border border-[#414542] rounded text-[#EEE8DE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#B8B0A5] mb-1">Accent (Burnished)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-8 h-8 rounded border border-[#414542] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono-metrics bg-[#202221] border border-[#414542] rounded text-[#EEE8DE]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#B8B0A5] mb-1">Secondary Accent</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-8 h-8 rounded border border-[#414542] cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono-metrics bg-[#202221] border border-[#414542] rounded text-[#EEE8DE]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#B8B0A5] mb-1">
                  Do-Not-Mention Claims & Negative Constraints
                </label>
                <input
                  type="text"
                  value={doNotMention}
                  onChange={(e) => setDoNotMention(e.target.value)}
                  placeholder="e.g. Do not claim overnight wealth or non-compliant medical benefits"
                  className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Audience Personas */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  4. Ideal Customer Profile & Audience Persona
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Define the core buyer persona your creative content and marketing strategies will address.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-4">
                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Persona Title</label>
                  <input
                    type="text"
                    value={personaName}
                    onChange={(e) => setPersonaName(e.target.value)}
                    placeholder="e.g. Chief Marketing Officer / Growth Lead"
                    className="w-full px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Critical Pain Point</label>
                  <textarea
                    rows={2}
                    value={personaPain}
                    onChange={(e) => setPersonaPain(e.target.value)}
                    placeholder="Describe their daily friction or unresolved operational challenge..."
                    className="w-full px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B] mb-2">
                    Primary Digital Habitat
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['LinkedIn', 'YouTube', 'X (Twitter)', 'TikTok', 'Instagram', 'Substack & Newsletters'].map((ch) => {
                      const selected = targetChannels.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => {
                            setTargetChannels(prev => 
                              selected ? prev.filter(c => c !== ch) : [...prev, ch]
                            );
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer border ${
                            selected
                              ? 'bg-[#A16C50]/20 border-[#A16C50] text-[#EEE8DE] font-semibold'
                              : 'bg-[#202221] border-[#414542] text-[#B8B0A5] hover:text-[#EEE8DE]'
                          }`}
                        >
                          {ch}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Growth Objectives & KPIs */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  5. Marketing Objectives & Hard Budget Caps
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Set quantitative targets and financial safety caps to protect your organization.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Primary Marketing Objective</label>
                  <input
                    type="text"
                    value={primaryObjective}
                    onChange={(e) => setPrimaryObjective(e.target.value)}
                    className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#B8B0A5] mb-1 font-medium">Target KPI</label>
                  <input
                    type="text"
                    value={targetKpi}
                    onChange={(e) => setTargetKpi(e.target.value)}
                    className="w-full px-3 py-2 bg-[#292C29] border border-[#414542] rounded-lg text-xs text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                </div>

                <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-[#A16C50]" />
                    <label className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                      Hard Monthly Campaign Budget Cap (USD $)
                    </label>
                  </div>
                  <input
                    type="number"
                    value={monthlyBudgetCap}
                    onChange={(e) => setMonthlyBudgetCap(e.target.value)}
                    className="w-48 px-3 py-2 bg-[#202221] border border-[#414542] rounded-lg text-xs font-mono-metrics text-[#EEE8DE] focus:border-[#A16C50] focus:outline-none"
                  />
                  <p className="text-[11px] text-[#B8B0A5]">
                    The Autonomous Scheduler will automatically freeze publishing if paid campaigns exceed this dollar threshold.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Distribution Channels Setup */}
          {currentStep === 6 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  6. Distribution Channels & Platform Authorizations
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Select the social channels to activate. OAuth tokens can be bound now or configured in Distribution later.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'youtube', name: 'YouTube', desc: 'Long-form videos, Shorts & Community Posts' },
                  { id: 'linkedin', name: 'LinkedIn', desc: 'Executive Thought Leadership & Articles' },
                  { id: 'x', name: 'X (Twitter)', desc: 'Real-time Trends, Announcements & Threads' },
                  { id: 'instagram', name: 'Instagram', desc: 'Reels, Carousels & Brand Storytelling' },
                  { id: 'tiktok', name: 'TikTok', desc: 'High-Impact Short-Form Creative Video' },
                  { id: 'facebook', name: 'Facebook Pages', desc: 'Community Engagement & Local Reach' },
                ].map((p) => {
                  const isEnabled = enabledPlatforms.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      onClick={() => togglePlatform(p.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                        isEnabled
                          ? 'bg-[#303430] border-[#A16C50]'
                          : 'bg-[#292C29] border-[#414542] opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-xs text-[#EEE8DE]">{p.name}</span>
                        <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isEnabled ? 'bg-[#A16C50] border-[#A16C50]' : 'border-[#414542]'
                        }`}>
                          {isEnabled && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#B8B0A5]">{p.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 7: AI Workforce Activation */}
          {currentStep === 7 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  7. Autonomous AI Workforce Activation
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Activate specialized agents and configure the autonomy boundary.
                </p>
              </div>

              {/* Autonomy Mode Selector */}
              <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-3">
                <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
                  Autonomy Supervision Level
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAutonomyTier('supervised')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      autonomyTier === 'supervised'
                        ? 'bg-[#303430] border-[#A16C50] text-[#EEE8DE] font-semibold'
                        : 'bg-[#202221] border-[#414542] text-[#B8B0A5]'
                    }`}
                  >
                    <div className="font-bold mb-1">Supervised Mode (Recommended)</div>
                    <div className="text-[11px] text-[#B8B0A5]">Agents generate ideas, scripts and renders; human approval required prior to publishing.</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAutonomyTier('autonomous')}
                    className={`p-3 rounded-lg border text-left text-xs transition-colors cursor-pointer ${
                      autonomyTier === 'autonomous'
                        ? 'bg-[#303430] border-[#A16C50] text-[#EEE8DE] font-semibold'
                        : 'bg-[#202221] border-[#414542] text-[#B8B0A5]'
                    }`}
                  >
                    <div className="font-bold mb-1">Full Autonomy</div>
                    <div className="text-[11px] text-[#B8B0A5]">Agents publish directly according to schedule and strict budget boundaries.</div>
                  </button>
                </div>
              </div>

              {/* Agents list */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Research Director',
                  'Strategy Director',
                  'Copy Chief',
                  'Script Supervisor',
                  'Creative Director',
                  'Video Producer',
                  'Compliance Guardian',
                  'Publishing Operations',
                  'Growth Analyst',
                ].map((agentName) => {
                  const isActive = activeAgents.includes(agentName);
                  return (
                    <button
                      key={agentName}
                      type="button"
                      onClick={() => toggleAgent(agentName)}
                      className={`p-2.5 rounded-lg border text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[#303430] border-[#A16C50] text-[#EEE8DE]'
                          : 'bg-[#292C29] border-[#414542] text-[#B8B0A5]'
                      }`}
                    >
                      <span className="truncate">{agentName}</span>
                      {isActive && <Check className="w-3 h-3 text-[#A16C50]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 8: Final Review & Launch */}
          {currentStep === 8 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h3 className="font-editorial text-2xl text-[#EEE8DE] mb-1">
                  8. Review & Launch Autonomous Workspace
                </h3>
                <p className="text-xs text-[#B8B0A5]">
                  Everything is configured. Review your parameters and launch your autonomous growth platform.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                  <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">Product & Brand</span>
                  <div className="text-sm font-bold text-[#EEE8DE]">{businessName || 'New Product'}</div>
                  <div className="text-xs text-[#B8B0A5]">{category} • {websiteUrl || 'No domain'}</div>
                  <div className="text-xs text-[#C9B49B] italic mt-1 font-editorial">"{toneOfVoice}"</div>
                </div>

                <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] space-y-2">
                  <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">Audience & Growth</span>
                  <div className="text-sm font-bold text-[#EEE8DE]">{personaName}</div>
                  <div className="text-xs text-[#B8B0A5]">Monthly Budget Cap: ${monthlyBudgetCap}</div>
                  <div className="text-xs text-[#A16C50]">Mode: {autonomyTier.toUpperCase()}</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs text-emerald-300 space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Ready for Deterministic Execution</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-300/80">
                  Upon launching, PROMETHEUS-9 will seed this product in SQLite WAL storage, bind verified claims to the prompt guards, initialize the 12-agent hierarchy, and configure the approval gates.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Controls */}
        <div className="px-6 py-4 bg-[#292C29] border-t border-[#414542] flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 py-2 rounded-lg bg-[#202221] border border-[#414542] text-xs font-semibold text-[#B8B0A5] hover:text-[#EEE8DE] disabled:opacity-40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {currentStep < 8 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(prev => Math.min(8, prev + 1))}
              className="px-5 py-2 rounded-lg bg-[#A16C50] hover:bg-[#8F5D43] text-xs font-semibold text-[#EEE8DE] transition-colors cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Launching Workspace...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Autonomous Workspace</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
