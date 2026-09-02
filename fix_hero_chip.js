import fs from 'fs';

const file = 'src/components/Hero.tsx';
let content = fs.readFileSync(file, 'utf-8');

const connectorTarget = `          {/* Hashing Flow Connector */}
          <div className="flex items-center justify-center my-3 text-emerald-400">
            <div className="h-px bg-gradient-to-r from-transparent via-[#292929] to-transparent flex-1" />
            <div className="px-2.5 py-0.5 rounded-md bg-[#181818] border border-[#292929] text-[10px] font-mono uppercase tracking-widest text-emerald-400 flex items-center">
              <span>SHA-256 (64 ROUNDS)</span>
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#292929] to-transparent flex-1" />
          </div>`;

content = content.replace(connectorTarget, '');

const outputHeaderTarget = `          {/* 256-bit Hexadecimal Output Display */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
              <span className="uppercase tracking-wider font-semibold text-emerald-400">{strings.hero.digestLabel}</span>`;

const outputHeaderReplacement = `          {/* 256-bit Hexadecimal Output Display */}
          <div className="space-y-3 font-sans">
            <div className="flex items-center justify-between text-xs text-[#a1a1aa]">
              <div className="flex items-center gap-2">
                <span className="uppercase tracking-wider font-semibold text-emerald-400">{strings.hero.digestLabel}</span>
                <span className="px-2 py-0.5 rounded bg-[#181818] border border-[#292929] text-[9px] font-mono uppercase tracking-widest text-emerald-400/80">SHA-256 (64 ROUNDS)</span>
              </div>`;

content = content.replace(outputHeaderTarget, outputHeaderReplacement);

fs.writeFileSync(file, content);
