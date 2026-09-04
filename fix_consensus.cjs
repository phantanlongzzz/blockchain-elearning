const fs = require('fs');

function replaceFile(path, replacements) {
  if (!fs.existsSync(path)) return;
  let code = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    code = code.split(search).join(replace);
  }
  fs.writeFileSync(path, code);
}

replaceFile('src/components/ConsensusEvolution/OralMessagesSimulation.tsx', [
  ["'Charlie (Nút trung gian / Phản bội)'", "'Charlie (Trung gian / Phản bội)'"],
  ["'1. Tính kháng chối bỏ (Non-repudiation)'", "'1. Tính kháng chối bỏ'"],
  ["'2. Tính toàn vẹn (Integrity)'", "'2. Tính toàn vẹn'"],
]);

replaceFile('src/components/ConsensusEvolution/PoWConsensusSection.tsx', [
  ["'Bằng chứng công việc (Proof of Work)'", "'Bằng chứng công việc'"],
  ["'Cuộc đua thợ đào song song (Live Miners Arena)'", "'Cuộc đua thợ đào song song'"],
  ["'Chuỗi khối chính thức (Canonical Chain):'", "'Chuỗi khối chính thức:'"],
  ["'Tiếp tục: Bằng chứng cổ phần (PoS)'", "'Tiếp tục: Bằng chứng cổ phần'"]
]);

replaceFile('src/components/ConsensusEvolution/PoWVsPoSInteractive.tsx', [
  ["'Vốn + Ký quỹ (Staking)'", "'Vốn và Ký quỹ'"]
]);

replaceFile('src/components/ConsensusEvolution/SignedMessagesSimulation.tsx', [
  ["'Nội dung thông điệp (Payload)'", "'Nội dung thông điệp'"],
  ["'1. Chi tiêu kép (Double spending)'", "'1. Chi tiêu kép'"],
  ["'2. Tấn công Sybil (Sybil attack)'", "'2. Tấn công Sybil'"],
  ["'Tiếp tục: Bằng chứng công việc (PoW)'", "'Tiếp tục: Bằng chứng công việc'"]
]);

replaceFile('src/components/ConsensusEvolution/PoSConsensusSection.tsx', [
  ["'Bằng chứng cổ phần (Proof of Stake)'", "'Bằng chứng cổ phần'"],
  ["'Mô phỏng Slashing (Dave)'", "'Mô phỏng trừng phạt (Dave)'"]
]);
