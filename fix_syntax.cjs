const fs = require('fs');

let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf8');

const badBlock = `                    </div>
                  )}
                    </div>
                  )}
                </div>
              </div>`;

const goodBlock = `                    </div>
                  )}
                </div>
              </div>`;

if (code.includes(badBlock)) {
  code = code.replace(badBlock, goodBlock);
  fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
  console.log("Fixed syntax");
} else {
  console.log("Could not find bad block");
}
