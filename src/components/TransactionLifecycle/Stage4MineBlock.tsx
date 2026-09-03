import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { Transaction, Block } from './types';
import { Pickaxe, Box, Link, Cpu, GitBranch, ShieldAlert, ArrowRight } from 'lucide-react';
import { MerkleTreeVisualizer } from './MerkleTreeVisualizer';

interface Props {
  mempool: Transaction[];
  setMempool: React.Dispatch<React.SetStateAction<Transaction[]>>;
  blockchain: Block[];
  setBlockchain: React.Dispatch<React.SetStateAction<Block[]>>;
  focusElement: (id: string) => void;
}

export const Stage4MineBlock: React.FC<Props> = ({ mempool, setMempool, blockchain, setBlockchain, focusElement }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [candidateTxs, setCandidateTxs] = useState<Transaction[]>([]);
  const [merkleRoot, setMerkleRoot] = useState<string>('');
  const [merkleMismatch, setMerkleMismatch] = useState<boolean>(false);
  const [blockMined, setBlockMined] = useState<boolean>(false);

  useEffect(() => {
    // Create Coinbase TX
    const coinbase: Transaction = {
      id: 'TX-COINBASE',
      isCoinbase: true,
      inputs: [{ txid: '0000000000000000000000000000000000000000000000000000000000000000', index: 0, sig: 'COINBASE_DATA', pubKey: '', value: 0 }],
      outputs: [{ address: 'Miner (Reward)', value: 6.25 }],
      valid: true
    };
    
    // Select transactions from Mempool (up to 3 for perfect binary tree of 4)
    const selected = mempool.slice(0, 3);
    setCandidateTxs([coinbase, ...selected]);
  }, [mempool]);

  const handleMineBlock = () => {
    if (merkleMismatch) return; // Cannot mine if tampered
    
    const newBlock: Block = {
      index: blockchain.length,
      previousHash: blockchain[blockchain.length - 1].hash,
      merkleRoot: merkleRoot,
      timestamp: Math.floor(Date.now() / 1000),
      nonce: Math.floor(Math.random() * 100000000),
      hash: '00000000' + Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2),
      transactions: candidateTxs
    };

    setBlockchain([...blockchain, newBlock]);
    setMempool(prev => prev.filter(tx => !candidateTxs.some(ctx => ctx.id === tx.id)));
    setBlockMined(true);
    
    setTimeout(() => {
      focusElement('blockchain-view');
    }, 500);
  };

  return (
    <div id="stage-4-container" className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
          <Pickaxe className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{isVi ? 'Đóng Khối & Merkle Tree' : 'Mine Block & Merkle Tree'}</h2>
          <p className="text-sm text-slate-400">
            {isVi ? 'Tính toán Merkle Root và Header để gia nhập chuỗi.' : 'Calculate Merkle Root and Header to join the chain.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Candidate Block & Merkle Tree */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#101419] rounded-2xl border border-slate-800 p-5 overflow-x-auto">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-orange-400" />
              {isVi ? 'Cây Merkle (Merkle Tree)' : 'Merkle Tree'}
            </h3>
            
            <MerkleTreeVisualizer 
              transactions={candidateTxs} 
              onRootCalculated={(root, isValid) => {
                setMerkleRoot(root);
                setMerkleMismatch(!isValid);
                if (root && isValid) focusElement('block-header-panel');
              }}
            />
          </div>
        </div>

        {/* Block Header Panel */}
        <div id="block-header-panel" className="bg-[#101419] rounded-2xl border border-slate-800 p-5 flex flex-col">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            {isVi ? 'Block Header (Khối ứng cử viên)' : 'Block Header (Candidate)'}
          </h3>
          
          <div className="flex-1 space-y-3 font-mono text-[11px] sm:text-xs">
            <div className="p-2.5 bg-[#0B0E12] border border-slate-800 rounded-lg">
              <div className="text-slate-500 mb-0.5">Previous Hash</div>
              <div className="text-emerald-400 break-all">{blockchain[blockchain.length - 1].hash}</div>
            </div>
            <div className={`p-2.5 rounded-lg border transition-colors ${merkleMismatch ? 'bg-rose-950/30 border-rose-500/50' : 'bg-[#0B0E12] border-slate-800'}`}>
              <div className="text-slate-500 mb-0.5">Merkle Root</div>
              <div className={`break-all ${merkleMismatch ? 'text-rose-400 font-bold' : 'text-orange-400'}`}>
                {merkleRoot || (isVi ? 'Đang tính toán...' : 'Calculating...')}
              </div>
              {merkleMismatch && (
                <div className="mt-2 text-rose-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  <span>{isVi ? 'Dữ liệu bị can thiệp! Merkle Root thay đổi.' : 'Data tampered! Merkle Root changed.'}</span>
                </div>
              )}
            </div>
            <div className="p-2.5 bg-[#0B0E12] border border-slate-800 rounded-lg">
              <div className="text-slate-500 mb-0.5">Timestamp</div>
              <div className="text-slate-300">{Math.floor(Date.now() / 1000)}</div>
            </div>
            <div className="p-2.5 bg-[#0B0E12] border border-slate-800 rounded-lg">
              <div className="text-slate-500 mb-0.5">Nonce</div>
              <div className="text-slate-300">...</div>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleMineBlock}
              disabled={!merkleRoot || merkleMismatch || blockMined}
              className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                !merkleRoot || merkleMismatch || blockMined
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-400 text-orange-950 shadow-[0_0_20px_rgba(249,115,22,0.3)] cursor-pointer'
              }`}
            >
              <Pickaxe className="w-4 h-4" />
              <span>{isVi ? 'Khớp Nonce & Đóng Khối' : 'Find Nonce & Mine Block'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Blockchain View */}
      {blockMined && (
        <div id="blockchain-view" className="bg-[#101419] rounded-2xl border border-slate-800 p-5 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-auto">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
            <Link className="w-4 h-4 text-blue-400" />
            Blockchain
          </h3>
          
          <div className="flex items-center gap-4 min-w-max pb-4">
            {blockchain.slice(-4).map((block, idx, arr) => (
              <React.Fragment key={block.index}>
                <div className={`w-48 p-4 rounded-xl border flex flex-col ${idx === arr.length - 1 ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-[#0B0E12] border-slate-800'}`}>
                  <div className="text-xs font-bold text-slate-400 mb-2">Block #{block.index}</div>
                  <div className="text-[10px] text-slate-500 mb-1">Hash:</div>
                  <div className={`text-[10px] font-mono break-all ${idx === arr.length - 1 ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {block.hash.slice(0, 16)}...
                  </div>
                  {block.transactions.length > 0 && (
                    <div className="mt-3 text-[10px] text-slate-500">
                      {block.transactions.length} TXs
                    </div>
                  )}
                </div>
                {idx < arr.length - 1 && (
                  <div className="flex items-center text-slate-700">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
