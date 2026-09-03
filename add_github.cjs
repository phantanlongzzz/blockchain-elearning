const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Add Github to lucide-react import
code = code.replace(
  '  RotateCcw,\n} from \'lucide-react\';',
  '  RotateCcw,\n  Github,\n} from \'lucide-react\';'
);

// Add the GitHub link
const targetBlock = `<span className="font-mono">ID: 2312679</span>`;
const newBlock = `<span className="font-mono">ID: 2312679</span>
            <span className="text-[#3f3f46]">·</span>
            <a
              href="https://github.com/phantanlongzzz/blockchain-elearning"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#00C98D] hover:text-[#00C98D] hover:brightness-110 hover:border-b hover:border-[#00C98D]/40 transition-all duration-200 cursor-pointer"
            >
              <Github className="w-3 h-3" />
              <span>Source Code ↗</span>
            </a>`;

if (code.includes(targetBlock)) {
  code = code.replace(targetBlock, newBlock);
  fs.writeFileSync('src/components/Hero.tsx', code);
  console.log("Successfully updated Hero.tsx");
} else {
  console.log("Could not find target block in Hero.tsx");
}
