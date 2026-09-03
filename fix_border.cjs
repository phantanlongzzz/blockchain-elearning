const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  'className="inline-flex items-center gap-1 text-[#00C98D] hover:text-[#00C98D] hover:brightness-110 hover:border-b hover:border-[#00C98D]/40 transition-all duration-200 cursor-pointer"',
  'className="inline-flex items-center gap-1 text-[#00C98D] hover:text-[#00C98D] hover:brightness-110 border-b border-transparent hover:border-[#00C98D]/40 transition-all duration-200 cursor-pointer"'
);

fs.writeFileSync('src/components/Hero.tsx', code);
