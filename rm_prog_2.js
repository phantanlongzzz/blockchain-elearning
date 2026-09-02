import fs from 'fs';

const file = 'src/components/BlockArchitecture/BlockArchitectureLab.tsx';
let content = fs.readFileSync(file, 'utf-8');

const target = `          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#A5AFBF]">
                {isVi ? 'Tiến độ chuyên đề:' : 'Module Progress:'}{' '}
                <span className="text-emerald-400 font-semibold">
                  {completedCount}/{STAGES.length} {isVi ? 'phần hoàn thành' : 'sections completed'}
                </span>
              </span>
              <span className="text-emerald-400 font-semibold">{progressPercent}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-[#080B10] overflow-hidden border border-[#1C2430]">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: \`\${progressPercent}%\` }}
              />
            </div>
          </div>`;

content = content.replace(target, '');
fs.writeFileSync(file, content);
