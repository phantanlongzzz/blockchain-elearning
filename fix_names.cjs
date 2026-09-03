const fs = require('fs');

let code = fs.readFileSync('src/data/transactionData.ts', 'utf8');

code = code.replace(
  "name: 'Phan Tấn Long (Lead Researcher)'",
  "name: 'Alice'"
);
code = code.replace(
  "id: 'wallet-long'",
  "id: 'wallet-alice'"
);

code = code.replace(
  "name: 'CTK47B Academic Node'",
  "name: 'Bob'"
);
code = code.replace(
  "id: 'wallet-ctk47b'",
  "id: 'wallet-bob'"
);

code = code.replace(
  "name: 'Faculty Research Treasury'",
  "name: 'Charlie'"
);
code = code.replace(
  "id: 'wallet-treasury'",
  "id: 'wallet-charlie'"
);

code = code.replace(
  "name: 'Peer Review Verification Node'",
  "name: 'Dave'"
);
code = code.replace(
  "id: 'wallet-auditor'",
  "id: 'wallet-dave'"
);

code = code.replace(
  "const w1 = RESEARCH_WALLETS[0]; // Phan Tấn Long",
  "const w1 = RESEARCH_WALLETS[0]; // Alice"
);
code = code.replace(
  "const w2 = RESEARCH_WALLETS[1]; // CTK47B",
  "const w2 = RESEARCH_WALLETS[1]; // Bob"
);
code = code.replace(
  "const w3 = RESEARCH_WALLETS[2]; // Treasury",
  "const w3 = RESEARCH_WALLETS[2]; // Charlie"
);
code = code.replace(
  "const w4 = RESEARCH_WALLETS[3]; // Auditor",
  "const w4 = RESEARCH_WALLETS[3]; // Dave"
);

code = code.replace(
  "// Transaction 1: Valid - Long -> CTK47B",
  "// Transaction 1: Valid - Alice -> Bob"
);
code = code.replace(
  "// Transaction 2: Valid - Treasury -> Long (Research Grant)",
  "// Transaction 2: Valid - Charlie -> Alice"
);
code = code.replace(
  "// Transaction 3: Valid - CTK47B -> Auditor (Dataset Publication Fee)",
  "// Transaction 3: Valid - Bob -> Dave"
);
code = code.replace(
  "// Transaction 5: Valid - Auditor -> Treasury (Audit Clearance Escrow)",
  "// Transaction 5: Valid - Dave -> Charlie"
);

code = code.replace(
  "receiverName: 'Unauthorized Attacker Address'",
  "receiverName: 'Eve (Attacker)'"
);

fs.writeFileSync('src/data/transactionData.ts', code);
