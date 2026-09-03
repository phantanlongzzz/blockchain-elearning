const fs = require('fs');

let content = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

// I will insert a new panel right after the Pipeline Visualization.

const insertionPoint = `        {/* Global Network Stats */}`;

const newPanel = `
        {/* Current Transaction Simulation Context */}
        {activeStep >= 1 && (
          <div id="step-create" className="lg:col-span-3 p-5 rounded-xl bg-[#090C10] border border-[#1B2027] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1B2027]">
              <span className="text-sm font-semibold text-[#E7E9ED]">
                {isVi ? 'Giao dịch đang mô phỏng' : 'Current Simulation Context'}
              </span>
              <span className="text-xs text-[#00D084] font-mono">
                {activeStep === 1 && (isVi ? 'Đang tạo...' : 'Creating...')}
                {activeStep === 2 && (isVi ? 'Đang ký...' : 'Signing...')}
                {activeStep === 3 && (isVi ? 'Truyền P2P...' : 'Broadcasting...')}
                {activeStep >= 4 && (isVi ? 'Đang xác thực...' : 'Validating...')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
               {/* Payload block */}
               <div className="p-3 rounded-lg bg-[#0F1217] border border-[#252B33] flex flex-col gap-2">
                 <div className="text-xs text-[#68717D]">{isVi ? 'Người gửi' : 'Sender'}</div>
                 <div className="text-sm font-semibold text-[#E7E9ED]">Alice</div>
                 <div className="text-xs text-[#68717D] mt-2">{isVi ? 'Người nhận' : 'Receiver'}</div>
                 <div className="text-sm font-semibold text-[#E7E9ED]">Bob</div>
                 <div className="text-xs text-[#68717D] mt-2">{isVi ? 'Số tiền' : 'Amount'}</div>
                 <div className="text-sm font-mono font-semibold text-[#00D084]">
                   {selectedScenario === 'TAMPERED' && activeStep >= 3 ? (
                      <span className="text-rose-400">100.0 BTC (Bị sửa đổi!)</span>
                   ) : selectedScenario === 'INSUFFICIENT' ? (
                      <span className="text-amber-400">100.0 BTC</span>
                   ) : (
                      <span>10.0 BTC</span>
                   )}
                 </div>
               </div>

               {/* Signing block */}
               {activeStep >= 2 && (
                 <div id="step-sign" className="p-3 rounded-lg bg-[#0F1217] border border-[#252B33] flex flex-col gap-2 col-span-1 sm:col-span-2 lg:col-span-3">
                   <div className="text-xs text-[#68717D]">{isVi ? 'Quá trình ký (Mô phỏng)' : 'Signing Process (Simulated)'}</div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                     <div className="p-2 bg-[#0B0E12] rounded border border-[#1B2027] text-[10px] font-mono text-[#9AA2AE] break-all">
                       <span className="block text-[#68717D] mb-1">Transaction Digest (SHA-256)</span>
                       a94f82c1...
                     </div>
                     <div className="hidden md:flex justify-center text-[#68717D]">
                        <span className="text-xs font-mono">+ Private Key (Alice)</span>
                     </div>
                     <div className="p-2 bg-[#0B0E12] rounded border border-[#00D084]/30 text-[10px] font-mono text-[#00D084] break-all">
                       <span className="block text-[#00D084]/70 mb-1">Digital Signature (ECDSA)</span>
                       30450221008f...9e21
                     </div>
                   </div>
                 </div>
               )}
            </div>

            {/* P2P Broadcast animation block */}
            {activeStep === 3 && (
               <div id="step-broadcast" className="p-4 rounded-lg bg-[#0F1217] border border-[#252B33] flex items-center justify-center h-24">
                  <div className="flex items-center gap-6 animate-pulse">
                     <div className="text-xs font-semibold text-[#E7E9ED]">Alice</div>
                     <div className="text-[#00D084] text-xs">───► (P2P Network) ───►</div>
                     <div className="flex gap-4 text-xs font-mono text-[#68717D]">
                       <span>Node A</span>
                       <span>Node B</span>
                       <span>Node C</span>
                     </div>
                  </div>
               </div>
            )}
          </div>
        )}

`;

content = content.replace(insertionPoint, newPanel + insertionPoint);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', content);
console.log('Added simulation context blocks.');
