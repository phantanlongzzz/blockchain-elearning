const fs = require('fs');
let code = fs.readFileSync('src/components/EndToEndConsensus/FaultInjectionPanel.tsx', 'utf8');

code = code.replace(
  "'Hệ thống tiêm lỗi & Phân tích nguyên nhân (Failure Injection & Causality)'",
  "'Hệ thống tiêm lỗi và phân tích nguyên nhân'"
);
code = code.replace(
  "'Mô phỏng các cuộc tấn công và quan sát phản ứng dây chuyền bảo vệ của mạng phi tập trung.'",
  "'Mô phỏng các tình huống tấn công và quan sát phản ứng dây chuyền của cơ chế bảo vệ trong mạng phi tập trung.'"
);

code = code.replace(
  "language === 'vi' ? 'Sửa dữ liệu Khối #1' : 'Tamper Block #1'",
  "language === 'vi' ? 'Sửa dữ liệu Khối #1' : 'Tamper Block #1'"
);
code = code.replace(
  "<span className=\"font-mono\">Tx Tamper</span>",
  "<span className=\"font-mono\">{language === 'vi' ? 'Can thiệp giao dịch' : 'Tx Tamper'}</span>"
);
code = code.replace(
  "language === 'vi' ? 'Thay đổi số tiền giao dịch khối #1 thành 999 BTC' : 'Change block #1 tx amount to 999 BTC'",
  "language === 'vi' ? 'Thay đổi số tiền giao dịch từ 10 BTC thành 999 BTC.' : 'Change block #1 tx amount to 999 BTC.'"
);

code = code.replace(
  "language === 'vi' ? 'Làm hỏng mã Hash' : 'Corrupt Block Hash'",
  "language === 'vi' ? 'Làm hỏng mã băm' : 'Corrupt Block Hash'"
);
code = code.replace(
  "<span className=\"font-mono\">Hash Mismatch</span>",
  "<span className=\"font-mono\">{language === 'vi' ? 'Mã băm không khớp' : 'Hash Mismatch'}</span>"
);
code = code.replace(
  "language === 'vi' ? 'Sửa 1 byte trong mã băm khối #1' : 'Flip 1 byte in block #1 hash'",
  "language === 'vi' ? 'Thay đổi ngẫu nhiên một ký tự trong mã băm của khối.' : 'Randomly change one character in the block hash.'"
);

code = code.replace(
  "language === 'vi' ? 'Ngắt kết nối nút (Kill Node)' : 'Isolate Node'",
  "language === 'vi' ? 'Ngắt kết nối nút' : 'Isolate Node'"
);
code = code.replace(
  "<span className=\"font-mono\">P2P Partition</span>",
  "<span className=\"font-mono\">{language === 'vi' ? 'Phân vùng mạng P2P' : 'P2P Partition'}</span>"
);

// P2P offline status
code = code.replace(
  "? 'Bob: Offline'",
  "? 'Bob: Ngoại tuyến'"
);
code = code.replace(
  ": 'Bob: Online'",
  ": 'Bob: Trực tuyến'"
);

// Causality Graph
code = code.replace(
  "'Sơ đồ quan hệ nhân quả (Causality Graph)'",
  "'Sơ đồ nguyên nhân và kết quả'"
);
code = code.replace(
  "'2. Băm mật mã thay đổi (Avalanche Effect)'",
  "'2. Hiệu ứng thác lũ của mã băm'"
);
code = code.replace(
  "'3. Sai khớp Previous Hash khối kế tiếp'",
  "'3. Sai khớp mã băm của khối trước'"
);
code = code.replace(
  "'Liên kết mã Hash giữa các khối không còn hợp lệ.'",
  "'Liên kết mã băm giữa các khối không còn hợp lệ.'"
);

// Need to make sure there are no other Online/Offline hardcoded in FaultInjectionPanel.tsx. 
fs.writeFileSync('src/components/EndToEndConsensus/FaultInjectionPanel.tsx', code);
