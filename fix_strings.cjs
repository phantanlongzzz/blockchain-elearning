const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

code = code.replace(/Khóa công khai \(Public Key\):/g, 'Khóa công khai');
code = code.replace(/Khóa công khai \(Public Key\)/g, 'Khóa công khai');
code = code.replace(/Khóa bí mật/g, 'Khóa riêng');
code = code.replace(/Đào khối \(Mine Block\)/g, 'Đào khối');
code = code.replace(/Làm mới \(Reset\)/g, 'Đặt lại');

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
