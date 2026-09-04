const fs = require('fs');

function replaceFile(path, replacements) {
  let code = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    code = code.split(search).join(replace);
  }
  fs.writeFileSync(path, code);
}

replaceFile('src/components/EndToEndConsensus/BlockConstructionPanel.tsx', [
  ["'Mã băm khối trước (Previous Hash)'", "'Mã băm của khối trước'"],
  ['title="Sao chép Previous Hash"', 'title="Sao chép mã băm của khối trước"']
]);

replaceFile('src/components/EndToEndConsensus/NetworkBroadcastGraph.tsx', [
  ['Previous Hash, Merkle Root và PoW.', 'mã băm của khối trước, Cây Merkle và PoW.'],
  ['>Previous Hash<', '>{language === \'vi\' ? \'Mã băm khối trước\' : \'Previous Hash\'}<']
]);

replaceFile('src/components/EndToEndConsensus/NodeInspectorModal.tsx', [
  ['(1) Previous Hash trùng khớp', '(1) Mã băm của khối trước trùng khớp'],
  ['1. Previous Hash = Tip', '1. Mã băm khối trước = Đỉnh chuỗi']
]);

replaceFile('src/components/EndToEndConsensus/FaultInjectionPanel.tsx', [
  ["titleEn: '3. Next Block Previous Hash Mismatch',", "titleEn: '3. Next Block Previous Hash Mismatch',"],
  // Just in case I missed it previously
]);

replaceFile('src/components/EndToEndConsensus/EducationalInsightBanner.tsx', [
  ['(Previous Hash, Merkle Root, Chữ ký số, PoW)', '(Mã băm khối trước, Cây Merkle, Chữ ký số, PoW)'],
  ['lưu trữ Previous Hash của khối trước', 'lưu trữ mã băm của khối trước đó']
]);

replaceFile('src/components/EndToEndConsensus/EndToEndConsensusLab.tsx', [
  ['con trỏ Previous Hash của Khối', 'liên kết mã băm của khối trước tại Khối']
]);

