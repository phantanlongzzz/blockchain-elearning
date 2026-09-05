import React, { useState, useEffect } from 'react';
import { hashSha256 } from '../../utils/sha256';
import { RotateCcw, AlertTriangle, CheckCircle2, Type, Hash } from 'lucide-react';

export const TextIntegrityPlayground: React.FC = () => {
  const defaultText = 'Blockchain is secure';
  const [originalText, setOriginalText] = useState(defaultText);
  const [testText, setTestText] = useState(defaultText);

  const [originalHashHex, setOriginalHashHex] = useState('');
  const [originalHashBin, setOriginalHashBin] = useState('');
  const [testHashHex, setTestHashHex] = useState('');
  const [testHashBin, setTestHashBin] = useState('');

  // Calculate hashes whenever text changes
  useEffect(() => {
    let isMounted = true;
    const calculateHashes = async () => {
      const origResult = await hashSha256(originalText);
      const testResult = await hashSha256(testText);
      if (isMounted) {
        setOriginalHashHex(origResult.hex);
        setOriginalHashBin(origResult.binary);
        setTestHashHex(testResult.hex);
        setTestHashBin(testResult.binary);
      }
    };
    calculateHashes();
    return () => { isMounted = false; };
  }, [originalText, testText]);

  const isMatch = originalHashHex === testHashHex;

  let changedChars = 0;
  const maxLength = Math.max(originalText.length, testText.length);
  for (let i = 0; i < maxLength; i++) {
    if (originalText[i] !== testText[i]) {
      changedChars++;
    }
  }

  let differentBits = 0;
  for (let i = 0; i < 256; i++) {
    if (originalHashBin[i] !== testHashBin[i]) {
      differentBits++;
    }
  }
  const avalanchePercent = Math.round((differentBits / 256) * 100);

  const handleReset = () => {
    setOriginalText(defaultText);
    setTestText(defaultText);
  };

  const handleExperiment1 = () => {
    setTestText('Blockchain is Secure'); // Change 1 char (s -> S)
  };

  const handleExperiment2 = () => {
    setTestText('Blockchain is secure '); // Add space
  };

  const handleExperiment3 = () => {
    setTestText('Blockchain is vulnerable'); // Change word
  };

  return (
    <div className="font-sans space-y-6 animate-in fade-in duration-500">
      
      {/* Preset Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={handleReset}
          className="px-3.5 py-2 rounded-xl bg-[#0F1217] hover:bg-[#1A2028] text-[#C5CBD3] hover:text-white border border-[#1B2027] text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Khôi phục (Reset)</span>
        </button>
        <button
          onClick={handleExperiment1}
          className="px-3.5 py-2 rounded-xl bg-[#0B0E12] hover:bg-[#1A2028] text-text-primary hover:text-white border border-border-primary text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Sửa 1 ký tự (s → S)</span>
        </button>
        <button
          onClick={handleExperiment2}
          className="px-3.5 py-2 rounded-xl bg-[#0B0E12] hover:bg-[#1A2028] text-text-primary hover:text-white border border-border-primary text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Thêm khoảng trắng</span>
        </button>
        <button
          onClick={handleExperiment3}
          className="px-3.5 py-2 rounded-xl bg-[#0B0E12] hover:bg-[#1A2028] text-text-primary hover:text-white border border-border-primary text-xs font-sans flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Type className="w-3.5 h-3.5" />
          <span>Thay đổi 1 từ</span>
        </button>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Original Text */}
        <div className="bg-[#0B0E12] rounded-2xl border border-[#1B2027] p-5 flex flex-col shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Văn bản gốc</h3>
          </div>
          <textarea
            readOnly
            value={originalText}
            className="w-full h-32 bg-[#090C10] border border-[#1B2027] rounded-xl p-3 text-sm text-[#C5CBD3] focus:outline-none resize-none mb-4 font-sans"
          />
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2 text-xs text-[#68717D] uppercase font-bold">
              <Hash className="w-3.5 h-3.5" />
              <span>SHA-256</span>
            </div>
            <div className="p-3 rounded-xl bg-[#090C10] border border-[#1B2027] font-mono text-xs text-[#00D084] break-all">
              {originalHashHex || 'Đang tính toán...'}
            </div>
          </div>
        </div>

        {/* RIGHT: Test Text */}
        <div className={`bg-[#0B0E12] rounded-2xl border p-5 flex flex-col shadow-xl transition-colors duration-300 ${!isMatch ? 'border-rose-500/40' : 'border-[#1B2027]'}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-display font-bold text-white uppercase tracking-wide">Văn bản kiểm tra</h3>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full h-32 bg-[#090C10] border border-[#1B2027] rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00D084]/50 resize-none mb-4 font-sans transition-colors"
          />
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2 text-xs text-[#68717D] uppercase font-bold">
              <Hash className="w-3.5 h-3.5" />
              <span>SHA-256</span>
            </div>
            <div className={`p-3 rounded-xl bg-[#090C10] border font-mono text-xs break-all transition-colors duration-300 ${!isMatch ? 'border-rose-500/30 text-rose-400' : 'border-[#1B2027] text-[#00D084]'}`}>
              {testHashHex || 'Đang tính toán...'}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Result / Avalanche Effect */}
      <div className={`p-6 rounded-2xl border transition-all duration-500 ${isMatch ? 'bg-[#0B0E12] border-[#00D084]/30' : 'bg-[#0B0E12] border-rose-500/40'}`}>
        
        {isMatch ? (
          <div className="flex items-center justify-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-[#00D084]" />
            <div>
              <h4 className="text-[#00D084] font-bold text-sm uppercase">Nội dung toàn vẹn</h4>
              <p className="text-xs text-[#9AA2AE] mt-0.5">Hai văn bản tạo ra cùng một mã SHA-256.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
                <div>
                  <h4 className="text-rose-400 font-bold text-sm uppercase">Nội dung đã thay đổi</h4>
                  <p className="text-xs text-[#9AA2AE] mt-0.5">Chỉ cần thay đổi một ký tự cũng tạo ra mã SHA-256 hoàn toàn khác.</p>
                </div>
              </div>
            </div>

            {/* Avalanche Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-4 rounded-xl bg-[#090C10] border border-[#1B2027]">
                <div className="text-xs text-[#68717D] mb-1">Changed characters</div>
                <div className="text-xl font-bold text-white font-mono">{changedChars}</div>
              </div>
              <div className="p-4 rounded-xl bg-[#090C10] border border-[#1B2027]">
                <div className="text-xs text-[#68717D] mb-1">Different hash bits</div>
                <div className="text-xl font-bold text-rose-400 font-mono">{differentBits} / 256</div>
              </div>
              <div className="p-4 rounded-xl bg-[#090C10] border border-rose-500/30">
                <div className="text-xs text-[#68717D] mb-1">Avalanche Effect</div>
                <div className="text-xl font-bold text-rose-400 font-mono">{avalanchePercent}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
