const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  /const steps = \[([\s\S]*?)\];/,
  `const steps = [
    { step: 1, title: vStr.stepCreate, desc: vStr.stepCreateDesc, active: activeStep === 1 },
    { step: 2, title: vStr.stepSign, desc: vStr.stepSignDesc, active: activeStep === 2 },
    { step: 3, title: vStr.stepBroadcast, desc: vStr.stepBroadcastDesc, active: activeStep === 3 },
    { step: 4, title: vStr.stepAudit, desc: vStr.stepAuditDesc, active: activeStep === 4 },
    { step: 5, title: activeStep === 6 ? vStr.stepRejected : vStr.stepMempool, desc: activeStep === 6 ? vStr.stepRejectedDesc : vStr.stepMempoolDesc, active: activeStep === 5 || activeStep === 6, failed: activeStep === 6 },
  ];`
);

code = code.replace(
  `{stepIndex + 1} / {trace.length}`,
  `{isVi ? 'Bước' : 'Step'} {Math.max(1, Math.min(5, activeStep))} / 5`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
