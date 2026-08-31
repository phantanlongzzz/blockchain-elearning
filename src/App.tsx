/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { SimulationProvider } from './context/SimulationContext';
import { NavigationProvider } from './context/NavigationContext';

// Application Shell
import { Navbar } from './components/layout/Navbar';
import { ModuleProgressRail } from './components/layout/ModuleProgressRail';
import { LessonContentRenderer } from './components/layout/LessonContentRenderer';
import { LessonFooter } from './components/layout/LessonFooter';
import { Footer } from './components/Footer';
import { BackToTop } from './components/BackToTop';
import { CommandPalette } from './components/CommandPalette';

// Persistent Modals
import { AuthModal } from './components/Auth/AuthModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { QuizHistoryModal } from './components/Profile/QuizHistoryModal';
import { CertificatesModal } from './components/Profile/CertificatesModal';
import { QuizReviewModal } from './components/Quiz/QuizReviewModal';

function AppContent() {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -1000, y: -1000 });

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

  // Subtle cursor spotlight tracker
  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-[#090A0F] bg-grid-subtle text-[#F2F4F7] selection:bg-[#00C98D]/30 selection:text-[#00C98D] relative overflow-x-hidden font-sans flex flex-col justify-between">
      {/* Background Ambient Atmosphere & Subtle Cursor Spotlight */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-[#00C98D]/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#11161E]/30 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/2 right-10 w-80 h-80 bg-[#00C98D]/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Subtle Radial Cursor Spotlight */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(550px circle at ${mousePos.x}px ${mousePos.y}px, rgba(0, 201, 141, 0.02), transparent 80%)`,
        }}
      />

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
        <div id="lesson-workspace-canvas" className="animate-in fade-in duration-200">
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
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <SimulationProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </SimulationProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
