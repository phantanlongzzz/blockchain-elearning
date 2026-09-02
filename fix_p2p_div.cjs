const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

const target = `            />
          </div>
          </div>`;

content = content.replace(target, `            />
          </div>`);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
