import React from 'react';
import { UserCheck, GraduationCap, IdCard, Sparkles } from 'lucide-react';
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
        <div className="rounded-xl bg-bg-secondary border border-border-primary p-6 sm:p-8 relative overflow-hidden font-sans">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* University / Faculty Logo Container (Left Column) */}
            <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-lg bg-bg-primary border border-border-primary text-center font-sans">
              <UniversityLogo size="lg" showSubtitle={true} />
              <div className="mt-4 pt-4 border-t border-border-primary w-full text-center">
                <span className="text-[11px] font-sans text-text-muted block uppercase">
                  {strings.researcherProfile.academicFramework}
                </span>
                <span className="text-xs font-sans text-text-secondary font-semibold">
                  {program}
                </span>
              </div>
            </div>

            {/* Researcher Info (Right Column) */}
            <div className="md:col-span-8 space-y-5 font-sans">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-bg-elevated border border-border-primary text-xs font-mono text-text-secondary uppercase tracking-wider mb-2 font-semibold">
                  <Sparkles className="w-3 h-3 text-teach-1" />
                  <span>{strings.researcherProfile.studentBadge}</span>
                </div>
                <h3 className="text-2xl font-bold text-white font-display tracking-tight">
                  {researcher.name}
                </h3>
                <p className="text-sm text-text-muted font-sans mt-1">
                  {researcher.role}
                </p>
              </div>

              {/* Identity Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-sans">
                {/* Class */}
                <div className="p-4 rounded-lg bg-bg-primary border border-border-primary">
                  <div className="flex items-center gap-2 text-text-muted text-xs uppercase font-semibold mb-1 font-display">
                    <GraduationCap className="w-4 h-4 text-text-secondary" />
                    <span>{strings.researcherProfile.classLabel}</span>
                  </div>
                  <div className="text-lg font-bold text-text-primary tracking-wider font-mono">
                    {researcher.class}
                  </div>
                  <span className="text-[10px] text-text-muted block mt-1 font-sans">
                    {strings.researcherProfile.facultyLabel}
                  </span>
                </div>

                {/* Student ID */}
                <div className="p-4 rounded-lg bg-bg-primary border border-border-primary">
                  <div className="flex items-center gap-2 text-text-muted text-xs uppercase font-semibold mb-1 font-display">
                    <IdCard className="w-4 h-4 text-text-secondary" />
                    <span>{strings.researcherProfile.studentIdLabel}</span>
                  </div>
                  <div className="text-lg font-bold text-text-primary tracking-wider font-mono">
                    {researcher.studentId}
                  </div>
                  <span className="text-[10px] text-text-muted block mt-1 font-sans">
                    {strings.researcherProfile.academicIdLabel}
                  </span>
                </div>
              </div>

              {/* Research Focus Summary */}
              <div className="p-4 rounded-lg bg-bg-elevated/40 border border-border-primary text-xs text-text-secondary space-y-1.5 font-sans">
                <div className="text-text-muted font-semibold uppercase text-[11px] font-display">
                  {strings.researcherProfile.researchTopicLabel}
                </div>
                <div className="text-white font-bold text-sm font-sans">
                  {projectTitle}
                </div>
                <p className="text-text-muted text-xs leading-relaxed font-sans">
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

