import React, { useState, useEffect, useRef } from 'react';

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({ value, duration = 400, className = '' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);
  const animationRef = useRef<number>();
  const lastValueRef = useRef(value);

  useEffect(() => {
    if (value === lastValueRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayValue(value);
      displayValueRef.current = value;
      lastValueRef.current = value;
      return;
    }

    const startValue = displayValueRef.current;
    const endValue = value;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // ease-out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentValue = Math.round(startValue + (endValue - startValue) * easeProgress);
      displayValueRef.current = currentValue;
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        displayValueRef.current = endValue;
        setDisplayValue(endValue);
        lastValueRef.current = endValue;
      }
    };

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
};
