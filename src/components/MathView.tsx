import React, { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  math: string;
  className?: string;
  block?: boolean;
}

export const MathView: React.FC<MathProps> = ({ math, className = '', block = false }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: block,
        throwOnError: false,
      });
    } catch (e) {
      return math;
    }
  }, [math, block]);

  if (block) {
    return (
      <div
        className={`math-formula-container my-2 overflow-x-auto overflow-y-hidden py-1 text-text-primary whitespace-nowrap max-w-full ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <span
      className={`math-formula inline-block text-text-primary whitespace-nowrap overflow-x-auto overflow-y-hidden align-middle max-w-full ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

export const InlineMath: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => (
  <MathView math={math} className={className} block={false} />
);

export const BlockMath: React.FC<{ math: string; className?: string }> = ({ math, className = '' }) => (
  <MathView math={math} className={className} block={true} />
);
