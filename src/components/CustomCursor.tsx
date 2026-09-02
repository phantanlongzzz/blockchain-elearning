import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor — Performance-Optimized Flat Precision Pointer
 * 
 * Performance & Design Specifications:
 * - Clean flat vector design (Sharp arrow silhouette, zero blur, zero drop-shadow, zero glow)
 * - Contrast-driven visibility: Dark interior (#090A0F) with crisp Pink/Red stroke (#ff2d55 / #ff4d6d)
 * - Zero React re-renders during mouse movement (state updates only on hover transition)
 * - Direct GPU-accelerated transform: translate3d(x, y, 0) via requestAnimationFrame
 * - Complete removal of box-shadow, filter: blur(), and heavy paint triggers
 * - Disabled automatically on coarse/touch pointer devices
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Direct ref tracking to prevent state churn on mousemove
  const mousePos = useRef({ x: -100, y: -100 });
  const isHoveredRef = useRef(false);
  const isVisibleRef = useRef(false);
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
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      if (!isVisibleRef.current) {
        isVisibleRef.current = true;
        setIsVisible(true);
      }

      // Check hover target without triggering React state re-render unless value changes
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = Boolean(
          target.closest(
            'button, a, input, select, textarea, [role="button"], [role="tab"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], label, summary, [data-interactive="true"], .btn-primary, .lab-card, .cursor-pointer'
          )
        );
        if (isHoveredRef.current !== isClickable) {
          isHoveredRef.current = isClickable;
          setIsHovered(isClickable);
        }
      }
    };

    const handleMouseDown = () => setIsPressed(true);
    const handleMouseUp = () => setIsPressed(false);
    const handleMouseLeave = () => {
      isVisibleRef.current = false;
      setIsVisible(false);
    };
    const handleMouseEnter = () => {
      isVisibleRef.current = true;
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // High-performance direct translate3d loop
    const render = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
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
      <div
        className="origin-top-left transition-transform duration-75 ease-out"
        style={{
          transform: `scale(${isPressed ? 0.9 : isHovered ? 1.15 : 1}) translate(-1px, -1px)`,
        }}
      >
        <svg
          className="custom-cursor-svg block"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="cursorBorderGradient" x1="2" y1="2" x2="21" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ff4d6d" />
              <stop offset="100%" stopColor="#ff2d55" />
            </linearGradient>
          </defs>

          {/* Crisp Flat Precision Pointer with sharp edges and dark contrast interior */}
          <path
            d="M2 2L9.5 21.5L13.2 13.8L21 11.2L2 2Z"
            fill="#090A0F"
            stroke="url(#cursorBorderGradient)"
            strokeWidth="1.75"
            strokeLinejoin="miter"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
};

