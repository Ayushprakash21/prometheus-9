import React from 'react';

interface PrometheusLogoProps {
  className?: string;
  size?: number;
  showWordmark?: boolean;
}

export const PrometheusLogo: React.FC<PrometheusLogoProps> = ({
  className = '',
  size = 32,
  showWordmark = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Monogram stylized copper 'P' */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform hover:scale-105 duration-200"
      >
        <defs>
          <linearGradient id="copperGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C9B49B" />
            <stop offset="35%" stopColor="#A16C50" />
            <stop offset="70%" stopColor="#7B4E38" />
            <stop offset="100%" stopColor="#A16C50" />
          </linearGradient>
          <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#A16C50" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Outer and Inner stylized geometric P from master brand asset */}
        {/* Upper aerodynamic wing & loop */}
        <path
          d="M 28 20 L 72 20 C 84 20 92 28 92 40 C 92 52 83 60 71 60 L 52 60 L 32 84 L 20 84 L 40 60 L 28 60 L 28 20 Z"
          fill="url(#copperGrad)"
          filter="url(#subtleGlow)"
        />
        {/* Inner geometric negative space cutout */}
        <path
          d="M 38 30 L 68 30 C 76 30 81 34 81 40 C 81 46 76 50 68 50 L 46 50 L 38 30 Z"
          fill="#202221"
        />
        {/* Inner accent blade */}
        <path
          d="M 30 38 L 48 38 L 41 50 L 30 50 Z"
          fill="url(#copperGrad)"
          opacity="0.9"
        />
      </svg>

      {showWordmark && (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-base sm:text-lg font-bold tracking-widest text-[#EEE8DE] uppercase">
              PROMETHEUS<span className="text-[#A16C50]">-9</span>
            </span>
            <span className="text-[10px] font-mono-metrics px-1.5 py-0.5 rounded bg-[#A16C50]/20 text-[#C9B49B] border border-[#A16C50]/30 tracking-tight">
              OS
            </span>
          </div>
          <span className="text-[10px] text-[#B8B0A5] tracking-wider uppercase font-sans">
            Autonomous Marketing OS
          </span>
        </div>
      )}
    </div>
  );
};
