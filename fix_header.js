import fs from 'fs';

const file = 'src/components/layout/ModuleProgressRail.tsx';
let content = fs.readFileSync(file, 'utf-8');

const target = `<div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-3">
          {/* Module Identity & Breadcrumbs */}
          <div className="flex items-center gap-2 overflow-hidden text-xs">
            <span className="font-sans font-bold px-2 py-0.5 rounded-md bg-[#00C98D]/10 text-[#00C98D] border border-[#00C98D]/30 shrink-0 text-[11px] uppercase tracking-wider">
              {isVi ? currentModule.titleVi : currentModule.titleEn}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-[#717B8C] shrink-0" />
            <h1 className="font-semibold text-[#F2F4F7] truncate text-xs sm:text-sm font-sans">
              {isVi ? currentLesson.titleVi : currentLesson.titleEn}
            </h1>
          </div>

          {/* Global Course Progress Indicator connected to progressStore */}
          <div className="flex items-center gap-3.5 shrink-0 font-sans text-[11px] text-[#A5AFBF]">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-[#00C98D]" />
              <span>
                {currentLesson.estimatedMinutes} {isVi ? 'phút' : 'mins'}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 font-mono">
              <div className="w-20 bg-[#0C0F14] border border-[#1C2430] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#00C98D] h-full rounded-full transition-all duration-300"
                  style={{ width: \`\${totalProgress.percentage}%\` }}
                />
              </div>
              <span className="text-[#A5AFBF] text-[10px]">
                <AnimatedNumber value={totalProgress.completedCount} />/{totalProgress.totalCount} (<AnimatedNumber value={totalProgress.percentage} />%)
              </span>
            </div>
          </div>
        </div>`;

const replacement = `<div className="flex flex-col gap-2 sm:gap-3">
          {/* Top row: Breadcrumb + Timer + Progress */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden text-xs">
              <span className="font-sans font-bold px-2 py-0.5 rounded-md bg-[#00C98D]/10 text-[#00C98D] border border-[#00C98D]/30 shrink-0 text-[10px] uppercase tracking-wider">
                {isVi ? currentModule.titleVi : currentModule.titleEn}
              </span>
            </div>
            
            <div className="flex items-center gap-4 shrink-0 font-sans text-[11px] text-[#A5AFBF]">
              <div className="flex items-center gap-1.5 font-mono">
                <Clock className="w-3 h-3 text-[#00C98D]" />
                <span>
                  {currentLesson.estimatedMinutes} {isVi ? 'phút' : 'mins'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 font-mono">
                <div className="w-20 bg-[#0C0F14] border border-[#1C2430] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#00C98D] h-full rounded-full transition-all duration-300"
                    style={{ width: \`\${totalProgress.percentage}%\` }}
                  />
                </div>
                <span className="text-[#717B8C] text-[10px]">
                  <AnimatedNumber value={totalProgress.percentage} />%
                </span>
              </div>
            </div>
          </div>

          {/* Bottom row: Page Title */}
          <h1 className="font-semibold text-[#F2F4F7] text-base sm:text-lg font-sans leading-tight">
            {isVi ? currentLesson.titleVi : currentLesson.titleEn}
          </h1>
        </div>`;

content = content.replace(target, replacement);

fs.writeFileSync(file, content);
