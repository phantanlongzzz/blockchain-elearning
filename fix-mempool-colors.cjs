const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

// 1. Transaction Simulation Amounts (around line 595)
// <div className="text-sm font-mono font-semibold text-[#00D084]">
code = code.replace(
  '<div className="text-sm font-mono font-semibold text-[#00D084]">',
  '<div className="text-sm font-mono font-semibold text-[#F5C451]">'
);

// <span className="text-rose-400">100.0 BTC (Bị sửa đổi!)</span>
code = code.replace(
  '<span className="text-rose-400">100.0 BTC (Bị sửa đổi!)</span>',
  '<span className="text-[#F5C451]">100.0 BTC <span className="text-rose-400">(Bị sửa đổi!)</span></span>'
);
// In English case (if any) or amber
code = code.replace(
  '<span className="text-amber-400">100.0 BTC</span>',
  '<span className="text-[#F5C451]">100.0 BTC</span>'
);

// 2. Wallet balances (line 700)
// <span className="font-mono text-[#00D084] font-medium">
code = code.replace(
  '<span className="font-mono text-[#00D084] font-medium">\n                      {acc.balance.toFixed(2)} BTC\n                    </span>',
  '<span className="font-mono text-[#F5C451] font-medium">\n                      {acc.balance.toFixed(2)} BTC\n                    </span>'
);

// 3. Accepted transaction summary (line 797)
// ({lastVerifiedTx.amount} BTC) -> (<span className="text-[#F5C451]">{lastVerifiedTx.amount} BTC</span>)
code = code.replace(
  '({lastVerifiedTx.amount} BTC)',
  '(<span className="text-[#F5C451]">{lastVerifiedTx.amount} BTC</span>)'
);

// 4. Mempool list (line 900)
// <span className="font-mono text-xs font-semibold text-[#00D084]">
code = code.replace(
  '<span className="font-mono text-xs font-semibold text-[#00D084]">\n                      {tx.amount} BTC\n                    </span>',
  '<span className="font-mono text-xs font-semibold text-[#F5C451]">\n                      {tx.amount} BTC\n                    </span>'
);

// 5. Rejected list (line 938)
// <span className="font-mono text-xs font-semibold text-rose-400">
code = code.replace(
  '<span className="font-mono text-xs font-semibold text-rose-400">\n                      {tx.amount} BTC\n                    </span>',
  '<span className="font-mono text-xs font-semibold text-[#F5C451]">\n                      {tx.amount} BTC\n                    </span>'
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
