const fs = require('fs');
let code = fs.readFileSync('src/components/EndToEndConsensus/EndToEndConsensusLab.tsx', 'utf8');

code = code.replace(
  "{ step: 1, labelVi: '01 Giao dịch', labelEn: '01 Tx', nameVi: 'Tạo giao dịch', nameEn: 'Transaction' }",
  "{ step: 1, labelVi: '01 Giao dịch', labelEn: '01 Tx', nameVi: 'Tạo giao dịch', nameEn: 'Transaction' }"
);
code = code.replace(
  "{ step: 2, labelVi: '02 Mempool', labelEn: '02 Mempool', nameVi: 'Bể Mempool', nameEn: 'Mempool' }",
  "{ step: 2, labelVi: '02 Mempool', labelEn: '02 Mempool', nameVi: 'Bể giao dịch chờ', nameEn: 'Mempool' }"
);
code = code.replace(
  "{ step: 5, labelVi: '05 Lan truyền', labelEn: '05 P2P', nameVi: 'Lan truyền P2P', nameEn: 'P2P Broadcast' }",
  "{ step: 5, labelVi: '05 Lan truyền', labelEn: '05 P2P', nameVi: 'Lan truyền trong mạng P2P', nameEn: 'P2P Broadcast' }"
);
// All other steps are matching correctly.

// also "Tạo giao dịch mới" 
// with "(P2P)" in the transaction create step?
fs.writeFileSync('src/components/EndToEndConsensus/EndToEndConsensusLab.tsx', code);
