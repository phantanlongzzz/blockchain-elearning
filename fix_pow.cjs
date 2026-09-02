const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

content = content.replace(
  `<P2PForkConsensusVisualizer />`,
  `<P2PForkConsensusVisualizer blockchain={blockchain} appState={appState} />`
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
