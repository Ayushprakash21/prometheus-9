import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface PrometheusLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const PrometheusLogo: React.FC<PrometheusLogoProps> = ({
  className = '',
  size = 36,
  showWordmark = false,
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Official P9 Monogram Logo Asset */}
      <img
        src="/branding/p9-monogram-logo.png"
        alt="PROMETHEUS-9 Monogram"
        style={{ width: size, height: 'auto', maxHeight: size * 1.15 }}
        className="shrink-0 object-contain transition-transform hover:scale-105 duration-200"
      />

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className={`font-editorial text-base sm:text-lg font-bold tracking-widest uppercase ${
              isDark ? 'text-[#EEE8DE]' : 'text-[#292B29]'
            }`}>
              PROMETHEUS<span className="text-[#A16C50]">-9</span>
            </span>
            <span className={`text-[10px] font-mono-metrics px-1.5 py-0.5 rounded border tracking-tight font-semibold ${
              isDark 
                ? 'bg-[#A16C50]/20 text-[#C9B49B] border-[#A16C50]/30' 
                : 'bg-[#F1EAE0] text-[#806347] border-[#E2D5C5]'
            }`}>
              OS
            </span>
          </div>
          <span className={`text-[10px] tracking-wider uppercase font-sans font-medium ${
            isDark ? 'text-[#8E8A82]' : 'text-[#70726B]'
          }`}>
            Autonomous Marketing OS
          </span>
        </div>
      )}
    </div>
  );
};
