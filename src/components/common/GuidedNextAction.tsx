/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowRight, Check, Lock, Loader2 } from 'lucide-react';
import { StepState } from '../../guidance/types';
import { useLanguage } from '../../i18n/LanguageContext';

export interface GuidedNextActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  stepState?: StepState;
  isNextTarget?: boolean;
  labelVi?: string;
  labelEn?: string;
  sublabelVi?: string;
  sublabelEn?: string;
  badgeVi?: string;
  badgeEn?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'amber' | 'ghost';
  fullWidth?: boolean;
}

export const GuidedNextAction: React.FC<GuidedNextActionProps> = ({
  stepState = 'AVAILABLE',
  isNextTarget = false,
  labelVi,
  labelEn,
  sublabelVi,
  sublabelEn,
  badgeVi,
  badgeEn,
  icon,
  variant = 'primary',
  fullWidth = false,
  children,
  className = '',
  disabled = false,
  onClick,
  ...rest
}) => {
  const { language, strings } = useLanguage();
  const isVi = language === 'vi';

  const isReady = isNextTarget || stepState === 'NEXT_STEP_READY';
  const isLocked = stepState === 'LOCKED' || disabled;
  const isInProgress = stepState === 'IN_PROGRESS';
  const isCompleted = stepState === 'COMPLETED';

  // Base styling variants
  let variantStyles = 'bg-[#111111] hover:bg-[#181818] text-slate-200 border-zinc-800';

  if (variant === 'primary') {
    variantStyles = 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold border-transparent shadow-sm';
  } else if (variant === 'amber') {
    variantStyles = 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold border-transparent shadow-sm';
  } else if (variant === 'secondary') {
    variantStyles = 'bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border-zinc-700';
  } else if (variant === 'ghost') {
    variantStyles = 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 border-transparent';
  }

  // Next-ready pulse modifier
  let guidanceModifier = '';
  if (isReady && !isLocked) {
    guidanceModifier = 'guidance-amber-pulse ring-2 ring-amber-400/80 !border-amber-400/90 text-zinc-100 shadow-[0_0_18px_rgba(245,158,11,0.25)]';
    if (variant === 'primary' || variant === 'amber') {
      guidanceModifier += ' !bg-amber-500 hover:!bg-amber-400 !text-zinc-950 font-bold';
    }
  }

  const label = isVi ? labelVi : labelEn;
  const sublabel = isVi ? sublabelVi : sublabelEn;
  const badge = isVi ? badgeVi : badgeEn;

  return (
    <button
      type="button"
      disabled={isLocked}
      onClick={onClick}
      aria-live={isReady ? 'polite' : undefined}
      className={`relative inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:active:scale-100 cursor-pointer ${
        fullWidth ? 'w-full' : ''
      } ${variantStyles} ${guidanceModifier} ${className}`}
      {...rest}
    >
      {/* Subtle indicator badge when NEXT_STEP_READY */}
      {isReady && !isLocked && (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-amber-200 text-[10px] font-mono font-semibold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping" />
          <span>{badge || (isVi ? 'Tiếp' : 'Next')}</span>
        </span>
      )}

      {isInProgress && <Loader2 className="w-4 h-4 animate-spin text-current" />}
      {isLocked && !isInProgress && <Lock className="w-3.5 h-3.5 opacity-60" />}
      {isCompleted && <Check className="w-4 h-4 text-success" />}

      {icon && !isInProgress && !isLocked && !isCompleted && icon}

      {/* Button Content */}
      {children ? (
        children
      ) : (
        <div className="flex flex-col items-start text-left">
          {sublabel && (
            <span className="text-[10px] opacity-75 font-mono uppercase tracking-wider">
              {sublabel}
            </span>
          )}
          {label && <span className="truncate">{label}</span>}
        </div>
      )}

      {/* Trailing arrow if pointing next */}
      {(isReady || variant === 'primary' || variant === 'amber') && !isInProgress && !isCompleted && (
        <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
      )}
    </button>
  );
};
