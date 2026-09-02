const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

content = content.replace(
  `<P2PForkConsensusVisualizer blockchain={blockchain} appState={appState} />`,
  `<P2PForkConsensusVisualizer 
              blockchain={blockchain} 
              appState={appState}
              focusedBlockIndex={focusedBlockIndex}
              navigateTimeline={navigateTimeline}
              scrollToLatestBlock={scrollToLatestBlock}
            />`
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
