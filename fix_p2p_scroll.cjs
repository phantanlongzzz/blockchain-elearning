const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

content = content.replace(
  `useEffect(() => {
    if (treeScrollRef.current) {
      treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [trunk.length]);`,
  `useEffect(() => {
    if (treeScrollRef.current) {
      const blockEl = document.getElementById(\`p2p-block-\${focusedBlockIndex}\`);
      if (blockEl) {
        blockEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      } else {
        treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
      }
    }
  }, [focusedBlockIndex, trunk.length]);`
);

content = content.replace(
  `<div key={blk.id} className="relative flex flex-col items-center group">`,
  `<div key={blk.id} id={\`p2p-block-\${blk.blockNumber}\`} className="relative flex flex-col items-center group">`
);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
