import React, { useEffect, useRef } from 'react';

/**
 * CustomCursor — Native Hardware-Accelerated Cursor Controller.
 * 
 * In accordance with browser UX standards:
 * - Replaces ONLY the default arrow cursor with /cursor.webp via native CSS.
 * - Leaves all contextual semantic cursors (pointer, text, grab, grabbing, wait, not-allowed)
 *   to browser native implementations.
 * - Eliminates fake JS cursor DOM overlays, preventing double cursor or lag on scrollbars.
 * - Provides seamless click-and-drag panning on horizontal scroll areas with grab -> grabbing.
 */
export const CustomCursor: React.FC = () => {
  const activeDragRef = useRef<{
    container: HTMLElement;
    startX: number;
    scrollLeft: number;
    isDragging: boolean;
  } | null>(null);

  useEffect(() => {
    // 1. Capability check: fine pointer (mouse / trackpad) with hover support
    const finePointerQuery = window.matchMedia('(pointer: fine) and (hover: hover)');

    const updateCapability = () => {
      const isFinePointer =
        finePointerQuery.matches &&
        !('ontouchstart' in window && navigator.maxTouchPoints > 1);

      if (isFinePointer) {
        document.documentElement.classList.add('custom-cursor-enabled', 'custom-cursor-active');
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled', 'custom-cursor-active', 'is-dragging');
      }
    };

    updateCapability();

    if (finePointerQuery.addEventListener) {
      finePointerQuery.addEventListener('change', updateCapability);
    } else {
      finePointerQuery.addListener(updateCapability);
    }

    // 2. Horizontal Scroll Drag-to-Pan (Grab / Grabbing UX)
    const findScrollableHorizontalParent = (el: HTMLElement | null): HTMLElement | null => {
      let current = el;
      let depth = 0;
      while (current && current !== document.documentElement && current !== document.body && depth < 8) {
        if (
          current.classList.contains('scrollable-horizontal') ||
          current.hasAttribute('data-scrollable') ||
          current.classList.contains('overflow-x-auto')
        ) {
          // Verify it actually overflows horizontally
          if (current.scrollWidth > current.clientWidth + 4) {
            return current;
          }
        }
        current = current.parentElement;
        depth++;
      }
      return null;
    };

    const isInteractiveElement = (el: HTMLElement | null): boolean => {
      if (!el) return false;
      if (
        el.tagName === 'BUTTON' ||
        el.tagName === 'A' ||
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.getAttribute('role') === 'button' ||
        el.getAttribute('role') === 'tab' ||
        el.classList.contains('cursor-pointer') ||
        el.closest('button, a, input, textarea, select, [role="button"], [role="tab"], .cursor-pointer')
      ) {
        return true;
      }
      return false;
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Only primary mouse button (left click)
      if (e.button !== 0) return;

      const target = e.target as HTMLElement | null;
      if (isInteractiveElement(target)) return;

      const container = findScrollableHorizontalParent(target);
      if (!container) return;

      activeDragRef.current = {
        container,
        startX: e.clientX,
        scrollLeft: container.scrollLeft,
        isDragging: false,
      };
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!activeDragRef.current) return;
      const drag = activeDragRef.current;
      const deltaX = e.clientX - drag.startX;

      if (!drag.isDragging && Math.abs(deltaX) > 4) {
        drag.isDragging = true;
        document.documentElement.classList.add('is-dragging');
        drag.container.classList.add('is-dragging');
      }

      if (drag.isDragging) {
        drag.container.scrollLeft = drag.scrollLeft - deltaX;
        // Prevent unwanted text selection during horizontal pan
        e.preventDefault();
      }
    };

    const handlePointerUp = () => {
      if (activeDragRef.current) {
        if (activeDragRef.current.isDragging) {
          activeDragRef.current.container.classList.remove('is-dragging');
          document.documentElement.classList.remove('is-dragging');
        }
        activeDragRef.current = null;
      }
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointercancel', handlePointerUp, { passive: true });
    window.addEventListener('blur', handlePointerUp);

    return () => {
      document.documentElement.classList.remove('custom-cursor-enabled', 'custom-cursor-active', 'is-dragging');
      if (finePointerQuery.removeEventListener) {
        finePointerQuery.removeEventListener('change', updateCapability);
      } else {
        finePointerQuery.removeListener(updateCapability);
      }
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      window.removeEventListener('blur', handlePointerUp);
    };
  }, []);

  // Purely headless; zero DOM elements rendered, hardware-accelerated CSS cursor
  return null;
};
