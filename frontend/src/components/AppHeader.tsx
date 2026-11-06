import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  X, 
  ChevronDown, 
  Bell, 
  Play, 
  Pause, 
  Sparkles,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { Product, SystemHealth } from '../types';
import { PrometheusLogo } from './PrometheusLogo';
import { useTheme } from '../context/ThemeContext';

interface AppHeaderProps {
  products: Product[];
  selectedProduct: Product | null;
  onSelectProduct: (product: Product) => void;
  onOpenAddProduct: () => void;
  onOpenOnboarding?: () => void;
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
  onOpenOnboarding,
  health,
  isPaused,
  onTogglePause,
  mobileMenuOpen,
  onToggleMobileMenu,
}) => {
  const { theme, toggleTheme, isDark } = useTheme();
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
    <header className={`sticky top-0 z-30 h-16 px-4 sm:px-6 flex items-center justify-between border-b transition-colors ${
      isDark 
        ? 'bg-[#181A18] border-[#2E332E] text-[#F5F2EB]' 
        : 'bg-[#FFFFFF] border-[#E2E1DC] text-[#262724]'
    }`}>
      {/* Left: Mobile Toggle & Brand Logo */}
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleMobileMenu}
          className={`lg:hidden p-2 rounded-lg transition-colors ${
            isDark ? 'text-[#C5BFB5] hover:bg-[#2E332E]' : 'text-[#555750] hover:bg-[#F1F1EE]'
          }`}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo */}
        <PrometheusLogo size={34} showWordmark={true} />

        {/* Onboarding Wizard Quick Button */}
        {onOpenOnboarding && (
          <button
            onClick={onOpenOnboarding}
            className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all border ${
              isDark 
                ? 'bg-[#C9B49B]/10 border-[#C9B49B]/30 text-[#C9B49B] hover:bg-[#C9B49B]/20' 
                : 'bg-[#F1EAE0] border-[#E2D5C5] text-[#514334] hover:bg-[#E9DFD2]'
            }`}
            title="Launch 8-Step Business Onboarding Wizard"
          >
            <Compass className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9B49B]' : 'text-[#997653]'}`} />
            <span className="font-medium">Onboarding Wizard</span>
          </button>
        )}

        {/* Product / Organization Selector Dropdown */}
        <div className="relative ml-4 hidden sm:block" ref={productDropdownRef}>
          <button
            onClick={() => setProductDropdownOpen(!productDropdownOpen)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
              isDark 
                ? 'bg-[#121312] border-[#2E332E] text-[#F5F2EB] hover:border-[#C9B49B]' 
                : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#262724] hover:border-[#B99A78]'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#C9B49B]' : 'bg-[#B99A78]'}`} />
            <span className="font-medium truncate max-w-[150px]">
              {selectedProduct ? selectedProduct.name : 'All Products'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          {productDropdownOpen && (
            <div className={`absolute left-0 top-full mt-1.5 w-60 rounded-xl border shadow-xl py-1.5 z-50 ${
              isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC]'
            }`}>
              <div className={`px-3 py-1 text-[10px] font-mono-metrics uppercase tracking-wider border-b mb-1 ${
                isDark ? 'border-[#2E332E] text-[#8E8A82]' : 'border-[#E2E1DC] text-[#74766F] bg-[#F3F1ED]'
              }`}>
                Active Product Portfolio
              </div>
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    onSelectProduct(p);
                    setProductDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                    isDark 
                      ? (selectedProduct?.id === p.id ? 'text-[#C9B49B] font-semibold bg-[#2E332E]/60' : 'text-[#F5F2EB] hover:bg-[#1E221E]')
                      : (selectedProduct?.id === p.id ? 'text-[#262724] font-bold bg-[#F1EAE0]' : 'text-[#262724] hover:bg-[#F8F8F6]')
                  }`}
                >
                  <span className="truncate">{p.name}</span>
                  {selectedProduct?.id === p.id && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#C9B49B]' : 'bg-[#B99A78]'}`} />
                  )}
                </button>
              ))}
              <div className={`border-t mt-1 pt-1 ${isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'}`}>
                <button
                  onClick={() => {
                    setProductDropdownOpen(false);
                    onOpenAddProduct();
                  }}
                  className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                    isDark ? 'text-[#C9B49B] hover:bg-[#1E221E]' : 'text-[#806347] hover:bg-[#F1EAE0]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#B99A78]" />
                  <span>+ Register New Product</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Theme Toggle, Actions, Status, Notifications, User Menu */}
      <div className="flex items-center gap-2.5">
        
        {/* THEME TOGGLE: Clean Light vs Luxury Dark */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
            isDark 
              ? 'bg-[#1C1E1C] border-[#C9B49B]/40 text-[#C9B49B] hover:border-[#C9B49B] hover:bg-[#252825]' 
              : 'bg-[#F1EAE0] border-[#E2D5C5] text-[#514334] hover:border-[#B99A78] hover:bg-[#E9DFD2]'
          }`}
          title={isDark ? "Switch to Clean Light Theme" : "Switch to Luxury Editorial Dark Theme"}
        >
          {isDark ? (
            <>
              <Moon className="w-3.5 h-3.5 text-[#C9B49B]" />
              <span className="hidden sm:inline font-mono-metrics text-[11px] uppercase tracking-wider">Luxury Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-[#B99A78]" />
              <span className="hidden sm:inline font-mono-metrics text-[11px] uppercase tracking-wider font-semibold">Clean Light</span>
            </>
          )}
        </button>

        {/* Quick Add Product Button */}
        <button
          onClick={onOpenAddProduct}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-all bg-[#292B29] hover:bg-[#414542] text-[#FFFFFF]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#D4C1A9]" />
          <span>New Product</span>
        </button>

        {/* System Scheduler Status Badge */}
        <button
          onClick={onTogglePause}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono-metrics transition-colors cursor-pointer border ${
            isPaused
              ? (isDark ? 'bg-rose-950/40 border-rose-500/50 text-rose-300' : 'bg-[#FCEBE8] border-[#FFCDD2] text-[#A33327]')
              : isDark
              ? 'bg-[#121312] border-[#2E332E] text-[#F5F2EB] hover:border-[#C9B49B]'
              : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#262724] hover:border-[#B99A78]'
          }`}
          title={isPaused ? "Click to resume autonomous engine" : "Click to trigger emergency pause"}
        >
          {isPaused ? (
            <Play className={`w-3.5 h-3.5 ${isDark ? 'text-rose-400' : 'text-[#A33327]'}`} />
          ) : (
            <Pause className={`w-3.5 h-3.5 ${isDark ? 'text-[#C9B49B]' : 'text-[#B99A78]'}`} />
          )}
          <span className="hidden sm:inline font-medium">
            {isPaused ? 'ENGINE PAUSED' : 'SCHEDULER NOMINAL'}
          </span>
        </button>

        {/* Notification Bell */}
        <div className="relative" ref={notifDropdownRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className={`p-2 rounded-lg border transition-colors relative ${
              isDark 
                ? 'bg-[#121312] border-[#2E332E] text-[#C5BFB5] hover:text-[#F5F2EB] hover:border-[#C9B49B]' 
                : 'bg-[#F8F8F6] border-[#E2E1DC] text-[#555750] hover:text-[#262724] hover:border-[#B99A78]'
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${
              isDark ? 'bg-[#C9B49B]' : 'bg-[#B99A78]'
            }`} />
          </button>

          {notificationsOpen && (
            <div className={`absolute right-0 top-full mt-1.5 w-80 rounded-xl border shadow-xl p-3 z-50 space-y-2 ${
              isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC]'
            }`}>
              <div className={`flex items-center justify-between pb-2 border-b ${
                isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'
              }`}>
                <span className="text-xs font-semibold">Notifications</span>
                <span className={`text-[10px] font-mono-metrics font-medium ${
                  isDark ? 'text-[#C9B49B]' : 'text-[#806347]'
                }`}>System Ready</span>
              </div>
              <div className={`text-xs p-2 rounded-lg border ${
                isDark ? 'bg-[#1C1E1C] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
              }`}>
                <div className="font-semibold">Autonomous Engine Active</div>
                <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Background task queue running in SQLite WAL mode.
                </div>
              </div>
              <div className={`text-xs p-2 rounded-lg border ${
                isDark ? 'bg-[#1C1E1C] border-[#2E332E]' : 'bg-[#F8F8F6] border-[#E2E1DC]'
              }`}>
                <div className="font-semibold">Deterministic Claims Guard</div>
                <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#8E8A82]' : 'text-[#686B65]'}`}>
                  Zero-hallucination verification active on all products.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className={`flex items-center gap-2 p-1 rounded-lg border transition-colors ${
              isDark 
                ? 'bg-[#121312] border-[#2E332E] hover:border-[#C9B49B]' 
                : 'bg-[#F8F8F6] border-[#E2E1DC] hover:border-[#B99A78]'
            }`}
          >
            <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold ${
              isDark ? 'bg-[#2E332E] text-[#C9B49B]' : 'bg-[#292B29] text-[#FFFFFF]'
            }`}>
              AP
            </div>
            <ChevronDown className="w-3.5 h-3.5 opacity-60 hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className={`absolute right-0 top-full mt-1.5 w-52 rounded-xl border shadow-xl py-1.5 z-50 ${
              isDark ? 'bg-[#161816] border-[#2E332E]' : 'bg-[#FFFFFF] border-[#E2E1DC]'
            }`}>
              <div className={`px-3 py-2 border-b ${isDark ? 'border-[#2E332E]' : 'border-[#E2E1DC]'}`}>
                <div className="text-xs font-semibold">Ayush Prakash</div>
                <div className={`text-[10px] font-mono-metrics ${isDark ? 'text-[#8E8A82]' : 'text-[#74766F]'}`}>
                  Owner (Primary Org)
                </div>
              </div>
              <div className="py-1 text-xs">
                <div className={`px-3 py-1.5 cursor-pointer ${isDark ? 'hover:bg-[#1E221E]' : 'hover:bg-[#F1F1EE]'}`}>
                  Account Settings
                </div>
                <div className={`px-3 py-1.5 cursor-pointer ${isDark ? 'hover:bg-[#1E221E]' : 'hover:bg-[#F1F1EE]'}`}>
                  Team Members
                </div>
                <div className={`px-3 py-1.5 cursor-pointer ${isDark ? 'hover:bg-[#1E221E]' : 'hover:bg-[#F1F1EE]'}`}>
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
