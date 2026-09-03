import React, { useState, useEffect } from 'react';
import { Transaction } from './types';
import { useLanguage } from '../../i18n/LanguageContext';

interface Props {
  transactions: Transaction[];
  onRootCalculated: (rootHash: string, isValid: boolean) => void;
}

export const MerkleTreeVisualizer: React.FC<Props> = ({ transactions, onRootCalculated }) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  // Ensure exactly 4 leaves by duplicating if needed
  const leaves = [...transactions];
  while (leaves.length < 4 && leaves.length > 0) {
    leaves.push(leaves[leaves.length - 1]);
  }

  // Initial valid hashes
  const initialLeafHashes = leaves.map(tx => `hash(${tx.id})`);
  const initialL1Hashes = [
    `hash(${initialLeafHashes[0]} + ${initialLeafHashes[1]})`,
    `hash(${initialLeafHashes[2]} + ${initialLeafHashes[3]})`
  ];
  const initialRoot = `hash(${initialL1Hashes[0]} + ${initialL1Hashes[1]})`;

  const [leafHashes, setLeafHashes] = useState<string[]>(initialLeafHashes);
  const [l1Hashes, setL1Hashes] = useState<string[]>(initialL1Hashes);
  const [root, setRoot] = useState<string>(initialRoot);
  
  const [tamperedIndex, setTamperedIndex] = useState<number | null>(null);
  
  // Animation states
  const [showLeaves, setShowLeaves] = useState(false);
  const [showL1, setShowL1] = useState(false);
  const [showRoot, setShowRoot] = useState(false);

  useEffect(() => {
    // Initial build animation
    setShowLeaves(true);
    const t1 = setTimeout(() => setShowL1(true), 800);
    const t2 = setTimeout(() => {
      setShowRoot(true);
      onRootCalculated(initialRoot, true);
    }, 1600);
    
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTamper = (index: number) => {
    if (tamperedIndex !== null) return; // Only allow one tamper for simplicity
    setTamperedIndex(index);
    
    // Propagate tamper upwards
    const newLeafHashes = [...leafHashes];
    newLeafHashes[index] = `INVALID_HASH_${index}`;
    setLeafHashes(newLeafHashes);
    onRootCalculated('', false); // Temporarily blank out

    setTimeout(() => {
      const newL1Hashes = [...l1Hashes];
      const l1Index = Math.floor(index / 2);
      newL1Hashes[l1Index] = `INVALID_L1_${l1Index}`;
      setL1Hashes(newL1Hashes);
      
      setTimeout(() => {
        const newRoot = 'INVALID_MERKLE_ROOT';
        setRoot(newRoot);
        onRootCalculated(newRoot, false);
      }, 800);
    }, 800);
  };

  if (leaves.length !== 4) return null;

  return (
    <div className="flex flex-col items-center gap-6 font-mono text-xs select-none min-w-[600px] pb-4">
      
      {/* ROOT */}
      <div className={`transition-all duration-500 ${showRoot ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className={`px-4 py-2 rounded-lg border ${tamperedIndex !== null ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 font-bold' : 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400'}`}>
          <div className="text-center text-[10px] text-slate-500 mb-1">Merkle Root</div>
          {root.slice(0, 32)}...
        </div>
      </div>

      {/* L1 HASHES */}
      <div className="flex gap-32">
        {l1Hashes.map((h, i) => {
          const isAffected = tamperedIndex !== null && Math.floor(tamperedIndex / 2) === i;
          return (
            <div key={i} className={`transition-all duration-500 ${showL1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`px-3 py-1.5 rounded-lg border ${isAffected ? 'bg-rose-950/30 border-rose-500/40 text-rose-400' : 'bg-[#0B0E12] border-slate-700 text-slate-300'}`}>
                {h.slice(0, 16)}...
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAF HASHES */}
      <div className="flex gap-4 w-full justify-between px-8">
        {leafHashes.map((h, i) => {
          const isAffected = tamperedIndex === i;
          return (
            <div key={i} className={`transition-all duration-500 ${showLeaves ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              <div className={`px-2 py-1 rounded border text-[10px] ${isAffected ? 'bg-rose-950/30 border-rose-500/40 text-rose-400' : 'bg-[#0B0E12] border-slate-700 text-slate-400'}`}>
                {h.slice(0, 12)}...
              </div>
            </div>
          );
        })}
      </div>

      {/* RAW TRANSACTIONS */}
      <div className="flex gap-4 w-full justify-between px-4 mt-2">
        {leaves.map((tx, i) => (
          <div 
            key={i} 
            className={`w-32 p-3 rounded-xl border flex flex-col items-center text-center relative ${
              tamperedIndex === i 
                ? 'bg-rose-950/20 border-rose-500/50' 
                : tx.isCoinbase 
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : 'bg-[#0B0E12] border-slate-800'
            }`}
          >
            <div className="text-[10px] font-bold text-slate-300 mb-1">{tx.id}</div>
            <div className="text-[9px] text-slate-500 mb-2">
              {tx.outputs.reduce((sum, o) => sum + o.value, 0).toFixed(2)} BTC
            </div>
            
            {tamperedIndex === null && i > 0 && (
              <button 
                onClick={() => handleTamper(i)}
                className="absolute -bottom-8 px-2 py-1 bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 text-[9px] rounded border border-slate-700 hover:border-rose-500/50 transition-colors cursor-pointer"
              >
                {isVi ? 'Sửa đổi' : 'Tamper'}
              </button>
            )}
            {tamperedIndex === i && (
               <div className="absolute -bottom-6 text-[10px] text-rose-400 font-bold">Tampered!</div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
};
