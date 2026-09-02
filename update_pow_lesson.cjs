const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

// Import the new component
content = content.replace(
  `import { SimulationCodeModal } from './SimulationCodeModal';`,
  `import { SimulationCodeModal } from './SimulationCodeModal';
import { SimulationNavigation } from './SimulationNavigation';`
);

// Remove the old navigation logic from PowLesson render
const oldNavStart = content.indexOf(`<div className="flex items-center gap-1.5 border-l border-slate-700 pl-3">`);
const oldNavEnd = content.indexOf(`</div>`, content.indexOf(`{focusedBlockIndex < blockchain.length - 1 && (`)) + 6;

if (oldNavStart !== -1 && oldNavEnd !== -1) {
  content = content.substring(0, oldNavStart) + `<SimulationNavigation 
                    currentIndex={focusedBlockIndex}
                    totalSteps={blockchain.length}
                    onPrevious={() => navigateTimeline('prev')}
                    onNext={() => navigateTimeline('next')}
                    onLatest={scrollToLatestBlock}
                    isVi={isVi}
                    prefix="#"
                  />` + content.substring(oldNavEnd);
}

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);

