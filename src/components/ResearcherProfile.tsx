import React from 'react';
import { UserCheck, GraduationCap, IdCard, School, Award, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { UniversityLogo } from './UniversityLogo';
import { RESEARCH_METADATA } from '../data/researchData';

export const ResearcherProfile: React.FC = () => {
  const { strings } = useLanguage();
  const { researcher, program, projectTitle } = RESEARCH_METADATA;

  return (
    <section id="researcher" className="py-20 relative font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 font-sans">
          <div className="flex items-center justify-center gap-2 text-text-muted text-xs font-mono tracking-wider uppercase mb-3 font-semibold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{strings.researcherProfile.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display uppercase mb-3">
            {strings.researcherProfile.title}
          </h2>
          <p className="text-sm text-slate-400 font-sans">
            {strings.researcherProfile.subtitle}
          </p>
        </div>

        {/* Dedicated Researcher Profile Card */}
        <div className="rounded-3xl bg-[#0c1017] border border-border-primary p-6 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden font-sans">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* University / Faculty Logo Container (Left Column) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950/90 border border-slate-800 text-center font-sans">
              <UniversityLogo size="lg" showSubtitle={true} />
              <div className="mt-4 pt-4 border-t border-slate-800/80 w-full text-center">
                <span className="text-[11px] font-sans text-slate-500 block uppercase">
                  {strings.researcherProfile.academicFramework}
                </span>
                <span className="text-xs font-sans text-text-secondary font-semibold">
                  {program}
                </span>
              </div>
            </div>

            {/* Researcher Info (Right Column) */}
            <div className="md:col-span-8 space-y-6 font-sans">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-text-secondary uppercase tracking-widest mb-2 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span>{strings.researcherProfile.studentBadge}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display tracking-tight">
                  {researcher.name}
                </h3>
                <p className="text-sm text-slate-400 font-sans mt-1">
                  {researcher.role}
                </p>
              </div>

              {/* Identity Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                {/* Class */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-semibold mb-1 font-display">
                    <GraduationCap className="w-4 h-4 text-text-secondary" />
                    <span>{strings.researcherProfile.classLabel}</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary tracking-wider font-mono">
                    {researcher.class}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                    {strings.researcherProfile.facultyLabel}
                  </span>
                </div>

                {/* Student ID */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="flex items-center gap-2 text-slate-500 text-xs uppercase font-semibold mb-1 font-display">
                    <IdCard className="w-4 h-4 text-text-secondary" />
                    <span>{strings.researcherProfile.studentIdLabel}</span>
                  </div>
                  <div className="text-xl font-bold text-text-primary tracking-wider font-mono">
                    {researcher.studentId}
                  </div>
                  <span className="text-[10px] text-slate-500 block mt-1 font-sans">
                    {strings.researcherProfile.academicIdLabel}
                  </span>
                </div>
              </div>

              {/* Research Focus Summary */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1.5 font-sans">
                <div className="text-slate-400 font-semibold uppercase text-[11px] font-display">
                  {strings.researcherProfile.researchTopicLabel}
                </div>
                <div className="text-white font-bold text-sm font-sans">
                  {projectTitle}
                </div>
                <p className="text-slate-400 text-xs leading-relaxed font-sans">
                  {strings.researcherProfile.researchFocusSummary}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

