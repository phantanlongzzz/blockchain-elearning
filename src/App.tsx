/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { NavigationProvider } from './context/NavigationContext';
import { CursorProvider, useCursor } from './context/CursorContext';

// Application Shell
import { Navbar } from './components/layout/Navbar';
import { ModuleProgressRail } from './components/layout/ModuleProgressRail';
import { LessonContentRenderer } from './components/layout/LessonContentRenderer';
import { LessonFooter } from './components/layout/LessonFooter';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { CommandPalette } from './components/CommandPalette';
import { CustomCursor } from './components/CustomCursor';

// Persistent Modals
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { QuizHistoryModal } from './components/Profile/QuizHistoryModal';
import { CertificatesModal } from './components/Profile/CertificatesModal';
import { QuizReviewModal } from './components/Quiz/QuizReviewModal';

function AppContent() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const { customCursorEnabled } = useCursor();

  // Global keyboard shortcut for Command Palette (Ctrl+K / Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fallback event listener for custom events
  useEffect(() => {
    const handleOpen = () => setIsCommandPaletteOpen(true);
    const handleToggle = () => setIsCommandPaletteOpen((prev) => !prev);

    window.addEventListener('open-command-palette', handleOpen);
    window.addEventListener('toggle-command-palette', handleToggle);

    return () => {
      window.removeEventListener('open-command-palette', handleOpen);
      window.removeEventListener('toggle-command-palette', handleToggle);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0D0F] text-[#F2F4F7] selection:bg-[#00C98D]/30 selection:text-[#00C98D] relative overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Fixed Application Shell: Top Nav & Module Progress Rail */}
      <div className="relative z-30">
        <Navbar
          isSearchOpen={isCommandPaletteOpen}
          onToggleSearch={() => setIsCommandPaletteOpen((prev) => !prev)}
          searchTriggerRef={searchTriggerRef}
        />
        <ModuleProgressRail />
      </div>

      {/* Main Dynamic Lesson Content (Only Active Lesson is Mounted) */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div id="lesson-workspace-canvas" className="animate-section-enter">
          <LessonContentRenderer />
        </div>
        <LessonFooter />
      </main>

      {/* Global Modals Layer */}
      <AuthModal />
      <ProfileModal />
      <QuizHistoryModal />
      <CertificatesModal />
      <QuizReviewModal />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        triggerRef={searchTriggerRef}
      />

      {/* Application Global Footer & Utilities */}
      <Footer />
      <BackToTop />

      {/* Global Modern Neon Cursor (Only mounted when enabled) */}
      {customCursorEnabled && <CustomCursor />}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SimulationProvider>
          <NavigationProvider>
            <CursorProvider>
              <AppContent />
            </CursorProvider>
          </NavigationProvider>
        </SimulationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
