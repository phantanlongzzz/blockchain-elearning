const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /'Chữ ký không hợp lệ: Dữ liệu giao dịch đã bị chỉnh sửa sau khi ký'/,
  `'Chữ ký không hợp lệ: Dữ liệu giao dịch đã bị thay đổi sau khi ký.'`
);

code = code.replace(
  /\`Số dư không đủ: Tài khoản có \$\{sAcc\.balance\} BTC, cần chuyển \$\{broadcastPayload\.amount\} BTC\`/,
  `'Số dư khả dụng không đủ để thực hiện giao dịch.'`
);

code = code.replace(
  /'Phát hiện tấn công phát lại: Chữ ký hoặc Nonce đã được thực hiện trước đó'/,
  `'Phát hiện giao dịch trùng lặp: Nonce hoặc chữ ký đã được xử lý trước đó.'`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
