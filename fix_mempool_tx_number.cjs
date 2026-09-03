const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

code = code.replace(
  '<span className="font-mono text-xs font-semibold text-[#E7E9ED]">\n                        {tx.txNumber}\n                      </span>',
  '<span className="font-mono text-[11px] font-semibold text-[#E7E9ED] bg-[#0A0D11] border border-[#1B2027] px-1.5 py-0.5 rounded">\n                        {tx.txNumber}\n                      </span>'
);

code = code.replace(
  '<span className="font-mono text-xs font-semibold text-[#E7E9ED]">\n                        {tx.txNumber}\n                      </span>',
  '<span className="font-mono text-[11px] font-semibold text-[#E7E9ED] bg-[#0A0D11] border border-[#1B2027] px-1.5 py-0.5 rounded">\n                        {tx.txNumber}\n                      </span>'
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
