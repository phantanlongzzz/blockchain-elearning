/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  Menu,
  X,
  Cpu,
  Layers,
  GitCompare,
  Boxes,
  GitFork,
  Sparkles,
  Award,
  FlaskConical,
  CheckCircle2,
  Home,
  GraduationCap,
  ListTree,
  User,
  History,
  LogOut,
  LogIn,
  Coins,
  Network,
  Pickaxe,
  BookOpen,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, MODULES_REGISTRY, ModuleId, LessonId } from '../../context/NavigationContext';
import { useProgressStore } from '../../stores/progressStore';
import { LanguageToggle } from '../LanguageToggle';
import dluLogo from '../../assets/dlu-logo.png';

const ICON_MAP: Record<string, React.ElementType> = {
  Home,
  Cpu,
  BookOpen,
  FlaskConical,
  Boxes,
  Sparkles,
  GitCompare,
  Layers,
  ListTree,
  Coins,
  Network,
  CheckCircle2,
  Pickaxe,
  Award,
  GitFork,
  GraduationCap,
  HelpCircle,
};

export interface NavbarProps {
  isSearchOpen?: boolean;
  onToggleSearch?: () => void;
  searchTriggerRef?: React.RefObject<HTMLButtonElement | null>;
}

export const Navbar: React.FC<NavbarProps> = ({
  isSearchOpen = false,
  onToggleSearch,
  searchTriggerRef,
}) => {
  const { language, strings } = useLanguage();
  const progressMap = useProgressStore((s) => s.progressMap);
  const {
    user,
    isAuthenticated,
    setAuthModalOpen,
    setProfileModalOpen,
    setQuizHistoryModalOpen,
    setCertificatesModalOpen,
    logout,
  } = useAuth();

  const { currentModuleId, currentLessonId, navigateTo } = useNavigation();

  const [openDropdown, setOpenDropdown] = useState<ModuleId | null>(null);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpandedGroup, setMobileExpandedGroup] = useState<ModuleId | null>(null);

  const navRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ESC key to close
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setUserDropdownOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleMouseEnter = (moduleId: ModuleId) => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setOpenDropdown(moduleId);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const isVi = language === 'vi';
  const brandName = strings?.nav?.brandName || 'Blockchain Lab';
  const brandSubtitle = strings?.nav?.brandSubtitle || (isVi ? 'Trường Đại học Đà Lạt · Khoa CNTT' : 'Dalat University · Faculty of Information Technology');

  return (
    <header className="sticky top-0 z-50 bg-[#090A0F]/95 backdrop-blur-md border-b border-[#1C2430] font-sans">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18" ref={navRef}>
          {/* Brand Logo & University Identity */}
          <div className="flex items-center">
            <button
              onClick={() => navigateTo('home', 'overview')}
              className="flex items-center gap-2.5 sm:gap-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] rounded-lg group cursor-pointer shrink-0"
              id="nav-brand-button"
              aria-label={`${brandName} - ${isVi ? 'Trang chủ' : 'Home'}`}
            >
              <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0C0F14] border border-[#1C2430] group-hover:border-[#00C98D]/40 transition-colors p-1.5 shadow-sm shrink-0">
                <img
                  src={dluLogo}
                  alt="Trường Đại học Đà Lạt"
                  className="w-full h-full object-contain"
                  style={{ filter: 'none', mixBlendMode: 'normal', opacity: 1 }}
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-semibold text-[#F2F4F7] text-sm sm:text-base tracking-tight leading-tight">
                  {brandName}
                </span>
                <span className="text-[11px] text-[#717B8C] font-normal tracking-tight hidden md:block mt-0.5 leading-none">
                  {brandSubtitle}
                </span>
              </div>
            </button>

            {/* Subtle Divider */}
            <div className="hidden lg:block h-4 w-px bg-[#1C2430] mx-2 xl:mx-3 shrink-0" aria-hidden="true" />

            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:flex items-center space-x-1 xl:space-x-1.5 font-sans text-xs" aria-label="Primary navigation">
              {MODULES_REGISTRY.map((module) => {
                const isActiveModule = currentModuleId === module.id;
                const hasMultipleLessons = module.lessons.length > 1;
                const isDropdownOpen = openDropdown === module.id;
                const ModIcon = ICON_MAP[module.iconName] || Home;

                if (!hasMultipleLessons) {
                  // Single lesson (Home)
                  return (
                    <button
                      key={module.id}
                      id={`nav-tab-${module.id}`}
                      onClick={() => navigateTo(module.id, module.lessons[0].id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
                        isActiveModule
                          ? 'bg-[#11161E] text-[#00C98D] border border-[#1C2430] font-semibold'
                          : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0C0F14]'
                      }`}
                    >
                      <ModIcon className="w-3.5 h-3.5" />
                      <span>{isVi ? module.titleVi : module.titleEn}</span>
                    </button>
                  );
                }

                return (
                  <div
                    key={module.id}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(module.id)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <button
                      id={`nav-tab-${module.id}`}
                      onClick={() => navigateTo(module.id, module.lessons[0].id)}
                      aria-expanded={isDropdownOpen}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-medium whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
                        isActiveModule
                          ? 'bg-[#11161E] text-[#00C98D] border border-[#1C2430] font-semibold'
                          : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0C0F14]'
                      }`}
                    >
                      <ModIcon className="w-3.5 h-3.5" />
                      <span>{isVi ? module.titleVi : module.titleEn}</span>
                      <ChevronDown
                        className={`w-3 h-3 transition-transform duration-150 ${
                          isDropdownOpen ? 'rotate-180 text-[#00C98D]' : 'text-[#717B8C]'
                        }`}
                      />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div
                        className="absolute top-full left-0 mt-1.5 w-60 sm:w-64 bg-[#0C0F14] backdrop-blur-md border border-[#1C2430] rounded-lg shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
                        role="menu"
                        aria-label={isVi ? module.titleVi : module.titleEn}
                      >
                        <div className="flex flex-col space-y-0.5" role="none">
                          {module.lessons.map((lesson) => {
                            const isCurrentLesson = currentLessonId === lesson.id;
                            const isDone = progressMap[lesson.id]?.status === 'completed';
                            const label = isVi ? lesson.shortTitleVi : lesson.shortTitleEn;

                            return (
                              <button
                                key={lesson.id}
                                role="menuitem"
                                onClick={() => {
                                  navigateTo(module.id, lesson.id);
                                  setOpenDropdown(null);
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-medium text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
                                  isCurrentLesson
                                    ? 'bg-[#11161E] text-[#00C98D] font-semibold'
                                    : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A]'
                                }`}
                              >
                                <span className="truncate">{label}</span>
                                {isDone ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D] shrink-0 ml-2" />
                                ) : isCurrentLesson ? (
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C98D] shrink-0 ml-2" />
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools: Search, Language & Auth */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Minimal Icon-Only Search Trigger (Linear / Raycast Style) */}
            <button
              ref={searchTriggerRef}
              type="button"
              id="nav-search-trigger"
              onClick={() => {
                if (onToggleSearch) {
                  onToggleSearch();
                } else {
                  window.dispatchEvent(new CustomEvent('toggle-command-palette'));
                }
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border transition-all cursor-pointer shrink-0 active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
                isSearchOpen
                  ? 'bg-[#11161E] border-[#00C98D]/40 text-[#00C98D]'
                  : 'bg-[#0C0F14] border-[#1C2430] hover:bg-[#11161E] hover:border-[#1C2430] text-[#A5AFBF] hover:text-[#F2F4F7]'
              }`}
              title={isVi ? 'Tìm kiếm (Ctrl + K)' : 'Search (Ctrl + K)'}
              aria-label={isVi ? 'Tìm kiếm (Ctrl + K)' : 'Search (Ctrl + K)'}
              aria-expanded={isSearchOpen}
              aria-haspopup="dialog"
            >
              <Search className="w-4 h-4" />
            </button>

            <LanguageToggle />

            {/* User Profile / Login */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#0C0F14] border border-[#1C2430] hover:border-[#00C98D]/40 transition-colors text-xs font-sans cursor-pointer"
                  id="user-profile-button"
                >
                  <div className="w-6 h-6 rounded-md bg-[#00C98D] flex items-center justify-center text-[#090A0F] font-bold text-[11px] shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-[#F2F4F7] max-w-[80px] md:max-w-[100px] truncate font-medium">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3 h-3 text-[#717B8C]" />
                </button>

                {userDropdownOpen && (
                  <div
                    className="absolute right-0 top-full mt-1.5 w-56 bg-[#0C0F14] backdrop-blur-md border border-[#1C2430] rounded-lg shadow-2xl p-1 z-50 font-sans text-xs animate-in fade-in slide-in-from-top-1 duration-150"
                    role="menu"
                    aria-label="User menu"
                  >
                    <div className="px-3 py-2 border-b border-[#1C2430] mb-1">
                      <div className="text-[#F2F4F7] font-medium truncate">{user.name}</div>
                      <div className="text-[11px] text-[#717B8C] truncate font-mono mt-0.5">{user.email}</div>
                    </div>

                    <div className="space-y-0.5" role="none">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setProfileModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#11161E] text-left transition-colors cursor-pointer"
                      >
                        <User className="w-4 h-4 text-[#00C98D]" />
                        <span>{isVi ? 'Hồ sơ cá nhân' : 'Profile'}</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setQuizHistoryModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#11161E] text-left transition-colors cursor-pointer"
                      >
                        <History className="w-4 h-4 text-[#00C98D]" />
                        <span>{isVi ? 'Lịch sử làm bài' : 'Quiz History'}</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setCertificatesModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#11161E] text-left transition-colors cursor-pointer"
                      >
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                        <span>{isVi ? 'Chứng chỉ' : 'Certificates'}</span>
                      </button>

                      <div className="border-t border-[#1C2430] my-1" />

                      <button
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-rose-400 hover:bg-rose-950/30 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#00C98D] hover:bg-[#00B982] text-[#090A0F] font-sans text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0"
                id="login-button"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{isVi ? 'Đăng nhập' : 'Get Certified'}</span>
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-lg bg-[#0C0F14] border border-[#1C2430] text-[#A5AFBF] hover:text-[#F2F4F7] cursor-pointer shrink-0"
              id="mobile-menu-toggle"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[#1C2430] bg-[#090A0F] px-3 sm:px-4 py-3 space-y-1.5 max-h-[80vh] overflow-y-auto font-sans text-xs animate-in slide-in-from-top duration-150">
          {MODULES_REGISTRY.map((module) => {
            const isActiveModule = currentModuleId === module.id;
            const isExpanded = mobileExpandedGroup === module.id || isActiveModule;
            const ModIcon = ICON_MAP[module.iconName] || Home;

            return (
              <div key={module.id} className="rounded-lg border border-[#1C2430] bg-[#0C0F14] overflow-hidden">
                <button
                  onClick={() => {
                    if (module.lessons.length === 1) {
                      navigateTo(module.id, module.lessons[0].id);
                      setMobileMenuOpen(false);
                    } else {
                      setMobileExpandedGroup(isExpanded ? null : module.id);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left font-medium text-xs transition-colors ${
                    isActiveModule ? 'text-[#00C98D] bg-[#00C98D]/10' : 'text-[#A5AFBF] hover:bg-[#11161E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ModIcon className="w-4 h-4 text-[#00C98D] shrink-0" />
                    <span>{isVi ? module.titleVi : module.titleEn}</span>
                  </div>
                  {module.lessons.length > 1 && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-180 text-[#00C98D]' : 'text-[#717B8C]'}`}
                    />
                  )}
                </button>

                {isExpanded && module.lessons.length > 1 && (
                  <div className="px-1.5 pb-1.5 pt-0.5 space-y-0.5 border-t border-[#1C2430]">
                    {module.lessons.map((lesson) => {
                      const isCurrentLesson = currentLessonId === lesson.id;
                      const isDone = progressMap[lesson.id]?.status === 'completed';
                      const label = isVi ? lesson.shortTitleVi : lesson.shortTitleEn;

                      return (
                        <button
                          key={lesson.id}
                          onClick={() => {
                            navigateTo(module.id, lesson.id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-left transition-colors ${
                            isCurrentLesson
                              ? 'bg-[#11161E] text-[#00C98D] font-semibold'
                              : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A]'
                          }`}
                        >
                          <span className="truncate">{label}</span>
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#00C98D] shrink-0 ml-2" />
                          ) : isCurrentLesson ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#00C98D] shrink-0 ml-2" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </header>
  );
};
