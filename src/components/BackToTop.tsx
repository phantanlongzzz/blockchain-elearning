import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const BackToTop: React.FC = () => {
  const { strings } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down more than 350px
      setIsVisible(window.scrollY > 350);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!isVisible) return null;

  return (
    <button
      type="button"
      id="floating-back-to-top-btn"
      onClick={scrollToTop}
      className="fixed bottom-6 left-6 z-40 p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-text-muted hover:text-text-primary border border-border-primary hover:border-border-primary/80 shadow-xl shadow-black/80 backdrop-blur-md transition-all duration-200 hover:scale-105 active:scale-95 group cursor-pointer animate-in fade-in zoom-in-90"
      title={strings.footer.backToTop || 'Back to top'}
      aria-label={strings.footer.backToTop || 'Back to top'}
    >
      <ArrowUp className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
    </button>
  );
};
