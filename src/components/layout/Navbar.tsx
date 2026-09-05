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
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { useNavigation, MODULES_REGISTRY, ModuleId } from '../../context/NavigationContext';
import { useProgressStore } from '../../stores/progressStore';
import { CursorToggle } from '../CursorToggle';

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
  const { language, setLanguage, strings } = useLanguage();
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
  const brandName = strings?.nav?.brandName || (isVi ? 'Trường Đại học Đà Lạt' : 'Dalat University');
  const brandSubtitle = strings?.nav?.brandSubtitle || (isVi ? 'Khoa Công nghệ Thông tin' : 'Faculty of Information Technology');

  // User initial avatar letter
  const userInitial = user?.name ? user.name.trim().charAt(0).toUpperCase() : 'P';
  const displayName = user?.name || (isVi ? 'Phan Tấn Long' : 'Phan Tan Long');

  return (
    <header className="sticky top-0 z-50 bg-[#090D12]/95 backdrop-blur-md border-b border-white/[0.08] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16" ref={navRef}>
          {/* Left: Brand Logo & Institution / Faculty Title */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => navigateTo('home', 'overview')}
              className="flex items-center gap-3 text-left rounded-lg group cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              id="nav-brand-button"
              aria-label={`${brandName} - ${brandSubtitle}`}
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#0C0F14] border border-white/[0.08] group-hover:border-border-primary transition-colors p-1 shrink-0 flex items-center justify-center">
                <img
                  src="/logo.png"
                  alt={brandName}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="font-sans font-bold text-sm sm:text-base leading-tight text-[#F2F4F7] tracking-tight group-hover:text-white transition-colors">
                  {brandName}
                </span>
                <span className="font-sans font-normal sm:font-medium text-[11px] sm:text-xs leading-tight text-[#9AA5B5] group-hover:text-[#C8D0DB] transition-colors mt-0.5 whitespace-nowrap">
                  {brandSubtitle}
                </span>
              </div>
            </button>
          </div>

          {/* Center: Main Navigation Menu (Clean, Minimal, Text + Subtle Chevron) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-xs font-medium" aria-label="Primary navigation">
            {MODULES_REGISTRY.map((module) => {
              const isActiveModule = currentModuleId === module.id;
              const hasMultipleLessons = module.lessons.length > 1;
              const isDropdownOpen = openDropdown === module.id;

              if (!hasMultipleLessons) {
                // Trang chủ (Single lesson)
                return (
                  <button
                    key={module.id}
                    id={`nav-tab-${module.id}`}
                    onClick={() => navigateTo(module.id, module.lessons[0].id)}
                    className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
                      isActiveModule
                        ? 'text-text-primary bg-white/[0.06] font-semibold'
                        : 'text-[#9AA5B5] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                    }`}
                  >
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
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
                      isActiveModule
                        ? 'text-text-primary bg-white/[0.06] font-semibold'
                        : 'text-[#9AA5B5] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                    }`}
                  >
                    <span>{isVi ? module.titleVi : module.titleEn}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-150 ${
                        isDropdownOpen ? 'rotate-180 text-text-primary' : 'text-[#717B8C]'
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 sm:w-60 bg-[#0C0F14] backdrop-blur-md border border-white/[0.08] rounded-xl shadow-2xl p-1 z-50 animate-in fade-in slide-in-from-top-1 duration-150 font-sans"
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
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
                                isCurrentLesson
                                  ? 'bg-[#11161E] text-text-primary font-semibold'
                                  : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                              }`}
                            >
                              <span className="truncate">{label}</span>
                              {isDone ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 ml-2" />
                              ) : isCurrentLesson ? (
                                <span className="w-1.5 h-1.5 rounded-full bg-white/[0.1] shrink-0 ml-2" />
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

          {/* Right Action Tools: GitHub Icon, Search Icon, Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Minimal GitHub Icon Button */}
            <a
              href="https://github.com/phantanlongzzz/blockchain-elearning"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#9AA5B5] hover:text-text-primary hover:bg-white/[0.04] transition-all cursor-pointer group/gh relative"
              title="GitHub Repository"
              aria-label="GitHub Repository"
            >
              <img
                src="/github.webp"
                alt="GitHub"
                className="w-4 h-4 object-contain brightness-0 invert opacity-75 group-hover/gh:opacity-100 transition-opacity"
              />
            </a>

            {/* Minimal Search Trigger */}
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
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20 ${
                isSearchOpen
                  ? 'text-text-primary bg-white/[0.04]'
                  : 'text-[#9AA5B5] hover:text-text-primary hover:bg-white/[0.04]'
              }`}
              title={isVi ? 'Tìm kiếm (Ctrl + K)' : 'Search (Ctrl + K)'}
              aria-label={isVi ? 'Tìm kiếm (Ctrl + K)' : 'Search (Ctrl + K)'}
              aria-expanded={isSearchOpen}
              aria-haspopup="dialog"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Profile Menu (Encapsulates User, Language, Interface Cursor, GitHub) */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg hover:bg-white/[0.04] transition-colors text-xs font-sans cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
                id="user-profile-button"
                aria-expanded={userDropdownOpen}
                aria-label="Profile and settings menu"
              >
                <div className="w-6 h-6 rounded-full bg-white/[0.1] flex items-center justify-center text-[#090A0F] font-bold text-[11px] shrink-0 shadow-sm">
                  {userInitial}
                </div>
                <span className="hidden sm:inline text-[#F2F4F7] max-w-[120px] truncate font-medium">
                  {displayName}
                </span>
                <ChevronDown
                  className={`w-3 h-3 text-[#717B8C] transition-transform duration-150 ${
                    userDropdownOpen ? 'rotate-180 text-text-primary' : ''
                  }`}
                />
              </button>

              {/* Minimal Profile Dropdown */}
              {userDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-60 bg-[#0C0F14] backdrop-blur-md border border-white/[0.08] rounded-xl shadow-2xl p-1.5 z-50 font-sans text-xs animate-in fade-in slide-in-from-top-1 duration-150"
                  role="menu"
                  aria-label="User menu"
                >
                  {/* User Profile Info / Guest header */}
                  <div className="px-3 py-2 border-b border-white/[0.08]">
                    <div className="text-[#F2F4F7] font-semibold truncate text-[13px]">
                      {displayName}
                    </div>
                    {user?.email && (
                      <div className="text-[11px] text-[#717B8C] truncate font-mono mt-0.5">
                        {user.email}
                      </div>
                    )}
                  </div>

                  {/* User Modal Links (if authenticated) */}
                  {isAuthenticated && user && (
                    <div className="py-1 border-b border-white/[0.08] space-y-0.5" role="none">
                      <button
                        role="menuitem"
                        onClick={() => {
                          setProfileModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5 text-text-muted" />
                        <span>{isVi ? 'Hồ sơ cá nhân' : 'Profile'}</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setQuizHistoryModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                      >
                        <History className="w-3.5 h-3.5 text-text-muted" />
                        <span>{isVi ? 'Lịch sử làm bài' : 'Quiz History'}</span>
                      </button>

                      <button
                        role="menuitem"
                        onClick={() => {
                          setCertificatesModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-[#F59E0B]" />
                        <span>{isVi ? 'Chứng chỉ' : 'Certificates'}</span>
                      </button>
                    </div>
                  )}

                  {/* Sign In CTA (if not authenticated) */}
                  {!isAuthenticated && (
                    <div className="p-1.5 border-b border-white/[0.08]">
                      <button
                        onClick={() => {
                          setAuthModalOpen(true);
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/[0.1] hover:bg-white/[0.15] text-[#090A0F] font-bold text-xs transition-colors cursor-pointer shadow-sm"
                      >
                        <LogIn className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Đăng nhập lưu tiến độ' : 'Sign In'}</span>
                      </button>
                    </div>
                  )}

                  {/* Language Section: EN / VI */}
                  <div className="px-3 py-2.5 border-b border-white/[0.08]">
                    <div className="text-[10px] uppercase font-semibold text-[#717B8C] tracking-wider mb-1.5">
                      {isVi ? 'Ngôn ngữ' : 'Language'}
                    </div>
                    <div className="grid grid-cols-2 gap-1 bg-[#090D12] p-1 rounded-lg border border-white/[0.04]">
                      <button
                        type="button"
                        onClick={() => setLanguage('en')}
                        className={`py-1 rounded text-center text-xs font-mono font-medium transition-colors cursor-pointer ${
                          language === 'en'
                            ? 'bg-white/[0.1] text-[#090A0F] font-bold shadow-sm'
                            : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                        }`}
                      >
                        EN
                      </button>
                      <button
                        type="button"
                        onClick={() => setLanguage('vi')}
                        className={`py-1 rounded text-center text-xs font-mono font-medium transition-colors cursor-pointer ${
                          language === 'vi'
                            ? 'bg-white/[0.1] text-[#090A0F] font-bold shadow-sm'
                            : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04]'
                        }`}
                      >
                        VI
                      </button>
                    </div>
                  </div>

                  {/* Interface Settings: Cursor */}
                  <div className="px-3 py-2.5 border-b border-white/[0.08]">
                    <div className="text-[10px] uppercase font-semibold text-[#717B8C] tracking-wider mb-1.5">
                      {isVi ? 'Cài đặt giao diện' : 'Interface'}
                    </div>
                    <CursorToggle />
                  </div>

                  {/* GitHub Repository Link */}
                  <div className="py-1">
                    <a
                      href="https://github.com/phantanlongzzz/blockchain-elearning"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-[#A5AFBF] hover:text-text-primary hover:bg-white/[0.04] text-left transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <img
                          src="/github.webp"
                          alt="GitHub"
                          className="w-3.5 h-3.5 object-contain brightness-0 invert opacity-75"
                        />
                        <span>GitHub Repository</span>
                      </span>
                      <ExternalLink className="w-3 h-3 text-[#717B8C]" />
                    </a>
                  </div>

                  {/* Sign Out (if authenticated) */}
                  {isAuthenticated && user && (
                    <div className="pt-1 border-t border-white/[0.08]">
                      <button
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setUserDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-rose-400 hover:bg-rose-950/30 text-left transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{isVi ? 'Đăng xuất' : 'Sign Out'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-white/[0.04] transition-colors cursor-pointer shrink-0"
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
        <div className="lg:hidden border-t border-white/[0.08] bg-[#090D12] px-4 py-3 space-y-1.5 max-h-[85vh] overflow-y-auto font-sans text-xs animate-in slide-in-from-top duration-150">
          {MODULES_REGISTRY.map((module) => {
            const isActiveModule = currentModuleId === module.id;
            const isExpanded = mobileExpandedGroup === module.id || isActiveModule;
            const ModIcon = ICON_MAP[module.iconName] || Home;

            return (
              <div key={module.id} className="rounded-lg border border-white/[0.08] bg-[#0C0F14] overflow-hidden">
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
                    isActiveModule ? 'text-text-primary bg-white/[0.06]' : 'text-[#A5AFBF] hover:bg-[#11161E]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ModIcon className="w-4 h-4 text-text-muted shrink-0" />
                    <span>{isVi ? module.titleVi : module.titleEn}</span>
                  </div>
                  {module.lessons.length > 1 && (
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-150 ${
                        isExpanded ? 'rotate-180 text-text-primary' : 'text-[#717B8C]'
                      }`}
                    />
                  )}
                </button>

                {isExpanded && module.lessons.length > 1 && (
                  <div className="px-1.5 pb-1.5 pt-0.5 space-y-0.5 border-t border-white/[0.08]">
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
                              ? 'bg-[#11161E] text-text-primary font-semibold'
                              : 'text-[#A5AFBF] hover:text-[#F2F4F7] hover:bg-[#0F131A]'
                          }`}
                        >
                          <span className="truncate">{label}</span>
                          {isDone ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 ml-2" />
                          ) : isCurrentLesson ? (
                            <span className="w-1.5 h-1.5 rounded-full bg-white/[0.1] shrink-0 ml-2" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* Mobile Language Switcher */}
          <div className="rounded-lg border border-white/[0.08] bg-[#0C0F14] p-3 mt-2">
            <div className="text-[10px] uppercase font-semibold text-[#717B8C] tracking-wider mb-2">
              {isVi ? 'Ngôn ngữ' : 'Language'}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-1.5 rounded text-center text-xs font-mono font-medium transition-colors ${
                  language === 'en'
                    ? 'bg-white/[0.1] text-[#090A0F] font-bold'
                    : 'bg-[#090D12] text-[#A5AFBF] border border-white/[0.04]'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('vi')}
                className={`py-1.5 rounded text-center text-xs font-mono font-medium transition-colors ${
                  language === 'vi'
                    ? 'bg-white/[0.1] text-[#090A0F] font-bold'
                    : 'bg-[#090D12] text-[#A5AFBF] border border-white/[0.04]'
                }`}
              >
                VI
              </button>
            </div>
          </div>

          {/* Mobile Cursor Toggle */}
          <div className="rounded-lg border border-white/[0.08] bg-[#0C0F14] p-3">
            <div className="text-[10px] uppercase font-semibold text-[#717B8C] tracking-wider mb-2">
              {isVi ? 'Cài đặt giao diện' : 'Interface'}
            </div>
            <CursorToggle />
          </div>

          {/* Mobile GitHub Link */}
          <div className="rounded-lg border border-white/[0.08] bg-[#0C0F14] overflow-hidden">
            <a
              href="https://github.com/phantanlongzzz/blockchain-elearning"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-left font-medium text-xs transition-colors text-[#A5AFBF] hover:text-text-primary hover:bg-[#11161E] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <img
                  src="/github.webp"
                  alt="GitHub"
                  className="w-4 h-4 object-contain brightness-0 invert opacity-70"
                />
                <span>GitHub Repository</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-[#717B8C]" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
