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
import { AIAssistantWidget } from './components/AIAssistant/AIAssistantWidget';
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
    <div className="min-h-screen bg-[#060913] bg-gradient-to-b from-[#080D1A] via-[#05070E] to-[#020408] text-text-primary selection:bg-teach-1/30 selection:text-teach-1 relative overflow-x-hidden font-sans flex flex-col justify-between">
      {/* ========================================================================= */}
      {/* 3-LAYER CYBER MESH & AMBIENT GLOW SYSTEM                                  */}
      {/* ========================================================================= */}
      {/* Lớp 1 - Lưới tọa độ kỹ thuật chìm (Cyber Grid) */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)] -z-10" />

      {/* Lớp 2 - Quầng sáng cực quang sau Card Khối #840291 (Backdrop Aura) */}
      <div className="pointer-events-none absolute top-1/4 right-[10%] w-[520px] h-[520px] bg-gradient-to-tr from-cyan-500/10 via-blue-600/5 to-transparent rounded-full blur-[140px] -z-10 animate-pulse [animation-duration:8s]" />

      {/* Lớp 3 - Vệt sáng phản quang góc trái trên (Top Left Rim Light) */}
      <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[160px] -z-10" />

      {/* Single Global Focal Glow at the top of the page */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(ellipse_at_top,_rgba(0,210,255,0.08),_transparent_70%)] pointer-events-none -z-10" />

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
      <AIAssistantWidget />
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
