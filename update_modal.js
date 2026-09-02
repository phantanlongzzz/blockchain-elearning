import fs from 'fs';

let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf-8');

// We will use replace to do chunk edits safely

// Replace Header Controls
const headerTarget = `<div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#11161D] border border-slate-800 rounded-2xl p-3 gap-3">`;
const headerReplacement = `<div className="flex flex-col sm:flex-row sm:items-center justify-between bg-transparent gap-4">`;

content = content.replace(headerTarget, headerReplacement);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
