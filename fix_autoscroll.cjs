const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

// Add a new useEffect to scroll on trunk change
content = content.replace(
  `  const moveCameraToFocus = useCallback(() => {`,
  `  useEffect(() => {
    moveCameraToFocus();
  }, [trunk.length]);

  const moveCameraToFocus = useCallback(() => {`
);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
