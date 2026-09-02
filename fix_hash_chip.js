import fs from 'fs';

const file = 'src/components/HashGenerator.tsx';
let content = fs.readFileSync(file, 'utf-8');

const connectorTarget = `          {/* Central Process Flow Indicator */}
          <div className="lg:col-span-12 flex items-center justify-center my-1 font-sans">
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-md bg-[#0C0F14] border border-[#1C2430]">
              <span className="w-2 h-2 rounded-full bg-[#00C98D]" />
              <span className="font-sans text-xs font-semibold text-[#00C98D] tracking-wider uppercase">
                {strings.hashGenerator.processEngine}
              </span>
            </div>
          </div>`;

content = content.replace(connectorTarget, '');

const outputHeaderTarget = `              <div>
                <span className="text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">
                  {strings.hashGenerator.outputLabel}
                </span>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.hashGenerator.outputSubtitle}
                </p>
              </div>`;

const outputHeaderReplacement = `              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-sans font-bold text-[#00C98D] uppercase tracking-wider">
                    {strings.hashGenerator.outputLabel}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#090A0F] border border-[#1C2430] text-[10px] font-mono uppercase tracking-widest text-[#00C98D]/80">
                    {strings.hashGenerator.processEngine}
                  </span>
                </div>
                <p className="text-xs text-[#A5AFBF] mt-0.5 font-sans">
                  {strings.hashGenerator.outputSubtitle}
                </p>
              </div>`;

content = content.replace(outputHeaderTarget, outputHeaderReplacement);

fs.writeFileSync(file, content);
