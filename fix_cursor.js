import fs from 'fs';

const file = 'src/components/CustomCursor.tsx';
const content = `import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor — Uses the static /cursor.webp image
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Direct ref tracking to prevent state churn on mousemove
  const isVisibleRef = useRef(false);

  useEffect(() => {
    // Only enable on devices with fine pointer (mouse/trackpad), not touch/coarse screens
    const finePointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');
    
    const updateCapability = () => {
      const hasFinePointer =
        finePointerQuery.matches &&
        !('ontouchstart' in window && navigator.maxTouchPoints > 1);
      setIsEnabled(hasFinePointer);
    };

    updateCapability();

    if (finePointerQuery.addEventListener) {
      finePointerQuery.addEventListener('change', updateCapability);
    } else {
      finePointerQuery.addListener(updateCapability);
    }

    return () => {
      if (finePointerQuery.removeEventListener) {
        finePointerQuery.removeEventListener('change', updateCapability);
      } else {
        finePointerQuery.removeListener(updateCapability);
      }
    };
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      document.documentElement.classList.remove('custom-cursor-active');
      return;
    }

    document.documentElement.classList.add('custom-cursor-active');

    let scheduledAnimationFrame = false;
    let latestX = -100;
    let latestY = -100;

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = \`translate3d(\${latestX}px, \${latestY}px, 0)\`;
      }
      scheduledAnimationFrame = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      if (!scheduledAnimationFrame) {
        scheduledAnimationFrame = true;
        requestAnimationFrame(updatePosition);
      }
    };

    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isEnabled]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor-wrapper fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform select-none"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.12s ease-out',
      }}
    >
      <img 
        src="/cursor.webp" 
        alt=""
        style={{
          display: 'block',
          transform: 'translate(-2px, -2px)' // slight offset if arrow tip has anti-aliasing padding, usually -2 is perfect
        }}
      />
    </div>
  );
};
`;

fs.writeFileSync(file, content);
