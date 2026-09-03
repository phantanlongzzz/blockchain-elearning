const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

code = code.replace(
  '<div className="text-[11px] font-mono text-[#68717D]">\n                      Sig: {tx.signature.slice(0, 14)}... · Nonce: {tx.nonce}\n                    </div>',
  '<div className="text-[11px] font-mono text-[#68717D]">\n                      Sig: <span className="text-[#E7E9ED] bg-[#1A2028] px-1 py-0.5 rounded">{tx.signature.slice(0, 14)}...</span> · Nonce: <span className="text-[#E7E9ED] bg-[#1A2028] px-1 py-0.5 rounded">{tx.nonce}</span>\n                    </div>'
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
