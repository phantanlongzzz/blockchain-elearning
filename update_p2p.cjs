const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

const importReplacement = `import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Network, Box } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { SimulationNavigation } from './SimulationNavigation';`;

content = content.replace(
  `import React, { useState, useEffect, useRef, useCallback } from 'react';\nimport { Network, Box } from 'lucide-react';\nimport { useLanguage } from '../../i18n/LanguageContext';`,
  importReplacement
);

// If it doesn't match perfectly, just try to replace `import { useLanguage }` with `import { useLanguage }\nimport { SimulationNavigation }`
if (content.indexOf(`import { SimulationNavigation }`) === -1) {
  content = content.replace(`import { useLanguage } from '../../i18n/LanguageContext';`, `import { useLanguage } from '../../i18n/LanguageContext';\nimport { SimulationNavigation } from './SimulationNavigation';`);
}

const propsReplacement = `export interface P2PForkConsensusVisualizerProps {
  blockchain: any[];
  appState: string;
  focusedBlockIndex: number;
  navigateTimeline: (direction: 'prev' | 'next') => void;
  scrollToLatestBlock: () => void;
}`;

content = content.replace(
  `export interface P2PForkConsensusVisualizerProps {
  blockchain: any[];
  appState: string;
}`,
  propsReplacement
);

const componentDefReplacement = `export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ 
  blockchain, 
  appState,
  focusedBlockIndex,
  navigateTimeline,
  scrollToLatestBlock
}) => {`;

content = content.replace(
  `export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ blockchain, appState }) => {`,
  componentDefReplacement
);

// Sliced blockchain to compute trunk
const trunkDefRegex = /const trunk: P2PBlock\[\] = blockchain\.length > 0 \? blockchain\.map\(\(b, i\) => \(\{[^]+?\}\)\) : \[\{ \.\.\.GENESIS_BLOCK \}\];/;
const newTrunkDef = `const visibleBlockchain = blockchain.slice(0, focusedBlockIndex + 1);
  const trunk: P2PBlock[] = visibleBlockchain.length > 0 ? visibleBlockchain.map((b, i) => ({
    id: \`block-\${b.index}\`,
    blockNumber: b.index,
    displayNumber: \`\${b.index}\`,
    height: b.index,
    minerName: b.minerName || 'Genesis',
    minerRole: 'Miner',
    branch: 'trunk',
    status: 'canonical',
    isLeading: i === visibleBlockchain.length - 1,
    hash: b.hash,
    prevHash: b.prevHash,
    merkleRoot: '...',
    nonce: b.nonce,
    timestamp: b.timestamp,
    txs: [],
    coinbaseReward: 6.25,
    cumulativeWork: b.index
  })) : [{ ...GENESIS_BLOCK }];`;

content = content.replace(trunkDefRegex, newTrunkDef);

// Add Navigation UI
const navStart = content.indexOf(`<div className="flex flex-wrap items-center gap-2.5">`);
const navEnd = content.indexOf(`</div>`, navStart) + 6;

const newNav = `<div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/50 border border-slate-700/50 mr-2">
              <Network size={12} className="text-emerald-400" />
              <span className="text-xs font-mono text-slate-300">4 {isVi ? 'Nút' : 'Nodes'}</span>
            </div>
            <SimulationNavigation 
              currentIndex={focusedBlockIndex}
              totalSteps={blockchain.length}
              onPrevious={() => navigateTimeline('prev')}
              onNext={() => navigateTimeline('next')}
              onLatest={scrollToLatestBlock}
              isVi={isVi}
              prefix="#"
            />
          </div>`;

if (navStart !== -1) {
  content = content.substring(0, navStart) + newNav + content.substring(navEnd);
}

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
