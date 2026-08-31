import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  GraduationCap,
  Sparkles,
  ArrowRight,
  LogIn,
  CheckCircle2,
} from 'lucide-react';
import { useAuth, DEMO_USER_PROFILE } from '../../context/AuthContext';
import { useLanguage } from '../../i18n/LanguageContext';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, loginWithGoogle, isLoading } =
    useAuth();
  const { strings, language } = useLanguage();
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customStudentId, setCustomStudentId] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);

  if (!authModalOpen) return null;

  const handleQuickDemoLogin = async () => {
    await loginWithGoogle(DEMO_USER_PROFILE);
  };

  const handleCustomGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) return;
    await loginWithGoogle({
      name: customName.trim(),
      email: customEmail.trim(),
      studentId: customStudentId.trim() || 'STUDENT-DEMO',
      class: customClass.trim() || 'DLU-IT',
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(
        customEmail
      )}`,
    });
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
      onClick={() => setAuthModalOpen(false)}
    >
      <div
        id="auth-modal-container"
        className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-auth-modal"
          onClick={() => setAuthModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            {strings.auth.signInPromptTitle}
          </h3>
          <p className="text-sm text-slate-400 mt-1.5 max-w-xs mx-auto">
            {strings.auth.signInPromptDesc}
          </p>
        </div>

        {!showCustomForm ? (
          <div className="space-y-4">
            {/* Primary Google Auth Button */}
            <button
              id="btn-continue-with-google"
              onClick={handleQuickDemoLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-semibold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
            >
              {/* Google G SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{strings.auth.continueWithGoogle}</span>
            </button>

            {/* Quick Demo Researcher Profile Card */}
            <div className="pt-2">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-xs uppercase tracking-wider text-slate-500 font-medium">
                  {language === 'vi' ? 'Tài khoản sinh viên mẫu' : 'Demo Student Account'}
                </span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <div
                id="demo-account-card"
                onClick={handleQuickDemoLogin}
                className="group cursor-pointer p-3.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 rounded-xl transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={DEMO_USER_PROFILE.avatar}
                    alt={DEMO_USER_PROFILE.name}
                    className="w-10 h-10 rounded-full border border-amber-500/40 object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-amber-400 transition-colors">
                        {DEMO_USER_PROFILE.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-medium border border-amber-500/20">
                        {DEMO_USER_PROFILE.class}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 font-mono">
                      MSSV: {DEMO_USER_PROFILE.studentId}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Alternative custom login link */}
            <div className="text-center pt-2">
              <button
                id="btn-switch-custom-auth"
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="text-xs text-slate-400 hover:text-amber-400 transition-colors underline underline-offset-4"
              >
                {language === 'vi'
                  ? 'Đăng nhập với email / tài khoản khác'
                  : 'Sign in with a different email / student identity'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCustomGoogleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {strings.profile.fullName} <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Nguyen Van A"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                {strings.profile.email} <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                required
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                placeholder="student@dlu.edu.vn"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {strings.profile.studentId}
                </label>
                <input
                  type="text"
                  value={customStudentId}
                  onChange={(e) => setCustomStudentId(e.target.value)}
                  placeholder="2312xxx"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  {strings.profile.class}
                </label>
                <input
                  type="text"
                  value={customClass}
                  onChange={(e) => setCustomClass(e.target.value)}
                  placeholder="CTK47B"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowCustomForm(false)}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
              >
                {strings.profile.cancel}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-xl text-sm transition-all shadow-md disabled:opacity-50"
              >
                {strings.auth.signIn}
              </button>
            </div>
          </form>
        )}

        {/* Security & Google Identity Notice */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{strings.auth.googleAccountNotice}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
