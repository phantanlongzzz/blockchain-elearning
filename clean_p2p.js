const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

// Strip out everything between `const treeScrollRef` and `return (`
const startIdx = content.indexOf(`  const treeScrollRef = useRef<HTMLDivElement>(null);`);
const returnIdx = content.indexOf(`  return (`);

if (startIdx !== -1 && returnIdx !== -1) {
  content = content.substring(0, startIdx) + `  
  const treeScrollRef = useRef<HTMLDivElement>(null);
  const mempoolScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (treeScrollRef.current) {
      treeScrollRef.current.scrollTo({ left: treeScrollRef.current.scrollWidth, behavior: 'smooth' });
    }
  }, [trunk.length]);

` + content.substring(returnIdx);
}
fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
