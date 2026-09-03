const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

const regex = /{isExpanded && \(\s*<div className="pt-2 mt-2 border-t border-\[#1B2027\] space-y-2 text-\[11px\] font-mono text-\[#9AA2AE\]">[\s\S]*?<\/div>\s*\)\s*}/;

const match = code.match(regex);
if (match) {
  const newCode = `{isExpanded && (
                    <div className="pt-3 mt-3 border-t border-[#1B2027] space-y-3">
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Địa chỉ ví' : 'Wallet Address'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-[#E7E9ED] font-mono text-[11px] break-all leading-relaxed">
                          {acc.address}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Khóa công khai' : 'Public Key'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-[#68717D] font-mono text-[11px] break-all leading-relaxed">
                          {acc.publicKey.slice(0, 48)}...
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[#68717D] flex items-center gap-1 font-sans text-[10px]">
                            <Lock className="w-3 h-3 text-[#68717D]" />
                            <span>{isVi ? 'Khóa riêng' : 'Private Key'}</span>
                          </span>
                          <button
                            onClick={() => setRevealedKeyAccount(isKeyRevealed ? null : acc.name)}
                            className="text-[#9AA2AE] hover:text-[#E7E9ED] flex items-center gap-1 font-sans cursor-pointer text-[10px]"
                          >
                            {isKeyRevealed ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>{isVi ? 'Ẩn khóa' : 'Hide Key'}</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>{isVi ? 'Hiện khóa' : 'Reveal Key'}</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-rose-400/90 font-mono text-[11px] break-all leading-relaxed">
                          {isKeyRevealed ? acc.privateKey : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                    </div>
                  )}`;
  
  code = code.replace(match[0], newCode);
  fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
  console.log("Successfully replaced!");
} else {
  console.log("Could not find regex match.");
}
