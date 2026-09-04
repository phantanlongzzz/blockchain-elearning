const fs = require('fs');

function replaceFile(path, replacements) {
  let code = fs.readFileSync(path, 'utf8');
  for (const [search, replace] of replacements) {
    code = code.split(search).join(replace);
  }
  fs.writeFileSync(path, code);
}

replaceFile('src/components/EndToEndConsensus/LabRecorderTimeline.tsx', [
  ["return { label: 'CONSENSUS', class:", "return { label: language === 'vi' ? 'ĐỒNG THUẬN' : 'CONSENSUS', class:"],
  ["return { label: 'FAULT', class:", "return { label: language === 'vi' ? 'TIÊM LỖI' : 'FAULT', class:"],
  ["return { label: 'MINING', class:", "return { label: language === 'vi' ? 'ĐÀO KHỐI' : 'MINING', class:"],
  ["return { label: 'NETWORK', class:", "return { label: language === 'vi' ? 'MẠNG LƯỚI' : 'NETWORK', class:"],
  ["return { label: 'TX', class:", "return { label: language === 'vi' ? 'GIAO DỊCH' : 'TX', class:"]
]);

