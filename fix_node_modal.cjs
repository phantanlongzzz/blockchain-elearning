const fs = require('fs');
let code = fs.readFileSync('src/components/EndToEndConsensus/NodeInspectorModal.tsx', 'utf8');

code = code.replace(
  "Offline (Đã ngắt kết nối)",
  "{language === 'vi' ? 'Ngoại tuyến' : 'Offline'}"
);
code = code.replace(
  "Online (Trực tuyến)",
  "{language === 'vi' ? 'Trực tuyến' : 'Online'}"
);

fs.writeFileSync('src/components/EndToEndConsensus/NodeInspectorModal.tsx', code);
