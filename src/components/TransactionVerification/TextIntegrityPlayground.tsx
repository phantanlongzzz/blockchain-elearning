import React, { useState, useEffect } from 'react';
import { hashSha256 } from '../../utils/sha256';
import { RotateCcw, AlertTriangle, CheckCircle2, Type, Hash } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const TextIntegrityPlayground: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

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
    <div className="font-sans space-y-6 animate-in fade-in duration-300">
      
      {/* Preset Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5">
        <button
          onClick={handleReset}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isVi ? 'Khôi phục gốc' : 'Reset'}</span>
        </button>
        <button
          onClick={handleExperiment1}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVi ? 'Sửa 1 ký tự (s → S)' : 'Change 1 char (s → S)'}</span>
        </button>
        <button
          onClick={handleExperiment2}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVi ? 'Thêm khoảng trắng cuối' : 'Add trailing space'}</span>
        </button>
        <button
          onClick={handleExperiment3}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Type className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isVi ? 'Thay đổi 1 từ' : 'Change 1 word'}</span>
        </button>
      </div>

      {/* Main Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT: Original Text */}
        <div className="bg-slate-900/60 rounded-xl border border-slate-800 p-5 flex flex-col">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isVi ? 'Văn bản gốc (Original Text)' : 'Original Text'}
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{originalText.length} ký tự</span>
          </div>
          <textarea
            readOnly
            value={originalText}
            className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none resize-none mb-4 font-sans"
          />
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 uppercase font-semibold">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHA-256 Digest</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-emerald-400 break-all">
              {originalHashHex || (isVi ? 'Đang tính toán...' : 'Computing...')}
            </div>
          </div>
        </div>

        {/* RIGHT: Test Text */}
        <div className={`bg-slate-900/60 rounded-xl border p-5 flex flex-col transition-colors duration-300 ${!isMatch ? 'border-rose-500/40' : 'border-slate-800'}`}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              {isVi ? 'Văn bản kiểm tra (So sánh)' : 'Test Text (Editable)'}
            </h3>
            <span className="text-[10px] font-mono text-slate-500">{testText.length} ký tự</span>
          </div>
          <textarea
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            className="w-full h-28 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 resize-none mb-4 font-sans transition-colors"
          />
          <div className="mt-auto">
            <div className="flex items-center gap-2 mb-2 text-xs text-slate-400 uppercase font-semibold">
              <Hash className="w-3.5 h-3.5 text-cyan-400" />
              <span>SHA-256 Digest</span>
            </div>
            <div className={`p-3 rounded-lg bg-slate-950 border font-mono text-xs break-all transition-colors duration-300 ${!isMatch ? 'border-rose-500/30 text-rose-400' : 'border-slate-800 text-emerald-400'}`}>
              {testHashHex || (isVi ? 'Đang tính toán...' : 'Computing...')}
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Result / Avalanche Effect */}
      <div className={`p-5 rounded-xl border transition-all duration-300 ${isMatch ? 'bg-emerald-950/20 border-emerald-500/40' : 'bg-rose-950/20 border-rose-500/40'}`}>
        {isMatch ? (
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-emerald-300 font-bold text-xs uppercase tracking-wider">
                {isVi ? 'Nội dung toàn vẹn - Mã băm khớp hoàn toàn' : 'Integrity Verified - Exact Match'}
              </h4>
              <p className="text-xs text-emerald-400/80 mt-0.5">
                {isVi ? 'Hai văn bản tạo ra cùng một giá trị băm 256-bit không sai lệch.' : 'Both text inputs generate the exact same 256-bit digest.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
              <div>
                <h4 className="text-rose-300 font-bold text-xs uppercase tracking-wider">
                  {isVi ? 'Dữ liệu đã bị sửa đổi (Mã băm hoàn toàn khác)' : 'Data Altered (Hash Divergence)'}
                </h4>
                <p className="text-xs text-rose-400/80 mt-0.5">
                  {isVi ? 'Hiệu ứng tuyết lở (Avalanche Effect): Thay đổi dù chỉ 1 bit đầu vào cũng làm đảo lộn ~50% các bit mã băm.' : 'Avalanche Effect: Altering even a single bit in the input flips ~50% of the output hash bits.'}
                </p>
              </div>
            </div>

            {/* Avalanche Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">{isVi ? 'Số ký tự khác biệt' : 'Changed characters'}</div>
                <div className="text-xl font-bold text-white font-mono">{changedChars}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <div className="text-xs text-slate-400 mb-1">{isVi ? 'Số bit băm bị lệch' : 'Different hash bits'}</div>
                <div className="text-xl font-bold text-rose-400 font-mono">{differentBits} / 256</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/80 border border-rose-500/30">
                <div className="text-xs text-slate-400 mb-1">{isVi ? 'Tỷ lệ tuyết lở' : 'Avalanche Effect'}</div>
                <div className="text-xl font-bold text-rose-400 font-mono">{avalanchePercent}%</div>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
