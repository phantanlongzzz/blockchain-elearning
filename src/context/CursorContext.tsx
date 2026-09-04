import React, { createContext, useContext, useState, useEffect } from 'react';

interface CursorContextType {
  customCursorEnabled: boolean;
  setCustomCursorEnabled: (enabled: boolean) => void;
  toggleCustomCursor: () => void;
}

const STORAGE_KEY = 'customCursorEnabled';

const CursorContext = createContext<CursorContextType>({
  customCursorEnabled: true,
  setCustomCursorEnabled: () => {},
  toggleCustomCursor: () => {},
});

export const CursorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customCursorEnabled, setCustomCursorEnabledState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          return stored === 'true';
        }
      }
    } catch {
      // ignore
    }
    return true; // Default ON
  });

  const setCustomCursorEnabled = (enabled: boolean) => {
    setCustomCursorEnabledState(enabled);
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent('custom-cursor-changed', { detail: enabled }));
  };

  const toggleCustomCursor = () => {
    setCustomCursorEnabled(!customCursorEnabled);
  };

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setCustomCursorEnabledState(e.newValue === 'true');
      }
    };

    const handleCustom = (e: Event) => {
      const customEvent = e as CustomEvent<boolean>;
      if (typeof customEvent.detail === 'boolean') {
        setCustomCursorEnabledState(customEvent.detail);
      }
    };

    const handleToggleReq = () => {
      setCustomCursorEnabledState((prev) => {
        const next = !prev;
        try {
          localStorage.setItem(STORAGE_KEY, String(next));
        } catch {
          // ignore
        }
        window.dispatchEvent(new CustomEvent('custom-cursor-changed', { detail: next }));
        return next;
      });
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('custom-cursor-changed', handleCustom);
    window.addEventListener('custom-cursor-toggle-req', handleToggleReq);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('custom-cursor-changed', handleCustom);
      window.removeEventListener('custom-cursor-toggle-req', handleToggleReq);
    };
  }, []);

  // Synchronize custom cursor classes on <html>
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (customCursorEnabled) {
        document.documentElement.classList.add('custom-cursor-enabled', 'custom-cursor-active');
      } else {
        document.documentElement.classList.remove('custom-cursor-enabled', 'custom-cursor-active', 'is-dragging');
      }
    }
  }, [customCursorEnabled]);

  return (
    <CursorContext.Provider
      value={{
        customCursorEnabled,
        setCustomCursorEnabled,
        toggleCustomCursor,
      }}
    >
      {children}
    </CursorContext.Provider>
  );
};

export const useCursor = () => useContext(CursorContext);
