const fs = require('fs');
let code = fs.readFileSync('src/components/EndToEndConsensus/EducationalInsightBanner.tsx', 'utf8');

code = code.replace(
  "'Chữ ký số ECDSA cho phép người gửi xác thực quyền sở hữu coin mà không cần tiết lộ Private Key. Bất kỳ sự sửa đổi nào dù chỉ 1 bit trên giao dịch cũng khiến chữ ký trở nên vô giá trị.'",
  "'Chữ ký số ECDSA cho phép người gửi xác thực quyền sở hữu mà không cần tiết lộ khóa bí mật. Bất kỳ thay đổi nào, dù chỉ một bit trong giao dịch, đều khiến chữ ký trở nên không hợp lệ.'"
);

fs.writeFileSync('src/components/EndToEndConsensus/EducationalInsightBanner.tsx', code);
