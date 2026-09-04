import React, { useState } from 'react';
import { FileCode2, X, Terminal } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { CodeViewer } from '../common/CodeViewer';

interface ConsensusCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'byzantine' | 'pow' | 'pos';
}

const BYZANTINE_CODE_PY = `"""
Byzantine Generals Consensus Implementation (Lamport OM & SM Models)
Blockchain Elearning - Consensus Simulation
"""
import hashlib
from typing import List, Dict, Optional

class GeneralNode:
    def __init__(self, node_id: str, name: str, is_traitor: bool = False):
        self.node_id = node_id
        self.name = name
        self.is_traitor = is_traitor
        self.received_messages: Dict[str, str] = {}

    def receive_order(self, from_id: str, order: str, signature: Optional[str] = None) -> bool:
        # Check signature if provided (Signed Messages model)
        if signature:
            expected_hash = hashlib.sha256(order.encode()).hexdigest()
            if signature != f"sig_{from_id}_{expected_hash[:8]}":
                print(f"[REJECTED] Node {self.node_id} detected invalid signature from {from_id}")
                return False
        
        self.received_messages[from_id] = order
        return True

    def compute_majority_decision(self) -> str:
        votes = list(self.received_messages.values())
        attack_count = votes.count("ATTACK")
        retreat_count = votes.count("RETREAT")
        
        if attack_count > retreat_count:
            return "ATTACK"
        elif retreat_count > attack_count:
            return "RETREAT"
        return "DEFAULT_RETREAT"  # Fallback rule

# Demonstration of 3f + 1 requirement
def run_byzantine_consensus(total_nodes: int = 4, traitors: int = 1):
    assert total_nodes >= 3 * traitors + 1, "Must satisfy N >= 3f + 1"
    print(f"Network initialized with {total_nodes} nodes (tolerates {traitors} traitors)")
`;

const POW_CODE_PY = `"""
Nakamoto Proof of Work Consensus Engine
Blockchain Elearning - Consensus Simulation
"""
import hashlib
import time

class PoWBlock:
    def __init__(self, index: int, prev_hash: str, data: str, difficulty: int):
        self.index = index
        self.timestamp = int(time.time())
        self.prev_hash = prev_hash
        self.data = data
        self.difficulty = difficulty
        self.nonce = 0
        self.hash = self.mine_block()

    def calculate_hash(self, nonce: int) -> str:
        payload = f"{self.index}{self.prev_hash}{self.timestamp}{self.data}{nonce}"
        return hashlib.sha256(payload.encode()).hexdigest()

    def mine_block(self) -> str:
        target_prefix = "0" * self.difficulty
        print(f"[MINING] Seeking hash with prefix: {target_prefix}")
        
        while True:
            current_hash = self.calculate_hash(self.nonce)
            if current_hash.startswith(target_prefix):
                print(f"[SUCCESS] Block #{self.index} mined! Nonce: {self.nonce}")
                print(f"Hash: {current_hash}")
                return current_hash
            self.nonce += 1

# Verification in O(1) by any independent node
def verify_pow_block(block: PoWBlock) -> bool:
    target_prefix = "0" * block.difficulty
    computed = block.calculate_hash(block.nonce)
    return computed == block.hash and computed.startswith(target_prefix)
`;

const POS_CODE_PY = `"""
Proof of Stake Validator Selection & Slashing Engine
Blockchain Elearning - Consensus Simulation
"""
import random
from typing import List, Dict

class Validator:
    def __init__(self, address: str, stake_eth: float):
        self.address = address
        self.stake_eth = stake_eth
        self.is_slashed = False

class PoSConsensus:
    def __init__(self, validators: List[Validator]):
        self.validators = validators

    @property
    def total_active_stake(self) -> float:
        return sum(v.stake_eth for v in self.validators if not v.is_slashed)

    def select_slot_proposer(self) -> Validator:
        # Pseudo-random weighted lottery selection
        active = [v for v in self.validators if not v.is_slashed]
        weights = [v.stake_eth for v in active]
        selected = random.choices(active, weights=weights, k=1)[0]
        return selected

    def submit_attestation(self, validator: Validator, block_hash: str) -> bool:
        if validator.is_slashed:
            return False
        return True

    def slash_validator(self, validator: Validator, reason: str):
        # Immediate 100% burn & expulsion upon equivocation
        print(f"[SLASHING] {validator.address} burned {validator.stake_eth} ETH. Reason: {reason}")
        validator.stake_eth = 0
        validator.is_slashed = True
`;

export const ConsensusCodeModal: React.FC<ConsensusCodeModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'byzantine',
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'byzantine' | 'pow' | 'pos'>(defaultTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0B0E12] border border-slate-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-[#080C10]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-border-primary flex items-center justify-center text-text-muted">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white font-display">
                {language === 'vi'
                  ? 'MÃ NGUỒN CƠ CHẾ ĐỒNG THUẬN (PYTHON REFERENCE)'
                  : 'CONSENSUS PROTOCOL REFERENCE CODE (PYTHON)'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                {language === 'vi'
                  ? 'Triển khai chuẩn thuật toán Byzantine BFT, PoW Nakamoto và PoS Casper'
                  : 'Algorithmic implementations of Byzantine BFT, Nakamoto PoW & PoS'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 p-3 bg-[#080C10] border-b border-slate-800/80 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setActiveTab('byzantine')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'byzantine'
                ? 'bg-white/[0.08] text-text-primary border border-border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Byzantine Consensus (BFT)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'pow'
                ? 'bg-white/[0.08] text-text-primary border border-border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Proof of Work
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'pos'
                ? 'bg-white/[0.08] text-text-primary border border-border-primary'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Proof of Stake
          </button>
        </div>

        {/* Code Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] bg-[#0B0E12]">
          {activeTab === 'byzantine' && (
            <CodeViewer code={BYZANTINE_CODE_PY} language="python" filename="byzantine_consensus.py" />
          )}
          {activeTab === 'pow' && (
            <CodeViewer code={POW_CODE_PY} language="python" filename="nakamoto_pow.py" />
          )}
          {activeTab === 'pos' && (
            <CodeViewer code={POS_CODE_PY} language="python" filename="pos_validator_engine.py" />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#080C10] border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700 cursor-pointer"
          >
            {language === 'vi' ? 'Đóng cửa sổ' : 'Close Window'}
          </button>
        </div>
      </div>
    </div>
  );
};
