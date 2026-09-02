const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

// Replace export
content = content.replace(
  `export const P2PForkConsensusVisualizer: React.FC = () => {`,
  `export interface P2PForkConsensusVisualizerProps {
  blockchain: any[];
  appState: string;
}

export const P2PForkConsensusVisualizer: React.FC<P2PForkConsensusVisualizerProps> = ({ blockchain, appState }) => {`
);

// We need to map blockchain to trunk!
// Let's remove the internal state for trunk, activeFork, staleBranches, etc.
// But first, let's see how much we can just override.

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
