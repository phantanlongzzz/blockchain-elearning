const fs = require('fs');

let code = fs.readFileSync('src/data/researchData.ts', 'utf8');

code = code.replace(
  'GENESIS BLOCK #0: Blockchain Elearning (Phan Tấn Long · CTK47B)',
  'GENESIS BLOCK #0: Blockchain Elearning (Genesis Node)'
);

code = code.replace(
  'Block #1: Tx: Phan Tấn Long -> Faculty Treasury [10.0 BTC]',
  'Block #1: Tx: Alice -> Charlie [10.0 BTC]'
);

code = code.replace(
  'Block #2: Tx: Student Lab -> Peer Reviewer Node [2.5 BTC]',
  'Block #2: Tx: Bob -> Dave [2.5 BTC]'
);

fs.writeFileSync('src/data/researchData.ts', code);
