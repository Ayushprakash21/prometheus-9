import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Bell, 
  Play, 
  Pause, 
  User, 
  Shield, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { Product, SystemHealth } from '../types';

interface AppHeaderProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onOpenAddProduct: () => void;
  health: SystemHealth | null;
  isPaused: boolean;
  onTogglePause: () => void;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  products,
  selectedProduct,
  onSelectProduct,
  onOpenAddProduct,
  health,
  isPaused,
  onTogglePause,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const productDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productDropdownRef.current && !productDropdownRef.current.contains(e.target as Node)) {
        setProductDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (notifDropdownRef.current && !notifDropdownRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#292C29] border-b border-[#414542] px-4 sm:px-6 flex items-center justify-between">
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-[#B8B0A5] hover:text-[#EEE8DE] hover:bg-[#303430] transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#202221] border border-[#A16C50] flex items-center justify-center">
            <span className="font-editorial text-sm font-bold text-[#EEE8DE]">P</span>
          </div>
          <div>
            <div className="font-bold text-sm tracking-wide text-[#EEE8DE] flex items-center gap-2">
              <span>PROMETHEUS-9</span>
              <span className="text-[10px] font-mono-metrics px-1.5 py-0.5 rounded bg-[#A16C50]/20 text-[#C9B49B] border border-[#A16C50]/30">
                OS
              </span>
            </div>
            <div className="text-[10px] text-[#B8B0A5] leading-none">
              Autonomous Growth Platform
            </div>
          </div>
        </div>

        {/* Product / Organization Selector Dropdown */}
        <div className="relative ml-4 hidden sm:block" ref={productDropdownRef}>
          <button
            onClick={() => setProductDropdownOpen(!productDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-xs text-[#EEE8DE] transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-[#A16C50]" />
            <span className="font-medium truncate max-w-[150px]">
              {selectedProduct ? selectedProduct.name : 'All Products'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#B8B0A5]" />
          </button>

          {productDropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-[#202221] border border-[#414542] shadow-xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] font-mono-metrics text-[#B8B0A5] uppercase tracking-wider border-b border-[#414542] mb-1">
                Active Product Portfolio
              </div>
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setProductDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#303430] transition-colors ${
                    selectedProduct?.id === p.id ? 'text-[#A16C50] font-semibold bg-[#303430]/50' : 'text-[#EEE8DE]'
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {selectedProduct?.id === p.id && <span className="w-1.5 h-1.5 rounded-full bg-[#A16C50]" />}
                </button>
              ))}
              <div className="border-t border-[#414542] mt-1 pt-1">
                <button
                  onClick={() => {
                    setProductDropdownOpen(false);
                    onOpenAddProduct();
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-[#C9B49B] hover:text-[#EEE8DE] hover:bg-[#303430] transition-colors flex items-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#A16C50]" />
                  <span>+ Register New Product</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions, Notifications, System Status, User Menu */}
      <div className="flex items-center gap-3">
        {/* Quick Add Product Button */}
        <button
          onClick={onOpenAddProduct}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A16C50] hover:bg-[#B87C5E] text-xs font-medium text-[#EEE8DE] transition-colors cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>

        {/* System Scheduler Status Badge & Emergency Killswitch */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-metrics transition-colors cursor-pointer border ${
            isPaused
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              : 'bg-[#202221] border-[#414542] text-[#EEE8DE] hover:border-[#A16C50]'
          }`}
          title={isPaused ? "Click to resume autonomous engine" : "Click to trigger emergency pause"}
        >
          {isPaused ? <Play className="w-3.5 h-3.5 text-rose-400" /> : <Pause className="w-3.5 h-3.5 text-[#A16C50]" />}
          <span className="hidden sm:inline">{isPaused ? 'ENGINE PAUSED' : 'SCHEDULER NOMINAL'}</span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg bg-[#202221] border border-[#414542] hover:border-[#A16C50] text-[#B8B0A5] hover:text-[#EEE8DE] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#A16C50]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-80 rounded-xl bg-[#202221] border border-[#414542] shadow-xl p-3 z-50 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-[#414542]">
                <span className="text-xs font-semibold text-[#EEE8DE]">Notifications</span>
                <span className="text-[10px] font-mono-metrics text-[#C9B49B]">System Ready</span>
              </div>
              <div className="text-xs text-[#B8B0A5] p-2 rounded-lg bg-[#292C29]">
                <div className="font-medium text-[#EEE8DE]">Autonomous Engine Active</div>
                <div className="text-[11px] mt-0.5">Background task queue running in SQLite WAL mode.</div>
              </div>
              <div className="text-xs text-[#B8B0A5] p-2 rounded-lg bg-[#292C29]">
                <div className="font-medium text-[#EEE8DE]">Deterministic Claims Guard</div>
                <div className="text-[11px] mt-0.5">Zero-hallucination verification active on all products.</div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-[#202221] border border-[#414542] hover:border-[#A16C50] transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-[#303430] flex items-center justify-center text-xs font-bold text-[#EEE8DE]">
              AP
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#B8B0A5] hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-[#202221] border border-[#414542] shadow-xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-[#414542]">
                <div className="text-xs font-semibold text-[#EEE8DE]">Ayush Prakash</div>
                <div className="text-[10px] font-mono-metrics text-[#B8B0A5]">Owner (Primary Org)</div>
              </div>
              <div className="py-1">
                <div className="px-3 py-1.5 text-xs text-[#B8B0A5] hover:bg-[#303430] hover:text-[#EEE8DE] cursor-pointer">
                  Account Settings
                </div>
                <div className="px-3 py-1.5 text-xs text-[#B8B0A5] hover:bg-[#303430] hover:text-[#EEE8DE] cursor-pointer">
                  Team Members
                </div>
                <div className="px-3 py-1.5 text-xs text-[#B8B0A5] hover:bg-[#303430] hover:text-[#EEE8DE] cursor-pointer">
                  API & Token Vault
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
