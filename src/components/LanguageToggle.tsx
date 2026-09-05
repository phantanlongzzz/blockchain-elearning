import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';


interface LanguageToggleProps {
  className?: string;
  showIcon?: boolean;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({
  className = '',
}) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      id="language-toggle-container"
      className={`inline-flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm transition-all shrink-0 ${className}`}
      role="group"
      aria-label="Language selection"
    >
      {/* Segmented [ EN | VI ] Toggle */}
      <div className="flex items-center font-mono text-[11px] font-medium tracking-wide select-none">
        <button
          type="button"
          id="lang-btn-en"
          onClick={() => setLanguage('en')}
          aria-pressed={language === 'en'}
          className={`px-2 py-1 rounded-md transition-colors duration-150 cursor-pointer flex items-center justify-center ${
            language === 'en'
              ? 'bg-zinc-800 text-text-primary font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
          title="Switch to English"
        >
          EN
        </button>

        <span className="text-zinc-700 font-mono text-[10px] select-none px-0.5">|</span>

        <button
          type="button"
          id="lang-btn-vi"
          onClick={() => setLanguage('vi')}
          aria-pressed={language === 'vi'}
          className={`px-2 py-1 rounded-md transition-colors duration-150 cursor-pointer flex items-center justify-center ${
            language === 'vi'
              ? 'bg-zinc-800 text-text-primary font-semibold'
              : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
          }`}
          title="Chuyển sang Tiếng Việt"
        >
          VI
        </button>
      </div>
    </div>
  );
};

