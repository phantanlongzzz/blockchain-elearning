const fs = require('fs');
const files = [
  'src/components/TransactionVerification/MempoolDashboard.tsx',
  'src/components/TransactionLifecycle/Stage1Wallet.tsx',
  'src/components/TransactionLifecycle/Stage2BuildTx.tsx',
  'src/components/TransactionLifecycle/Stage3Mempool.tsx',
  'src/components/TransactionLifecycle/Stage4MineBlock.tsx',
  'src/components/TransactionLifecycle/MerkleTreeVisualizer.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/text-\\[#F5C451\\]/g, 'text-money');
  code = code.replace(/bg-\\[#F5C451\\]/g, 'bg-[var(--color-money)]');
  code = code.replace(/border-\\[#F5C451\\]/g, 'border-[var(--color-money)]');
  code = code.split('rgba(245,196,81').join('rgba(214,168,74');
  fs.writeFileSync(file, code);
}
