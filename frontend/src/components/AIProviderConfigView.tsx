import React, { useState } from 'react';
import { 
  Server, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Cpu, 
  Check, 
  Clock,
  Sparkles
} from 'lucide-react';
import { AIProviderConfig } from '../types';

export const AIProviderConfigView: React.FC = () => {
  const [testingId, setTestingId] = useState<string | null>(null);

  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'prov-gemini',
      provider_name: 'gemini',
      model_id: 'gemini-1.5-pro',
      is_enabled: true,
      is_default: true,
      status: 'connected',
      latency_ms: 320,
      masked_key: 'AIzaSy********************kX9Q',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prov-gemini-flash',
      provider_name: 'gemini',
      model_id: 'gemini-1.5-flash',
      is_enabled: true,
      is_default: false,
      status: 'connected',
      latency_ms: 145,
      masked_key: 'AIzaSy********************kX9Q',
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prov-openai',
      provider_name: 'openai',
      model_id: 'gpt-4o',
      is_enabled: true,
      is_default: false,
      status: 'connected',
      latency_ms: 410,
      masked_key: 'sk-proj-********************aA91',
      updated_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
    {
      id: 'prov-anthropic',
      provider_name: 'anthropic',
      model_id: 'claude-3-5-sonnet',
      is_enabled: true,
      is_default: false,
      status: 'connected',
      latency_ms: 480,
      masked_key: 'sk-ant-********************zz12',
      updated_at: new Date(Date.now() - 3600000 * 72).toISOString(),
    },
    {
      id: 'prov-ollama',
      provider_name: 'local_ollama',
      model_id: 'llama-3.3-70b-instruct',
      is_enabled: false,
      is_default: false,
      status: 'untested',
      latency_ms: undefined,
      masked_key: 'http://localhost:11434',
      updated_at: new Date(Date.now() - 3600000 * 120).toISOString(),
    },
  ]);

  const handleTestConnection = (id: string) => {
    setTestingId(id);
    setTimeout(() => {
      setProviders(prev => prev.map(p => {
        if (p.id === id) {
          return {
            ...p,
            status: 'connected',
            latency_ms: Math.floor(Math.random() * 200) + 120,
          };
        }
        return p;
      }));
      setTestingId(null);
    }, 1100);
  };

  const handleSetDefault = (id: string) => {
    setProviders(prev => prev.map(p => ({
      ...p,
      is_default: p.id === id,
    })));
  };

  const handleToggleEnabled = (id: string) => {
    setProviders(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, is_enabled: !p.is_enabled };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#414542] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
              Foundation Model Gateway
            </span>
            <span className="text-xs text-[#B8B0A5]">•</span>
            <span className="text-xs font-mono-metrics text-emerald-400">Encrypted AES-256 Vault</span>
          </div>
          <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[#EEE8DE] tracking-tight">
            AI Provider & Model Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[#B8B0A5] mt-1 max-w-2xl">
            Configure primary reasoning engines and multi-tiered fallback models. PROMETHEUS-9 autonomously routes tasks to the most cost-effective, high-throughput model based on complexity.
          </p>
        </div>
      </div>

      {/* Model Routing Architecture Blueprint */}
      <div className="p-4 rounded-xl bg-[#292C29] border border-[#414542] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
            Tier 1: Heavy Synthesis & Strategy
          </span>
          <div className="text-sm font-bold text-[#EEE8DE]">Gemini 1.5 Pro / Claude 3.5</div>
          <p className="text-[11px] text-[#B8B0A5]">Deep market research, positioning theses, and complex compliance analysis.</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
            Tier 2: High-Velocity Creative
          </span>
          <div className="text-sm font-bold text-[#EEE8DE]">Gemini 1.5 Flash</div>
          <p className="text-[11px] text-[#B8B0A5]">Sub-150ms latency for content variants, hooks, captions, and hashtag clusters.</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono-metrics uppercase tracking-wider text-[#C9B49B]">
            Tier 3: Local / Sovereign Fallback
          </span>
          <div className="text-sm font-bold text-[#EEE8DE]">Ollama Llama-3.3</div>
          <p className="text-[11px] text-[#B8B0A5]">Zero-outbound execution for highly confidential internal proprietary drafts.</p>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        {providers.map((p) => {
          const isTesting = testingId === p.id;

          return (
            <div
              key={p.id}
              className={`p-4 rounded-xl border transition-all ${
                p.is_default
                  ? 'bg-[#303430] border-[#A16C50] shadow-sm'
                  : 'bg-[#292C29] border-[#414542]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#202221] border border-[#414542] text-[#A16C50]">
                    <Server className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#EEE8DE]">{p.model_id}</span>
                      <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#202221] text-[#C9B49B] border border-[#414542]">
                        {p.provider_name.replace('_', ' ')}
                      </span>
                      {p.is_default && (
                        <span className="text-[10px] font-mono-metrics uppercase px-2 py-0.5 rounded bg-[#A16C50]/20 text-[#EEE8DE] border border-[#A16C50]/40 font-bold">
                          DEFAULT PRIMARY
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#B8B0A5] mt-1 font-mono-metrics">
                      <span className="flex items-center gap-1">
                        <Key className="w-3 h-3 text-[#A16C50]" />
                        {p.masked_key}
                      </span>
                      {p.latency_ms && (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {p.latency_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleTestConnection(p.id)}
                    disabled={isTesting}
                    className="px-3 py-1.5 rounded-lg bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-xs font-medium text-[#EEE8DE] flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 text-[#A16C50] ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Testing...' : 'Test Latency'}</span>
                  </button>

                  {!p.is_default && (
                    <button
                      onClick={() => handleSetDefault(p.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#303430] hover:bg-[#414542] text-xs font-medium text-[#C9B49B] transition-colors cursor-pointer"
                    >
                      Set as Default
                    </button>
                  )}

                  <button
                    onClick={() => handleToggleEnabled(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer border ${
                      p.is_enabled
                        ? 'bg-emerald-950/20 text-emerald-400 border-emerald-800/40 hover:bg-emerald-950/40'
                        : 'bg-[#202221] text-[#B8B0A5] border-[#414542] hover:text-[#EEE8DE]'
                    }`}
                  >
                    {p.is_enabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
