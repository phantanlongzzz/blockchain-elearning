const fs = require('fs');
let content = fs.readFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', 'utf8');

content = content.replace(
  `import React, { useState, useEffect, useRef, useCallback } from 'react';`,
  `import React, { useState, useEffect, useRef, useCallback } from 'react';\nimport { Network, Box } from 'lucide-react';`
);

fs.writeFileSync('src/components/ProofOfWork/P2PForkConsensusVisualizer.tsx', content);
