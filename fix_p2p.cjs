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

// Map blockchain to trunk
content = content.replace(
  `const [trunk, setTrunk] = useState<P2PBlock[]>([{ ...GENESIS_BLOCK }]);`,
  `const trunk: P2PBlock[] = blockchain.length > 0 ? blockchain.map((b, i) => ({
    id: \`block-\${b.index}\`,
    blockNumber: b.index,
    displayNumber: \`\${b.index}\`,
    height: b.index,
    minerName: b.minerName || 'Genesis',
    minerRole: 'Miner',
    branch: 'trunk',
    status: 'canonical',
    isLeading: i === blockchain.length - 1,
    hash: b.hash,
    prevHash: b.prevHash,
    merkleRoot: '...',
    nonce: b.nonce,
    timestamp: b.timestamp,
    txs: [],
    coinbaseReward: 6.25,
    cumulativeWork: b.index
  })) : [{ ...GENESIS_BLOCK }];`
);

// We need to disable the internal simulation hooks!
content = content.replace(
  `useEffect(() => {
    if (!isPlaying) return;`,
  `useEffect(() => {
    if (true) return; // Disable internal simulation`
);

// Remove the control UI section entirely, since PowLesson handles it now.
const controlsStart = content.indexOf(`{/* Controls Header */}`);
const controlsEnd = content.indexOf(`{/* Global Progress & Status */}`);
if (controlsStart !== -1 && controlsEnd !== -1) {
  content = content.substring(0, controlsStart) + content.substring(controlsEnd);
}

// Replace the activeFork mapping with null
content = content.replace(
  `const [activeFork, setActiveFork] = useState<{ branchA: P2PBlock[], branchB: P2PBlock[] } | null>(null);`,
  `const activeFork = null;`
);

content = content.replace(
  `const [staleBranches, setStaleBranches] = useState<P2PBlock[][]>([]);`,
  `const staleBranches: P2PBlock[][] = [];`
);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
