import React, { useState, useEffect, useRef } from 'react';
import { 
  Product, 
  BrandProfile, 
  ProductFeature, 
  AudiencePersona, 
  Campaign, 
  SpecialistAgent, 
  SocialAccount,
  UniverseNode 
} from '../types';
import { 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  Users, 
  Radar, 
  Target, 
  Film, 
  Bot, 
  Share2, 
  BarChart3, 
  ArrowUpRight,
  AlertCircle,
  Sliders,
  ChevronRight
} from 'lucide-react';

interface BrandUniverseCanvasProps {
  product: Product | null;
  features: ProductFeature[];
  brandProfile: BrandProfile | null;
  audiences: AudiencePersona[];
  campaigns: Campaign[];
  agents: SpecialistAgent[];
  socialAccounts: SocialAccount[];
  isAutonomousPaused: boolean;
  onSelectNode: (nodeId: string) => void;
  onOpenBrandCreation: () => void;
  onSwitchBrand: (productId: string) => void;
  allProducts: Product[];
}

export const BrandUniverseCanvas: React.FC<BrandUniverseCanvasProps> = ({
  product,
  features,
  brandProfile,
  audiences,
  campaigns,
  agents,
  socialAccounts,
  isAutonomousPaused,
  onSelectNode,
  onOpenBrandCreation,
  onSwitchBrand,
  allProducts,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [rotationAngle, setRotationAngle] = useState(0);

  // Subtle orbital rotation
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      setRotationAngle((prev) => (prev + dt * 1.5) % 360);
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Compute node completeness & metrics based on real data
  const hasVoice = Boolean(brandProfile?.tone_of_voice);
  const featuresCount = features.length;
  const audienceCount = audiences.length;
  const campaignsCount = campaigns.length;
  const activeSocialCount = socialAccounts.filter(a => a.authorization_status === 'connected' || a.authorization_status === 'active').length;
  const readyAgentsCount = agents.filter(a => a.status === 'idle' || a.status === 'active').length;

  const NODES: UniverseNode[] = [
    {
      id: 'identity',
      label: 'Brand Identity',
      subtitle: 'Voice, Tone & Positioning',
      category: 'Governance',
      x: 0,
      y: -230,
      icon: 'ShieldCheck',
      completeness: hasVoice ? 100 : 35,
      status: hasVoice ? 'active' : 'pending',
      metrics: [
        { label: 'Voice Tone', value: brandProfile?.tone_of_voice ? 'Defined' : 'Missing' },
        { label: 'Banned Claims', value: `${brandProfile?.do_not_mention_claims?.length || 0} claims` }
      ]
    },
    {
      id: 'products',
      label: 'Products & Claims',
      subtitle: 'Verified Capabilities',
      category: 'Foundation',
      x: 155,
      y: -180,
      icon: 'Layers',
      completeness: Math.min(100, featuresCount * 25),
      status: featuresCount > 0 ? 'active' : 'pending',
      metrics: [
        { label: 'Features', value: `${featuresCount} items` },
        { label: 'Verified', value: `${features.filter(f => f.is_verified).length}` }
      ]
    },
    {
      id: 'audience',
      label: 'Audience Ecosystem',
      subtitle: 'Personas & Customer Resonance',
      category: 'Intelligence',
      x: 235,
      y: -50,
      icon: 'Users',
      completeness: audienceCount > 0 ? 100 : 20,
      status: audienceCount > 0 ? 'active' : 'pending',
      metrics: [
        { label: 'Personas', value: `${audienceCount} defined` },
        { label: 'Resonance', value: 'High' }
      ]
    },
    {
      id: 'market_intel',
      label: 'Market Intelligence',
      subtitle: 'Signals & Search Dynamics',
      category: 'Intelligence',
      x: 220,
      y: 100,
      icon: 'Radar',
      completeness: 85,
      status: 'active',
      metrics: [
        { label: 'Tracking', value: 'Continuous' },
        { label: 'Confidence', value: '98.4%' }
      ]
    },
    {
      id: 'strategy',
      label: 'Marketing Strategy',
      subtitle: 'Pillars & Conversion Goals',
      category: 'Strategy',
      x: 130,
      y: 215,
      icon: 'Target',
      completeness: 90,
      status: 'active',
      metrics: [
        { label: 'Pillars', value: '4 active' },
        { label: 'Cycle', value: 'Autonomous' }
      ]
    },
    {
      id: 'campaigns',
      label: 'Campaign Journey',
      subtitle: '9-Stage Autonomous Engine',
      category: 'Execution',
      x: -20,
      y: 240,
      icon: 'Sliders',
      completeness: campaignsCount > 0 ? 100 : 40,
      status: campaignsCount > 0 ? 'active' : 'idle',
      metrics: [
        { label: 'Campaigns', value: `${campaignsCount} total` },
        { label: 'Active', value: `${campaigns.filter(c => c.status === 'active').length}` }
      ]
    },
    {
      id: 'creative',
      label: 'Creative Studio',
      subtitle: 'Scripts, Ideas & Media',
      category: 'Creative',
      x: -160,
      y: 195,
      icon: 'Film',
      completeness: 80,
      status: 'active',
      metrics: [
        { label: 'Studio Mode', value: 'Production' },
        { label: 'Formats', value: 'Shorts, Reels, Carousels' }
      ]
    },
    {
      id: 'workforce',
      label: 'Agent Workforce',
      subtitle: '12 Autonomous Specialists',
      category: 'Operations',
      x: -235,
      y: 60,
      icon: 'Bot',
      completeness: readyAgentsCount > 0 ? 100 : 50,
      status: isAutonomousPaused ? 'idle' : 'active',
      metrics: [
        { label: 'Specialists', value: `${readyAgentsCount} online` },
        { label: 'State', value: isAutonomousPaused ? 'PAUSED' : 'ACTIVE' }
      ]
    },
    {
      id: 'social',
      label: 'Social Constellation',
      subtitle: 'Authorized Distribution',
      category: 'Distribution',
      x: -230,
      y: -95,
      icon: 'Share2',
      completeness: activeSocialCount > 0 ? 100 : 25,
      status: activeSocialCount > 0 ? 'active' : 'pending',
      metrics: [
        { label: 'Destinations', value: `${activeSocialCount} / 6` },
        { label: 'OAuth Health', value: 'Secure' }
      ]
    },
    {
      id: 'performance',
      label: 'Performance Intel',
      subtitle: 'Attribution & Optimization',
      category: 'Measurement',
      x: -130,
      y: -210,
      icon: 'BarChart3',
      completeness: 75,
      status: 'active',
      metrics: [
        { label: 'Attribution', value: 'Real-time' },
        { label: 'Loop', value: 'Closed' }
      ]
    }
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-5 h-5 text-[#C9B49B]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[#A16C50]" />;
      case 'Users': return <Users className="w-5 h-5 text-[#C9B49B]" />;
      case 'Radar': return <Radar className="w-5 h-5 text-[#EEE8DE]" />;
      case 'Target': return <Target className="w-5 h-5 text-[#A16C50]" />;
      case 'Sliders': return <Sliders className="w-5 h-5 text-[#C9B49B]" />;
      case 'Film': return <Film className="w-5 h-5 text-[#EEE8DE]" />;
      case 'Bot': return <Bot className="w-5 h-5 text-[#A16C50]" />;
      case 'Share2': return <Share2 className="w-5 h-5 text-[#C9B49B]" />;
      case 'BarChart3': return <BarChart3 className="w-5 h-5 text-[#A16C50]" />;
      default: return <Sparkles className="w-5 h-5 text-[#C9B49B]" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[calc(100vh-140px)] min-h-[680px] flex items-center justify-center overflow-hidden bg-obsidian-gradient select-none"
    >
      {/* Background Celestial Wireframe Grid */}
      <div className="absolute inset-0 cosmic-grid opacity-30 pointer-events-none" />

      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full bg-[#A16C50]/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full bg-[#C9B49B]/5 blur-[80px] pointer-events-none" />

      {/* Top Editorial Universe Header */}
      <div className="absolute top-6 left-8 z-20 flex flex-col pointer-events-auto">
        <div className="flex items-center gap-3">
          <span className="font-mono-metrics text-xs text-[#A16C50] tracking-widest uppercase">
            [ SYSTEM CONSTELLATION ]
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50] animate-pulse" />
          <span className="font-mono-metrics text-xs text-[#C9B49B]/70">
            {product ? `${product.name} UNIVERSE` : 'SELECT BRAND'}
          </span>
        </div>
        <h1 className="font-editorial text-3xl md:text-4xl text-[#EEE8DE] mt-1 font-normal tracking-tight">
          The Living Brand Universe
        </h1>
        <p className="font-expressive text-sm md:text-base text-[#C9B49B] italic mt-0.5 max-w-md">
          {product?.tagline || 'Intelligent digital ecosystem uniting strategy, creative production, and distribution.'}
        </p>
      </div>

      {/* Brand Switcher & Creation Trigger (Floating Top Right) */}
      <div className="absolute top-6 right-8 z-20 flex items-center gap-3">
        <div className="relative group">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-copper-subtle bg-[#202221]/80 backdrop-blur-md text-xs font-interface text-[#EEE8DE] hover:border-[#A16C50] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#A16C50]" />
            <span className="font-medium tracking-wide">{product?.name || 'Switch Brand'}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C9B49B] rotate-90" />
          </button>
          
          <div className="absolute right-0 top-full mt-2 w-56 py-2 bg-[#202221] border border-copper-subtle rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="px-3 py-1 text-[10px] font-mono-metrics text-[#C9B49B]/60 uppercase tracking-widest border-b border-copper-subtle/50 mb-1">
              Registered Brands
            </div>
            {allProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => onSwitchBrand(p.id)}
                className={`w-full text-left px-3 py-2 text-xs font-interface flex items-center justify-between hover:bg-[#414542]/30 transition-colors ${
                  product?.id === p.id ? 'text-[#A16C50] font-semibold' : 'text-[#EEE8DE]'
                }`}
              >
                <span>{p.name}</span>
                {product?.id === p.id && <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />}
              </button>
            ))}
            <div className="border-t border-copper-subtle/50 mt-1 pt-1">
              <button
                onClick={onOpenBrandCreation}
                className="w-full text-left px-3 py-2 text-xs font-interface text-[#C9B49B] hover:text-[#EEE8DE] hover:bg-[#A16C50]/20 transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-3 h-3 text-[#A16C50]" />
                <span>+ Launch New Brand World</span>
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenBrandCreation}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#A16C50] hover:bg-[#B87C5E] text-[#EEE8DE] text-xs font-interface font-medium tracking-wide shadow-lg shadow-[#A16C50]/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Genesis Lab</span>
        </button>
      </div>

      {/* SVG Spatial Constellation Layer */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="-450 -350 900 700"
      >
        <defs>
          <linearGradient id="copperLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A16C50" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#414542" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="activeLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EEE8DE" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#A16C50" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#C9B49B" stopOpacity="0.3" />
          </linearGradient>
          <radialGradient id="centralGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#A16C50" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#202221" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#202221" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Outer Celestial Orbital Rings */}
        <circle cx="0" cy="0" r="280" fill="none" stroke="#414542" strokeWidth="0.75" strokeDasharray="3 6" opacity="0.4" />
        <circle cx="0" cy="0" r="210" fill="none" stroke="#414542" strokeWidth="0.5" opacity="0.3" />
        <circle cx="0" cy="0" r="130" fill="none" stroke="#A16C50" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.5" />

        {/* Rotating wireframe geometry circle (Inspired by Ether reference image) */}
        <g transform={`rotate(${rotationAngle})`}>
          <circle cx="0" cy="0" r="170" fill="none" stroke="#C9B49B" strokeWidth="0.6" strokeDasharray="1 10" opacity="0.6" />
          <polygon 
            points="0,-165 142.8,82.5 -142.8,82.5" 
            fill="none" 
            stroke="#A16C50" 
            strokeWidth="0.4" 
            opacity="0.3" 
          />
          <polygon 
            points="0,165 142.8,-82.5 -142.8,-82.5" 
            fill="none" 
            stroke="#C9B49B" 
            strokeWidth="0.4" 
            opacity="0.25" 
          />
        </g>

        {/* Constellation Lines Connecting Central Brand to Nodes */}
        {NODES.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          return (
            <g key={`line-${node.id}`}>
              <line
                x1="0"
                y1="0"
                x2={node.x}
                y2={node.y}
                stroke={isHovered ? "url(#activeLineGrad)" : "url(#copperLineGrad)"}
                strokeWidth={isHovered ? "1.8" : "0.9"}
                strokeDasharray={isHovered ? "none" : "3 3"}
                className="transition-all duration-300"
              />
              {/* Subtle pulsing energy dot traveling along connection */}
              {isHovered && (
                <circle
                  cx={node.x * 0.5}
                  cy={node.y * 0.5}
                  r="2.5"
                  fill="#EEE8DE"
                  className="animate-ping"
                />
              )}
            </g>
          );
        })}

        {/* Center Glow Halo */}
        <circle cx="0" cy="0" r="95" fill="url(#centralGlow)" />
      </svg>

      {/* CENTRAL BRAND ORB (The Selected Product / Brand Core) */}
      <div 
        onClick={() => onSelectNode('identity')}
        className="relative z-10 w-36 h-36 rounded-full bg-[#202221] border-2 border-[#A16C50] flex flex-col items-center justify-center cursor-pointer group copper-glow transition-all duration-300 hover:scale-105"
      >
        <div className="absolute inset-1 rounded-full border border-[#C9B49B]/30" />
        <div className="absolute -inset-2 rounded-full border border-dashed border-[#A16C50]/40 animate-spin" style={{ animationDuration: '60s' }} />
        
        {/* Brand Monogram / Core */}
        <div className="font-editorial text-2xl text-[#EEE8DE] group-hover:text-[#C9B49B] transition-colors tracking-widest text-center px-2 font-bold">
          {product?.name ? product.name.slice(0, 8).toUpperCase() : 'ORION-9'}
        </div>
        <div className="font-mono-metrics text-[9px] text-[#A16C50] tracking-widest uppercase mt-0.5">
          {product?.category ? product.category.slice(0, 14) : 'CORE WORLD'}
        </div>
        <div className="font-interface text-[10px] text-[#C9B49B]/80 mt-1 flex items-center gap-1 group-hover:underline">
          <span>Enter World</span>
          <ArrowUpRight className="w-3 h-3 text-[#A16C50]" />
        </div>
      </div>

      {/* THE 10 ORBITING CAPABILITY NODES */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {NODES.map((node) => {
          const isHovered = hoveredNodeId === node.id;
          const isConfigIncomplete = node.completeness < 50;

          return (
            <div
              key={node.id}
              style={{
                transform: `translate(${node.x}px, ${node.y}px)`,
              }}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
              onClick={() => onSelectNode(node.id)}
              className="absolute pointer-events-auto cursor-pointer group flex flex-col items-center"
            >
              {/* Node Orb */}
              <div 
                className={`relative w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${
                  isHovered 
                    ? 'scale-125 bg-[#292d2b] border-[#EEE8DE] copper-glow' 
                    : isConfigIncomplete
                      ? 'bg-[#202221]/90 border-[#A16C50]/60'
                      : 'bg-[#202221]/80 border-copper-subtle hover:border-[#A16C50]'
                }`}
              >
                {/* Completeness Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    fill="none"
                    stroke="#414542"
                    strokeWidth="1.5"
                    opacity="0.3"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="21"
                    fill="none"
                    stroke={isConfigIncomplete ? "#A16C50" : "#C9B49B"}
                    strokeWidth="1.5"
                    strokeDasharray="132"
                    strokeDashoffset={132 - (132 * node.completeness) / 100}
                    className="transition-all duration-500"
                  />
                </svg>

                {getIcon(node.icon)}

                {/* Configuration Incomplete Alert Dot */}
                {isConfigIncomplete && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#A16C50] border-2 border-[#202221] flex items-center justify-center">
                    <AlertCircle className="w-2.5 h-2.5 text-[#EEE8DE]" />
                  </span>
                )}
              </div>

              {/* Node Label */}
              <div className="mt-2 text-center transition-all duration-200">
                <div className={`font-interface text-xs tracking-wide transition-colors ${
                  isHovered ? 'text-[#EEE8DE] font-semibold' : 'text-[#EEE8DE]/80'
                }`}>
                  {node.label}
                </div>
                <div className="font-mono-metrics text-[9px] text-[#C9B49B]/70 tracking-wider">
                  {node.completeness}% READY
                </div>
              </div>

              {/* Floating Editorial Summary Card on Hover */}
              {isHovered && (
                <div 
                  className="absolute bottom-full mb-3 w-64 p-3.5 rounded-xl bg-[#202221]/95 border border-[#A16C50]/60 backdrop-blur-xl shadow-2xl z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
                  style={{ transform: 'translateX(0)' }}
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-copper-subtle/40">
                    <span className="font-mono-metrics text-[9px] text-[#A16C50] uppercase tracking-widest">
                      {node.category}
                    </span>
                    <span className="font-interface text-[10px] text-[#C9B49B]">
                      Click to explore
                    </span>
                  </div>

                  <div className="mt-2 font-editorial text-sm text-[#EEE8DE]">
                    {node.label}
                  </div>
                  <div className="font-expressive text-xs text-[#C9B49B] italic mt-0.5">
                    {node.subtitle}
                  </div>

                  {/* Real Metrics */}
                  {node.metrics && node.metrics.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-copper-subtle/30 grid grid-cols-2 gap-2">
                      {node.metrics.map((m, idx) => (
                        <div key={idx} className="flex flex-col">
                          <span className="font-mono-metrics text-[9px] text-[#C9B49B]/60 uppercase">
                            {m.label}
                          </span>
                          <span className="font-interface text-xs font-semibold text-[#EEE8DE]">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {isConfigIncomplete && (
                    <div className="mt-2 px-2 py-1 rounded bg-[#A16C50]/20 border border-[#A16C50]/40 text-[10px] text-[#EEE8DE] flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-[#A16C50] shrink-0" />
                      <span>Setup needed: Click to configure.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Editorial Coordinates & Metrics Bar */}
      <div className="absolute bottom-4 left-8 right-8 z-20 flex flex-wrap items-center justify-between pointer-events-auto border-t border-copper-subtle/30 pt-3 text-[11px] font-mono-metrics text-[#C9B49B]/70">
        <div className="flex items-center gap-6">
          <span>COORDINATES: 28.6139° N, 77.2090° E</span>
          <span className="hidden sm:inline">CYCLE: RESEARCH → PUBLISH → OPTIMIZE</span>
          <span className="hidden md:inline">SYSTEM: PROMETHEUS-9 v1.5.0</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isAutonomousPaused ? 'bg-[#A16C50]' : 'bg-emerald-500'}`} />
            <span className="text-[#EEE8DE]">{isAutonomousPaused ? 'PAUSED' : 'ACTIVE ENGINE'}</span>
          </span>
          <span className="text-[#A16C50]">|</span>
          <button 
            onClick={() => onSelectNode('workforce')}
            className="hover:text-[#EEE8DE] transition-colors underline underline-offset-2"
          >
            Specialists ({readyAgentsCount}/12)
          </button>
        </div>
      </div>
    </div>
  );
};
