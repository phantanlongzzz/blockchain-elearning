import fs from 'fs';

const file = 'src/components/Hero.tsx';
let content = fs.readFileSync(file, 'utf-8');

const identityTarget = `        {/* Student Researcher Identity */}
        <div className="inline-flex items-center flex-wrap justify-center gap-2 text-xs font-sans text-zinc-400 mb-10 sm:mb-12">
          <span className="text-emerald-400 font-medium">{strings.hero.researcherLabel}</span>
          <span className="font-semibold text-zinc-200">Phan Tấn Long</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">CTK47B</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400 font-mono">ID: 2312679</span>
        </div>`;

content = content.replace(identityTarget, '');

const sectionEndTarget = `    </section>
  );
};`;

const newIdentity = `        {/* Student Researcher Identity - Footer positioning */}
        <div className="max-w-5xl mx-auto text-center mt-16 pt-8 border-t border-[#292929]">
          <div className="inline-flex items-center flex-wrap justify-center gap-2 text-xs font-sans text-[#71717a]">
            <span className="text-[#a1a1aa] font-medium">{strings.hero.researcherLabel}</span>
            <span className="font-semibold text-[#f5f5f5]">Phan Tấn Long</span>
            <span className="text-[#3f3f46]">·</span>
            <span>CTK47B</span>
            <span className="text-[#3f3f46]">·</span>
            <span className="font-mono">ID: 2312679</span>
          </div>
        </div>
    </section>
  );
};`;

content = content.replace(sectionEndTarget, newIdentity);

fs.writeFileSync(file, content);
