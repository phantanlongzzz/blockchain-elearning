import React, { useState } from 'react';
import { School } from 'lucide-react';
import dluLogo from '../assets/dlu-logo.png';

interface UniversityLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const UniversityLogo: React.FC<UniversityLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  const containerPadding = {
    sm: 'p-1.5',
    md: 'p-2.5',
    lg: 'p-3.5',
  };

  return (
    <div
      id="university-logo-container"
      className={`inline-flex flex-col items-center justify-center ${className}`}
    >
      <div
        className={`relative ${sizeClasses[size]} ${containerPadding[size]} rounded-xl bg-slate-900/90 border border-slate-700/50 flex items-center justify-center overflow-hidden transition-all duration-300`}
      >
        {!imageError ? (
          <img
            id="university-logo-image"
            src={dluLogo}
            alt="Dalat University"
            style={{ height: '100%', width: 'auto', objectFit: 'contain', filter: 'none', mixBlendMode: 'normal', opacity: 1 }}
            onError={() => setImageError(true)}
            className="w-auto h-full max-h-full object-contain relative z-10 university-logo-img"
          />
        ) : (
          <div
            id="university-logo-fallback"
            className="w-full h-full flex flex-col items-center justify-center text-center relative z-10 px-1"
          >
            <School className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-[8px] sm:text-[9px] font-mono tracking-wider text-slate-300 font-semibold leading-tight uppercase">
              ĐẠI HỌC ĐÀ LẠT
            </span>
          </div>
        )}
      </div>

      {showSubtitle && (
        <div className="mt-2 text-center">
          <p className="text-[10px] font-mono text-emerald-400/90 uppercase tracking-widest font-semibold">
            Academic Research
          </p>
          <p className="text-xs text-slate-400 font-medium">Faculty of IT</p>
        </div>
      )}
    </div>
  );
};
