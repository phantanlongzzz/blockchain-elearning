const fs = require('fs');
let code = fs.readFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', 'utf-8');

code = code.replace(
  `  // Preset 1: Standard Valid Transaction
  const runPresetValid = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    const payload = createTxPayload(alice, bob, 10.0);
    processTransactionSubmission(alice, bob, payload, payload);
  };`,
  `  // Preset 1: Standard Valid Transaction
  const runPresetValid = () => {
    const alice = INITIAL_ACCOUNTS[0];
    const bob = INITIAL_ACCOUNTS[1];
    const payload = createTxPayload(alice, bob, 10.0);
    processTransactionSubmission(alice, bob, payload, payload, undefined, true);
  };`
);

code = code.replace(
  `  // Preset 2: REQUIRED DEMO — 10 BTC -> 100 BTC Tampering with Original Signature
  const runPresetTamperedAmount = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    const signedPayload = createTxPayload(alice, bob, 10.0);
    const broadcastPayload = { ...signedPayload, amount: 100.0 };
    processTransactionSubmission(alice, bob, signedPayload, broadcastPayload);
  };`,
  `  // Preset 2: REQUIRED DEMO — 10 BTC -> 100 BTC Tampering with Original Signature
  const runPresetTamperedAmount = () => {
    const alice = INITIAL_ACCOUNTS[0];
    const bob = INITIAL_ACCOUNTS[1];
    const signedPayload = createTxPayload(alice, bob, 10.0);
    const broadcastPayload = { ...signedPayload, amount: 100.0 };
    processTransactionSubmission(alice, bob, signedPayload, broadcastPayload, undefined, true);
  };`
);

code = code.replace(
  `  // Preset 3: Insufficient Balance
  const runPresetInsufficientBalance = () => {
    const alice = accounts[0];
    const bob = accounts[1];
    const payload = createTxPayload(alice, bob, 100.0);
    processTransactionSubmission(alice, bob, payload, payload);
  };`,
  `  // Preset 3: Insufficient Balance
  const runPresetInsufficientBalance = () => {
    const alice = INITIAL_ACCOUNTS[0];
    const bob = INITIAL_ACCOUNTS[1];
    const payload = createTxPayload(alice, bob, 100.0);
    processTransactionSubmission(alice, bob, payload, payload, undefined, true);
  };`
);

code = code.replace(
  `  // Preset 4: Replay Attack Demo
  const runPresetReplayAttack = () => {
    if (mempool.length === 0) {
      runPresetValid();
      return;
    }
    const target = mempool[0];
    const sAcc = accounts.find((a) => a.address === target.senderAddress) || accounts[0];
    const rAcc = accounts.find((a) => a.address === target.receiverAddress) || accounts[1];
    
    // Exact identical payload that was already signed and processed
    const targetPayload = {
      id: target.id,
      sender: target.senderAddress,
      receiver: target.receiverAddress,
      amount: target.amount,
      timestamp: target.timestamp,
      nonce: target.nonce,
    };

    processTransactionSubmission(
      sAcc,
      rAcc,
      targetPayload,
      targetPayload,
      target.signature
    );
  };`,
  `  // Preset 4: Replay Attack Demo
  const runPresetReplayAttack = async () => {
    const alice = INITIAL_ACCOUNTS[0];
    const bob = INITIAL_ACCOUNTS[1];
    
    // To simulate a replay attack realistically in isolation, 
    // we need to first generate a valid transaction, sign it, 
    // then immediately submit it as a replay.
    const targetPayload = createTxPayload(alice, bob, 5.0);
    const digestRes = await computeTransactionDigest(targetPayload);
    const originalSignature = await signTransactionData(digestRes.hex, alice.privateKey);

    // Replay submission: duplicate signature and payload
    processTransactionSubmission(
      alice,
      bob,
      targetPayload,
      targetPayload,
      originalSignature,
      true
    );
  };`
);

fs.writeFileSync('src/components/TransactionVerification/MempoolDashboard.tsx', code);
