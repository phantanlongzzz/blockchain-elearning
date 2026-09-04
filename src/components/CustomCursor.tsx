import React, { useEffect, useState, useRef } from 'react';

/**
 * CustomCursor — High-performance custom cursor using /cursor.webp
 * Fully eliminates dual-cursor glitch on scrollbars, text inputs, selects, and drag states.
 */
export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Direct ref tracking to prevent state churn on high-frequency events
  const isVisibleRef = useRef(false);
  const isInteractingScrollbarRef = useRef(false);

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

    // Add class for custom cursor styling
    document.documentElement.classList.add('custom-cursor-active');

    let scheduledAnimationFrame = false;
    let latestX = -100;
    let latestY = -100;

    /**
     * Check if the cursor is directly on a scrollbar (window or container)
     */
    const isOverScrollbar = (x: number, y: number, target: EventTarget | null): boolean => {
      // 1. Root / Window scrollbars
      const root = document.documentElement;
      if (root) {
        if (x >= root.clientWidth && window.innerWidth > root.clientWidth) {
          return true;
        }
        if (y >= root.clientHeight && window.innerHeight > root.clientHeight) {
          return true;
        }
      }

      // 2. Container scrollbars (e.g. Blockchain horizontal chain, modals, code blocks)
      let current = target as HTMLElement | null;
      let depth = 0;
      while (current && current !== root && depth < 6) {
        const hasVert = current.scrollHeight > current.clientHeight && current.clientHeight > 0;
        const hasHoriz = current.scrollWidth > current.clientWidth && current.clientWidth > 0;

        if (hasVert || hasHoriz) {
          const rect = current.getBoundingClientRect();
          // Vertical scrollbar on right
          if (hasVert) {
            const scrollbarWidth = rect.width - current.clientWidth - (current.clientLeft || 0) * 2;
            if (
              scrollbarWidth > 0 &&
              x >= rect.right - scrollbarWidth &&
              x <= rect.right &&
              y >= rect.top &&
              y <= rect.bottom
            ) {
              return true;
            }
          }
          // Horizontal scrollbar on bottom
          if (hasHoriz) {
            const scrollbarHeight = rect.height - current.clientHeight - (current.clientTop || 0) * 2;
            if (
              scrollbarHeight > 0 &&
              y >= rect.bottom - scrollbarHeight &&
              y <= rect.bottom &&
              x >= rect.left &&
              x <= rect.right
            ) {
              return true;
            }
          }
        }
        current = current.parentElement;
        depth++;
      }

      return false;
    };

    /**
     * Check if cursor is over a text input or native interactive control
     * that requires default system cursor (I-beam, select dropdown, etc.)
     */
    const isOverNativeControl = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;

      // Inputs, textareas, selects, editable content
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.hasAttribute('contenteditable') ||
        target.getAttribute('role') === 'textbox' ||
        target.closest('input, textarea, select, [contenteditable="true"], .text-selectable')
      ) {
        return true;
      }

      return false;
    };

    const updatePosition = () => {
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${latestX}px, ${latestY}px, 0)`;
      }
      scheduledAnimationFrame = false;
    };

    const setVisibility = (visible: boolean) => {
      if (isVisibleRef.current !== visible) {
        isVisibleRef.current = visible;
        setIsVisible(visible);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      latestX = e.clientX;
      latestY = e.clientY;

      // If user is actively dragging a scrollbar or mouse buttons pressed while scrolling
      if (isInteractingScrollbarRef.current) {
        setVisibility(false);
        return;
      }

      // Check if mouse is on scrollbar or on native input/textarea/select
      if (isOverScrollbar(e.clientX, e.clientY, e.target) || isOverNativeControl(e.target)) {
        setVisibility(false);
      } else {
        setVisibility(true);
      }

      if (!scheduledAnimationFrame) {
        scheduledAnimationFrame = true;
        requestAnimationFrame(updatePosition);
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isOverScrollbar(e.clientX, e.clientY, e.target)) {
        isInteractingScrollbarRef.current = true;
        setVisibility(false);
      }
    };

    const handlePointerUp = () => {
      if (isInteractingScrollbarRef.current) {
        isInteractingScrollbarRef.current = false;
      }
    };

    const handleMouseLeave = () => {
      setVisibility(false);
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (!isOverScrollbar(e.clientX, e.clientY, e.target) && !isOverNativeControl(e.target)) {
        setVisibility(true);
      }
    };

    const handleWindowBlur = () => {
      setVisibility(false);
      isInteractingScrollbarRef.current = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.documentElement.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      window.removeEventListener('blur', handleWindowBlur);
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
        transition: 'opacity 0.08s ease-out',
      }}
    >
      <img
        src="/cursor.webp"
        alt=""
        style={{
          display: 'block',
          width: '36px',
          height: 'auto',
          transform: 'translate(-2px, -2px)',
        }}
      />
    </div>
  );
};
