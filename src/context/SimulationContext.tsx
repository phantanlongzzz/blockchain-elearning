import React, { createContext, useContext, useState, useCallback } from 'react';

interface SimulationContextType {
  isSimulationActive: boolean;
  simulationName: string | null;
  isNavForceShown: boolean;
  isNavVisible: boolean;
  setSimulationActive: (active: boolean, name?: string) => void;
  toggleNavVisibility: () => void;
  setNavForceShown: (force: boolean) => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSimulationActive, setIsSimulationActiveState] = useState(false);
  const [simulationName, setSimulationName] = useState<string | null>(null);
  const [isNavForceShown, setIsNavForceShown] = useState(false);

  const setSimulationActive = useCallback((active: boolean, name?: string) => {
    setIsSimulationActiveState(active);
    if (active) {
      if (name) setSimulationName(name);
      // Default to hiding header when simulation becomes active
      setIsNavForceShown(false);
    } else {
      setSimulationName(null);
      setIsNavForceShown(false);
    }
  }, []);

  const toggleNavVisibility = useCallback(() => {
    setIsNavForceShown((prev) => !prev);
  }, []);

  const setNavForceShown = useCallback((force: boolean) => {
    setIsNavForceShown(force);
  }, []);

  // Navigation is visible when NOT in active simulation, OR when user manually toggles it open
  const isNavVisible = !isSimulationActive || isNavForceShown;

  return (
    <SimulationContext.Provider
      value={{
        isSimulationActive,
        simulationName,
        isNavForceShown,
        isNavVisible,
        setSimulationActive,
        toggleNavVisibility,
        setNavForceShown,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = (): SimulationContextType => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
