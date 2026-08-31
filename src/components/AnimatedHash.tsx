import React, { useState, useEffect, useRef } from 'react';

interface AnimatedHashProps {
  hash: string;
  className?: string;
  isCalculating?: boolean;
}

export const AnimatedHash: React.FC<AnimatedHashProps> = ({ hash, className = '', isCalculating = false }) => {
  const [displayHash, setDisplayHash] = useState(hash);
  const animationRef = useRef<number>();
  const lastHashRef = useRef(hash);
  
  useEffect(() => {
    // If not calculating and hash hasn't changed, just display it
    if (!isCalculating && hash === lastHashRef.current) {
      setDisplayHash(hash);
      return;
    }
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setDisplayHash(hash);
      lastHashRef.current = hash;
      return;
    }

    if (isCalculating || hash !== lastHashRef.current) {
      const chars = '0123456789abcdef';
      let frame = 0;
      const maxFrames = 15; // roughly 250ms at 60fps
      
      const animate = () => {
        if (frame < maxFrames) {
          // Generate a random hex string of the same length
          let randomHash = '';
          const targetLength = hash.length || 64;
          for (let i = 0; i < targetLength; i++) {
            randomHash += chars[Math.floor(Math.random() * chars.length)];
          }
          setDisplayHash(randomHash);
          frame++;
          animationRef.current = requestAnimationFrame(animate);
        } else {
          setDisplayHash(hash);
          lastHashRef.current = hash;
        }
      };
      
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hash, isCalculating]);

  return (
    <span className={`transition-opacity duration-150 ${isCalculating ? 'opacity-70' : 'opacity-100'} ${className}`}>
      {displayHash}
    </span>
  );
};
