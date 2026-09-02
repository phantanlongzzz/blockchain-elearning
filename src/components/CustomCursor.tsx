import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor
 * 
 * Authentic, classic desktop OS mouse pointer silhouette:
 * - Asymmetric polygon geometry with sharp top-left tip and inward notch undercut
 * - Interior: near-black (#090a0f)
 * - Outer stroke: vivid neon pink-red (#ff2d55)
 * - Subtle controlled drop-shadow glow (drop-shadow(0 0 4px rgba(255, 45, 85, 0.45)))
 * - Hotspot aligned precisely at the tip coordinate
 * - High-performance requestAnimationFrame tracking (zero-latency translate3d)
 * - Subtle scale(1.15) on clickable element hover
 * - Automatically disabled on touch & coarse pointer devices
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Position references for 60/120fps smooth direct tracking
  const mousePos = useRef({ x: -100, y: -100 });
  const currentPos = useRef({ x: -100, y: -100 });
  const rafId = useRef<number | null>(null);

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

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Detect interactive elements for hover feedback
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest(
            'button, a, input, select, textarea, [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], label, summary, [data-interactive="true"], .btn-primary, .lab-card, .cursor-pointer'
          )
        );
        setIsHovered(isClickable);
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Render loop using requestAnimationFrame
    const render = () => {
      if (cursorRef.current) {
        currentPos.current.x = mousePos.current.x;
        currentPos.current.y = mousePos.current.y;

        cursorRef.current.style.transform = `translate3d(${currentPos.current.x}px, ${currentPos.current.y}px, 0)`;
      }
      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isEnabled, isVisible]);

  if (!isEnabled) return null;

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className="custom-cursor-wrapper fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform select-none"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.15s ease',
      }}
    >
      <div
        className="origin-top-left transition-transform duration-100 ease-out"
        style={{
          transform: `scale(${isPressed ? 0.92 : isHovered ? 1.15 : 1}) translate(-2px, -2px)`,
        }}
      >
        <svg
          className="custom-cursor-svg overflow-visible"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255, 45, 85, 0.45))',
          }}
        >
          {/* Classic Asymmetrical Desktop Pointer Polygon */}
          <path
            d="M2 2L9.5 21.5L13.2 13.8L21 11.2L2 2Z"
            fill="#090a0f"
            stroke="#ff2d55"
            strokeWidth="1.75"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

