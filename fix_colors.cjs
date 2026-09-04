const fs = require('fs');

function replaceFile(path, replacements) {
  let code = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    code = code.split(search).join(replace);
  }
  fs.writeFileSync(path, code);
}

replaceFile('src/components/EndToEndConsensus/TransactionMempoolBuilder.tsx', [
  ['<span>Fee: +{tx.feeBTC} BTC</span>', '<span className="text-[#F6C453]">Fee: +{tx.feeBTC} BTC</span>']
]);

replaceFile('src/components/EndToEndConsensus/BlockConstructionPanel.tsx', [
  ['+{totalCoinbase.toFixed(4)} BTC', '<span className="text-[#F6C453]">+{totalCoinbase.toFixed(4)} BTC</span>'],
  ['({baseRewardBTC} BTC cơ bản + {totalFees.toFixed(4)} BTC phí)', '(<span className="text-[#F6C453]">{baseRewardBTC} BTC</span> cơ bản + <span className="text-[#F6C453]">{totalFees.toFixed(4)} BTC</span> phí)']
]);

replaceFile('src/components/EndToEndConsensus/MempoolStep.tsx', [
  ['<td className="py-3 px-3 text-right font-mono text-zinc-300">', '<td className="py-3 px-3 text-right font-mono text-[#F6C453]">'],
  ['<span className="font-semibold text-zinc-100">{totalSelectedBTC.toFixed(3)} BTC</span>', '<span className="font-semibold text-[#F6C453]">{totalSelectedBTC.toFixed(3)} BTC</span>'],
  ['text-amber-400', 'text-[#F6C453]']
]);

replaceFile('src/components/EndToEndConsensus/FinalLedgerExplorer.tsx', [
  ['text-amber-400', 'text-[#F6C453]']
]);

replaceFile('src/components/EndToEndConsensus/TransactionCreateStep.tsx', [
  ['text-amber-400', 'text-[#F6C453]'],
  ['(Phí: +{lastCreatedTx.feeBTC} BTC)', '(Phí: <span className="text-[#F6C453]">+{lastCreatedTx.feeBTC} BTC</span>)']
]);

replaceFile('src/components/EndToEndConsensus/EndToEndConsensusLab.tsx', [
  ["(10 BTC → 999 BTC)", "(10 BTC → 999 BTC)"],
  ["0 BTC", "0 BTC"],
]);

