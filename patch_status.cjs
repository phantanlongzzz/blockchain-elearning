const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /{activeStep >= 4 && \(isVi \? 'Đang xác thực\.\.\.' : 'Validating\.\.\.'\)}/,
  `{activeStep === 4 && (isVi ? 'Đang xác thực...' : 'Validating...')}
                {activeStep === 5 && (isVi ? 'Đã chấp nhận' : 'Accepted')}
                {activeStep === 6 && (isVi ? 'Bị từ chối' : 'Rejected')}`
);

// also fix the steps display.
code = code.replace(
  `{stepIndex + 1} / {trace.length}`,
  `{stepIndex + 1} / {trace.length}`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
