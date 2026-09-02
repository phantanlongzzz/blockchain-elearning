const fs = require('fs');

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

// The file has:
//  useEffect(() => {
//    if (!isPlaying) {
//      if (elapsedSeconds === 0 && trunk.length === 1 && currentStageText !== (isVi ? 'Sẵn Sàng' : 'Ready')) {

content = content.replace(
  `useEffect(() => {
    if (!isPlaying) {`,
  `useEffect(() => {
    if (true) return; // Disable internal simulation entirely
    if (!isPlaying) {`
);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
