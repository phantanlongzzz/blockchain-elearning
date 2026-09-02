const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/PowLesson.tsx', 'utf8');

content = content.replace(
  `// Auto-focus rule: return focus to the new event (new block mined)`,
  `// Auto-focus rule: return focus to the new event (new block mined)
    setFocusedBlockIndex(blockchain.length - 1);`
);

content = content.replace(
  `const scrollToLatestBlock = () => {
    userScrolledAwayRef.current = false;
    setIsAutoFollowPaused(false);
    setAutoFollow(true);`,
  `const scrollToLatestBlock = () => {
    userScrolledAwayRef.current = false;
    setIsAutoFollowPaused(false);
    setAutoFollow(true);
    setFocusedBlockIndex(blockchain.length - 1);`
);

fs.writeFileSync('src/components/ProofOfWork/PowLesson.tsx', content);
