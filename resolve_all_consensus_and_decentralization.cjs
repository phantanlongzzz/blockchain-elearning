const fs = require('fs');

function replaceInFile(filePath, regexReplacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const [regex, replacement] of regexReplacements) {
    content = content.replace(regex, replacement);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[UPDATED] ${filePath}`);
  }
}

// 1. ConsensusEvolution (ByzantineGeneralsLab, OralMessagesSimulation, PoSConsensusSection, PoWConsensusSection, SignedMessagesSimulation)
replaceInFile('src/components/ConsensusEvolution/ByzantineGeneralsLab.tsx', [
  [/text-emerald-400 font-bold/g, 'text-text-primary font-bold'],
  [/text-emerald-400 font-medium/g, 'text-text-primary font-medium'],
  [/text-emerald-400/g, 'text-text-secondary']
]);

replaceInFile('src/components/ConsensusEvolution/OralMessagesSimulation.tsx', [
  [/text-emerald-400(?=")/g, 'text-text-secondary'],
  [/text-emerald-400(?=\s*)/g, 'text-text-secondary']
]);

replaceInFile('src/components/ConsensusEvolution/PoSConsensusSection.tsx', [
  [/text-emerald-400(?=")/g, 'text-text-secondary'],
  [/text-emerald-300(?=")/g, 'text-text-primary']
]);

replaceInFile('src/components/ConsensusEvolution/PoWConsensusSection.tsx', [
  [/text-emerald-400/g, 'text-text-primary'],
  [/text-emerald-300/g, 'text-text-secondary'],
  [/bg-emerald-500\/20/g, 'bg-white/[0.08]']
]);

replaceInFile('src/components/ConsensusEvolution/SignedMessagesSimulation.tsx', [
  [/messageData === 'ATTACK' \? 'text-rose-400' : 'text-emerald-400'/g, "messageData === 'ATTACK' ? 'text-rose-400' : 'text-success'"],
  [/text-emerald-400/g, 'text-text-secondary']
]);

// 2. DecentralizationEvolution (BitcoinEcosystemLab, BuildBlockchainLab, DecentralizationEvolutionLab, DoubleSpendingLab, FinalChallengeSection, MoneyEvolutionSection, TrustProblemSimulation)
replaceInFile('src/components/DecentralizationEvolution/BitcoinEcosystemLab.tsx', [
  [/node\.isOnline \? 'bg-emerald-500\/20 text-emerald-300' : 'bg-rose-500\/20 text-rose-300'/g, "node.isOnline ? 'bg-success/20 text-success' : 'bg-rose-500/20 text-rose-300'"],
  [/text-emerald-400/g, 'text-text-primary']
]);

replaceInFile('src/components/DecentralizationEvolution/BuildBlockchainLab.tsx', [
  [/bg-emerald-500\/20 text-emerald-300/g, 'bg-white/[0.08] text-text-primary'],
  [/text-emerald-400/g, 'text-text-secondary'],
  [/text-emerald-300/g, 'text-text-primary']
]);

replaceInFile('src/components/DecentralizationEvolution/DecentralizationEvolutionLab.tsx', [
  [/text-emerald-400\/80/g, 'text-text-secondary'],
  [/text-emerald-400/g, 'text-text-primary'],
  [/bg-emerald-500\/20/g, 'bg-white/[0.08]']
]);

replaceInFile('src/components/DecentralizationEvolution/DoubleSpendingLab.tsx', [
  [/bg-emerald-500\/20 text-emerald-300/g, 'bg-white/[0.08] text-text-primary'],
  [/bg-emerald-500\/20 text-emerald-400/g, 'bg-white/[0.08] text-text-primary'],
  [/text-emerald-400/g, 'text-text-primary'],
  [/text-emerald-200/g, 'text-text-secondary']
]);

replaceInFile('src/components/DecentralizationEvolution/FinalChallengeSection.tsx', [
  [/text-emerald-400/g, 'text-text-primary']
]);

replaceInFile('src/components/DecentralizationEvolution/MoneyEvolutionSection.tsx', [
  [/text-emerald-400/g, 'text-text-primary'],
  [/bg-emerald-500\/20/g, 'bg-white/[0.08]']
]);

replaceInFile('src/components/DecentralizationEvolution/TrustProblemSimulation.tsx', [
  [/isFractionalReserveExceeded \? 'text-rose-400 animate-pulse' : 'text-emerald-400'/g, "isFractionalReserveExceeded ? 'text-rose-400 animate-pulse' : 'text-success'"],
  [/totalPaperClaims > 0 \? \(vaultGold \/ totalPaperClaims < 1 \? 'text-rose-400' : 'text-emerald-400'\) : 'text-slate-400'/g, "totalPaperClaims > 0 ? (vaultGold / totalPaperClaims < 1 ? 'text-rose-400' : 'text-success') : 'text-slate-400'"],
  [/text-emerald-400/g, 'text-text-primary'],
  [/bg-emerald-500\/20/g, 'bg-white/[0.08]']
]);

// 3. Any leftovers
replaceInFile('src/components/EndToEndConsensus/ConcurrentMiningArena.tsx', [
  [/text-emerald-400(?=<\/span>\s*KH\/s)/g, 'text-financial font-mono font-semibold']
]);

replaceInFile('src/components/EndToEndConsensus/EducationalInsightBanner.tsx', [
  [/<Sparkles className="w-3 h-3 text-emerald-400" \/>/g, '<Sparkles className="w-3 h-3 text-text-muted" />']
]);

replaceInFile('src/components/EndToEndConsensus/FinalLedgerExplorer.tsx', [
  [/isTampered \? 'text-rose-400' : 'text-emerald-400'/g, "isTampered ? 'text-rose-400' : 'text-text-muted'"],
  [/isTampered \? 'text-rose-400 font-semibold' : 'text-emerald-400 font-medium'/g, "isTampered ? 'text-rose-400 font-semibold' : 'text-text-primary font-medium'"],
  [/text-emerald-400(?=')/g, 'text-text-primary']
]);

replaceInFile('src/components/Foundations/CryptographyFoundations.tsx', [
  [/<span className="text-emerald-400">Hợp lệ: Đúng chữ ký của Alice<\/span>/g, '<span className="text-success font-medium">Hợp lệ: Đúng chữ ký của Alice</span>']
]);

replaceInFile('src/components/Foundations/LinkedListVsBlockchain.tsx', [
  [/<div className="text-emerald-400 font-medium">\{item\.blockchain\[language\]\}<\/div>/g, '<div className="text-text-primary font-medium">{item.blockchain[language]}</div>']
]);

console.log("Consensus and Decentralization cleaned.");
