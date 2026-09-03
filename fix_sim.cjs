const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

code = code.replace(
  '<span className="block text-[#68717D] mb-1">Transaction Digest (SHA-256)</span>',
  '<span className="block text-[#68717D] mb-1">{isVi ? "Mã băm giao dịch (SHA-256)" : "Transaction Digest (SHA-256)"}</span>'
);

code = code.replace(
  '<span className="text-xs font-mono">+ Private Key (Alice)</span>',
  '<span className="text-xs font-mono">+ {isVi ? "Khóa riêng" : "Private Key"} (Alice)</span>'
);

code = code.replace(
  '<span className="block text-[#00D084]/70 mb-1">Digital Signature (ECDSA)</span>',
  '<span className="block text-[#00D084]/70 mb-1">{isVi ? "Chữ ký số (ECDSA)" : "Digital Signature (ECDSA)"}</span>'
);

// Upgrade visual presentation for Digest
code = code.replace(
  '<div className="p-2 bg-[#0B0E12] rounded border border-[#1B2027] text-[10px] font-mono text-[#9AA2AE] break-all">',
  '<div className="p-3 bg-[#0A0D11] rounded border border-[#1B2027] text-[11px] font-mono text-sky-300/80 break-all leading-relaxed">'
);

// Upgrade visual presentation for Signature
code = code.replace(
  '<div className="p-2 bg-[#0B0E12] rounded border border-[#00D084]/30 text-[10px] font-mono text-[#00D084] break-all">',
  '<div className="p-3 bg-[#0A0D11] rounded border border-[#00D084]/30 text-[11px] font-mono text-[#00D084] break-all leading-relaxed">'
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
