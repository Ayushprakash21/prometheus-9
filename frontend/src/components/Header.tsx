import React from "react";
import { Product, SystemHealth } from "../types";
import { ShieldAlert, PauseCircle, PlayCircle, Cpu, HardDrive } from "lucide-react";

interface HeaderProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (p: Product | null) => void;
  health: SystemHealth | null;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  health,
  isPaused,
  onTogglePause
}) => {
  return (
    <header className="h-16 border-b border-[#414542]/60 bg-[#202221] px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Brand & Monogram */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <img
            src="/branding/p9-monogram-logo.jpg"
            alt="PROMETHEUS-9 Monogram"
            className="w-9 h-9 object-contain rounded border border-[#A16C50]/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-base text-[#EEE8DE] font-['Manrope']">
                PROMETHEUS-9
              </span>
              <span className="text-[10px] tracking-widest uppercase px-1.5 py-0.5 rounded bg-[#A16C50]/20 text-[#C9B49B] border border-[#A16C50]/40 font-mono-metrics">
                Charcoal & Copper
              </span>
            </div>
            <div className="text-[11px] text-[#C9B49B]/70 tracking-tight hidden lg:block">
              Autonomous Marketing & Creative Production Operating System
            </div>
          </div>
        </div>
      </div>

      {/* Product Selector */}
      <div className="flex items-center gap-3">
        <label className="text-xs text-[#C9B49B] font-medium hidden sm:inline">Active Product:</label>
        <select
          value={selectedProduct?.id || "all"}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "all") onSelectProduct(null);
            else {
              const found = products.find((p) => p.id === val);
              onSelectProduct(found || null);
            }
          }}
          className="bg-[#202221] text-[#EEE8DE] border border-[#414542] rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#A16C50] transition-colors"
        >
          <option value="all">Enterprise Portfolio (All Products)</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p.category})
            </option>
          ))}
        </select>
      </div>

      {/* Telemetry & Emergency Kill Switch */}
      <div className="flex items-center gap-4">
        {/* System telemetry pill */}
        <div className="hidden md:flex items-center gap-3 text-xs bg-[#414542]/20 border border-[#414542]/40 rounded-full px-3 py-1 text-[#C9B49B]">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${health?.status === "healthy" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="font-mono-metrics">{health?.status || "Connecting..."}</span>
          </span>
          <span className="text-[#414542]">|</span>
          <span className="flex items-center gap-1 font-mono-metrics text-[11px]">
            <Cpu className="w-3 h-3 text-[#A16C50]" />
            {health?.system_metrics ? `${Math.round(health.system_metrics.cpu_usage_percent)}% CPU` : "--"}
          </span>
          <span className="text-[#414542]">|</span>
          <span className="flex items-center gap-1 font-mono-metrics text-[11px]">
            <HardDrive className="w-3 h-3 text-[#C9B49B]" />
            {health?.system_metrics ? `${Math.round(health.system_metrics.ram_usage_percent)}% RAM` : "--"}
          </span>
        </div>

        {/* Emergency Kill Switch */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all ${
            isPaused
              ? "bg-[#A16C50] text-[#EEE8DE] hover:bg-[#B87C5E] shadow-sm shadow-[#A16C50]/40"
              : "bg-[#414542]/50 text-[#EEE8DE] hover:bg-rose-950/80 hover:text-rose-200 border border-[#414542]"
          }`}
          title={isPaused ? "Resume autonomous operations" : "Emergency Pause: Halt all autonomous publishing and agent runs"}
        >
          {isPaused ? (
            <>
              <PlayCircle className="w-4 h-4 text-emerald-400" />
              <span>Resume Engine</span>
            </>
          ) : (
            <>
              <PauseCircle className="w-4 h-4 text-[#C9B49B]" />
              <span>Pause Autonomy</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
