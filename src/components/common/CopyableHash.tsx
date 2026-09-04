import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { formatHash } from '../../utils/formatters';

interface CopyableHashProps {
  hash: string;
  className?: string;
  truncateMobileOnly?: boolean;
  prefixLength?: number;
  suffixLength?: number;
  highlightPrefix?: string;
  isValid?: boolean | null;
  statusLabel?: string;
  showCopyButton?: boolean;
  label?: string;
}

export const CopyableHash: React.FC<CopyableHashProps> = ({
  hash,
  className = '',
  truncateMobileOnly = false,
  prefixLength,
  suffixLength,
  highlightPrefix,
  isValid = null,
  statusLabel,
  showCopyButton = true,
  label,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hash) return;
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedDesktop = formatHash(hash, false, prefixLength, suffixLength);
  const formattedMobile = formatHash(hash, true, prefixLength, suffixLength);

  const statusBorderClass =
    isValid === true
      ? 'border-success/40 bg-success/10 text-success'
      : isValid === false
      ? 'border-rose-500/40 bg-rose-950/20 text-rose-300'
      : 'border-border-primary bg-slate-900/80 text-slate-300';

  return (
    <div
      className={`group relative inline-flex items-center gap-1.5 max-w-full font-mono text-xs px-2.5 py-1 rounded-[var(--radius-sm)] border ${statusBorderClass} transition-colors ${className}`}
      title={hash}
    >
      {label && (
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-slate-400 mr-1 select-none">
          {label}:
        </span>
      )}

      {/* Responsive hash text display */}
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setExpanded(!expanded);
        }}
        className={`text-left select-all cursor-pointer font-mono tracking-wider transition-all ${expanded ? 'break-all' : 'truncate'}`}
        title="Click to expand/collapse full value"
      >
        {expanded ? (
          hash
        ) : truncateMobileOnly ? (
          <>
            <span className="hidden sm:inline break-all">{hash}</span>
            <span className="sm:hidden">{formattedMobile}</span>
          </>
        ) : (
          <>
            <span className="hidden md:inline">{formattedDesktop}</span>
            <span className="md:hidden">{formattedMobile}</span>
          </>
        )}
      </button>

      {/* Status text + icon if provided */}
      {statusLabel && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-[var(--radius-xs)] font-sans font-bold flex items-center gap-0.5 select-none ${
            isValid === true
              ? 'bg-success/20 text-success border border-success/30'
              : isValid === false
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'bg-slate-800 text-slate-400'
          }`}
        >
          {isValid === true && <span>✓</span>}
          {isValid === false && <span>✕</span>}
          <span>{statusLabel}</span>
        </span>
      )}

      {/* Copy Button */}
      {showCopyButton && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={copied ? 'Đã sao chép mã băm' : `Sao chép mã băm: ${hash}`}
          className="p-1 rounded-[var(--radius-xs)] hover:bg-slate-800 text-slate-400 hover:text-emerald-400 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none transition-colors cursor-pointer shrink-0"
          title="Sao chép mã băm (Copy hash)"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-success animate-in zoom-in-50" />
          ) : (
            <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100" />
          )}
        </button>
      )}
    </div>
  );
};
