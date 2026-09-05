import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Code2, Award, FileText } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { RESEARCH_METADATA } from '../data/researchData';

export const AboutResearch: React.FC = () => {
  const { strings } = useLanguage();

  const researchTopics = [
    {
      title: strings.aboutResearch.topics.primitivesTitle,
      desc: strings.aboutResearch.topics.primitivesDesc,
      icon: ShieldCheck,
      color: 'text-text-secondary',
    },
    {
      title: strings.aboutResearch.topics.avalancheTitle,
      desc: strings.aboutResearch.topics.avalancheDesc,
      icon: Cpu,
      color: 'text-text-secondary',
    },
    {
      title: strings.aboutResearch.topics.collisionTitle,
      desc: strings.aboutResearch.topics.collisionDesc,
      icon: Award,
      color: 'text-text-secondary',
    },
    {
      title: strings.aboutResearch.topics.consensusTitle,
      desc: strings.aboutResearch.topics.consensusDesc,
      icon: Code2,
      color: 'text-text-secondary',
    },
  ];

  return (
    <section id="about-research" className="py-20 relative font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 font-sans">
          <div className="inline-flex items-center gap-2 text-teach-1 text-xs font-mono font-semibold tracking-wider uppercase mb-3">
            <BookOpen className="w-3.5 h-3.5 text-text-muted" />
            <span>{strings.aboutResearch.badge}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#f5f5f5] tracking-tight font-sans uppercase mb-3">
            {strings.aboutResearch.title}
          </h2>
          <p className="text-sm sm:text-base text-[#a1a1aa] leading-relaxed font-sans">
            {strings.aboutResearch.subtitle}
          </p>
        </div>

        {/* Abstract and Methodology Card */}
        <div className="rounded-xl bg-[#111111] border border-[#292929] p-6 sm:p-8 shadow-lg mb-12 font-sans">
          <div className="flex items-center gap-2 text-text-secondary font-sans text-xs font-bold uppercase tracking-wider mb-3">
            <FileText className="w-4 h-4 text-text-muted" />
            <span>{strings.aboutResearch.abstractTitle}</span>
          </div>
          <p className="text-sm sm:text-base text-[#f5f5f5] leading-relaxed mb-6 font-sans font-normal">
            {strings.aboutResearch.abstract}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-[#292929] font-sans text-xs text-[#a1a1aa]">
            <div>
              <span className="text-[#71717a] block mb-0.5">{strings.aboutResearch.formalStandard}:</span>
              <strong className="text-[#f5f5f5] font-mono">NIST FIPS PUB 180-4</strong>
            </div>
            <div>
              <span className="text-[#71717a] block mb-0.5">{strings.aboutResearch.programName}:</span>
              <strong className="text-text-primary font-sans">{RESEARCH_METADATA.program}</strong>
            </div>
            <div>
              <span className="text-[#71717a] block mb-0.5">{strings.aboutResearch.academicYear}:</span>
              <strong className="text-[#f5f5f5] font-mono">{RESEARCH_METADATA.academicYear}</strong>
            </div>
          </div>
        </div>

        {/* 4 Research Topic Pillar Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-sans">
          {researchTopics.map((topic, idx) => {
            const Icon = topic.icon;
            return (
              <div
                key={idx}
                className="rounded-xl bg-[#111111] border border-[#292929] p-5 hover:border-border-secondary transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="p-2.5 rounded-lg bg-[#0a0a0a] border border-[#292929] w-fit mb-4">
                    <Icon className={`w-5 h-5 ${topic.color}`} />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#f5f5f5] mb-2">
                    {topic.title}
                  </h3>
                  <p className="text-xs text-[#a1a1aa] leading-relaxed font-sans">
                    {topic.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

