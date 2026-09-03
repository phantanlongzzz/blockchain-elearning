const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

// Replace "Kho Bạc Mạng Lưới (Treasury)" with "Kho bạc mạng lưới"
code = code.replace(/'Kho Bạc Mạng Lưới \(Treasury\)'/g, "'Kho bạc mạng lưới'");

const oldWalletDetails = `                  {isExpanded && (
                    <div className="pt-2 mt-2 border-t border-[#1B2027] space-y-2 text-[11px] font-mono text-[#9AA2AE]">
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px]">
                          {isVi ? 'Địa chỉ đầy đủ:' : 'Full address:'}
                        </span>
                        <span className="text-[#E7E9ED] break-all text-[10px]">{acc.address}</span>
                      </div>
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px]">
                          {isVi ? 'Khóa công khai (Public Key):' : 'Public Key:'}
                        </span>
                        <span className="text-[#00D084]/90 break-all text-[10px]">
                          {acc.publicKey.slice(0, 32)}...
                        </span>
                      </div>
                      <div className="pt-1.5 flex items-center justify-between border-t border-[#1B2027]/80 text-[10px]">
                        <span className="text-[#68717D] flex items-center gap-1 font-sans">
                          <Lock className="w-3 h-3 text-[#68717D]" />
                          <span>{isVi ? 'Khóa bí mật' : 'Private Key'}</span>
                        </span>
                        <button
                          onClick={() => setRevealedKeyAccount(isKeyRevealed ? null : acc.name)}
                          className="text-[#9AA2AE] hover:text-[#E7E9ED] flex items-center gap-1 font-sans cursor-pointer"
                        >
                          {isKeyRevealed ? (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>{isVi ? 'Ẩn' : 'Hide'}</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>{isVi ? 'Xem' : 'Reveal'}</span>
                            </>
                          )}
                        </button>
                      </div>
                      {isKeyRevealed && (
                        <div className="text-rose-400/90 break-all text-[10px]">
                          {acc.privateKey.slice(0, 32)}...
                        </div>
                      )}
                    </div>
                  )}`;

const newWalletDetails = `                  {isExpanded && (
                    <div className="pt-2 mt-2 border-t border-[#1B2027] space-y-3">
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Địa chỉ ví' : 'Wallet Address'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-[#E7E9ED] font-mono text-[11px] break-all">
                          {acc.address}
                        </div>
                      </div>
                      <div>
                        <span className="text-[#68717D] block font-sans text-[10px] mb-1">
                          {isVi ? 'Khóa công khai' : 'Public Key'}
                        </span>
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-blue-400 font-mono text-[11px] break-all">
                          {acc.publicKey.slice(0, 32)}...
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
                        <div className="bg-[#0A0D11] border border-[#1B2027] p-2 rounded text-rose-400/90 font-mono text-[11px] break-all">
                          {isKeyRevealed ? acc.privateKey.slice(0, 32) + '...' : '••••••••••••••••••••••••••••••••'}
                        </div>
                      </div>
                    </div>
                  )}`;

if (code.includes(oldWalletDetails.trim().substring(0, 50))) {
  code = code.replace(oldWalletDetails, newWalletDetails);
  console.log("Successfully replaced wallet details");
} else {
  console.log("Could not find the exact old code block.");
}

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
