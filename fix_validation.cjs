const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

code = code.replace(
  "<span>{isVi ? 'Lỗi' : 'Invalid'}</span>",
  "<span>{isVi ? 'Không hợp lệ' : 'Invalid'}</span>"
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
