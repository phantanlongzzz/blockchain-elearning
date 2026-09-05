import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
  showIcon = false,
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      id="language-toggle-container"
      className={`inline-flex items-center p-1 bg-white/[0.03] border border-white/[0.06] rounded-lg gap-1 font-mono text-xs select-none ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {showIcon && <Languages className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />}
      <button
        type="button"
        id="lang-btn-en"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
          language === 'en'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
        title="Switch to English"
      >
        EN
      </button>
      <button
        type="button"
        id="lang-btn-vi"
        onClick={() => setLanguage('vi')}
        aria-pressed={language === 'vi'}
        className={`px-2.5 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
          language === 'vi'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm'
            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
        }`}
        title="Chuyển sang Tiếng Việt"
      >
        VI
      </button>
    </div>
  );
};

