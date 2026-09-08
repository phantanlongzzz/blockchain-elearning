import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertTriangle, FileText, Hash, Copy, Check, RotateCcw, ShieldCheck } from 'lucide-react';
import { hashSha256 } from '../../utils/sha256';
import { useLanguage } from '../../i18n/LanguageContext';

export const FileIntegrityPlayground: React.FC = () => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [fileName, setFileName] = useState<string>('sample_contract.json');
  const [fileSize, setFileSize] = useState<number>(342);
  const [calculatedHash, setCalculatedHash] = useState<string>('a35e29f1082c9748b8c56e30b6c1fd752d4310d7a04918e97f26c06a4ec53f28');
  const [expectedHash, setExpectedHash] = useState<string>('a35e29f1082c9748b8c56e30b6c1fd752d4310d7a04918e97f26c06a4ec53f28');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setIsCalculating(true);
    setFileName(file.name);
    setFileSize(file.size);

    try {
      const buffer = await file.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      const res = await hashSha256(bytes);
      setCalculatedHash(res.hex);
    } catch (err) {
      console.error('File hash calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleCopyHash = () => {
    if (calculatedHash) {
      navigator.clipboard.writeText(calculatedHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Sample presets for quick testing
  const loadPreset = async (type: 'valid' | 'tampered') => {
    setIsCalculating(true);
    if (type === 'valid') {
      const content = JSON.stringify({ version: "1.0", network: "mainnet", consensus: "PoW" }, null, 2);
      const res = await hashSha256(content);
      setFileName('block_header.json');
      setFileSize(content.length);
      setCalculatedHash(res.hex);
      setExpectedHash(res.hex);
    } else {
      const content = JSON.stringify({ version: "1.0", network: "mainnet", consensus: "PoW", tampered: true }, null, 2);
      const res = await hashSha256(content);
      setFileName('block_header_tampered.json');
      setFileSize(content.length);
      setCalculatedHash(res.hex);
      setExpectedHash('a35e29f1082c9748b8c56e30b6c1fd752d4310d7a04918e97f26c06a4ec53f28');
    }
    setIsCalculating(false);
  };

  const cleanCalc = calculatedHash.trim().toLowerCase();
  const cleanExp = expectedHash.trim().toLowerCase();
  const isMatch = cleanExp.length > 0 && cleanCalc === cleanExp;
  const isMismatch = cleanExp.length > 0 && cleanCalc !== cleanExp;

  return (
    <div className="font-sans space-y-6 animate-in fade-in duration-300">
      {/* Top Presets */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => loadPreset('valid')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono transition-colors cursor-pointer"
          >
            {isVi ? 'Mẫu 1: Tệp chuẩn (Khớp băm)' : 'Preset 1: Valid File'}
          </button>
          <button
            type="button"
            onClick={() => loadPreset('tampered')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 text-xs font-mono transition-colors cursor-pointer"
          >
            {isVi ? 'Mẫu 2: Tệp bị sửa đổi (Lệch băm)' : 'Preset 2: Tampered File'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setFileName('');
            setFileSize(0);
            setCalculatedHash('');
            setExpectedHash('');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-mono transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isVi ? 'Xóa dữ liệu' : 'Clear'}</span>
        </button>
      </div>

      {/* Main Grid: Upload Dropzone & Hash Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 min-h-[220px] ${
            isDragging
              ? 'border-cyan-400 bg-cyan-500/10'
              : 'border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="p-3 rounded-full bg-slate-800/80 border border-slate-700/60 text-cyan-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {isVi ? 'Kéo thả tệp hoặc bấm để chọn tệp' : 'Drop a file or click to browse'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isVi ? 'Hỗ trợ mọi định dạng tệp (Tính toán băm SHA-256 an toàn ngay trên trình duyệt)' : 'All file types supported (client-side SHA-256 compute)'}
            </p>
          </div>

          {fileName && (
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-300">
              <FileText className="w-3.5 h-3.5" />
              <span className="font-medium">{fileName}</span>
              <span className="text-slate-500">({fileSize} bytes)</span>
            </div>
          )}
        </div>

        {/* Checksum Matching Panel */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <span className="font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  {isVi ? 'Mã băm SHA-256 tính toán' : 'Calculated SHA-256'}
                </span>
                {calculatedHash && (
                  <button
                    type="button"
                    onClick={handleCopyHash}
                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? (isVi ? 'Đã chép' : 'Copied') : (isVi ? 'Sao chép' : 'Copy')}</span>
                  </button>
                )}
              </div>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 font-mono text-xs text-cyan-300 break-all min-h-[46px] flex items-center">
                {isCalculating ? (
                  <span className="text-slate-500 italic">{isVi ? 'Đang tính toán mã băm...' : 'Calculating digest...'}</span>
                ) : calculatedHash ? (
                  calculatedHash
                ) : (
                  <span className="text-slate-600">{isVi ? 'Chưa có tệp nào được chọn' : 'No file selected'}</span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {isVi ? 'Mã băm kỳ vọng để đối chiếu (Expected Checksum)' : 'Expected Checksum'}
              </label>
              <input
                type="text"
                value={expectedHash}
                onChange={(e) => setExpectedHash(e.target.value)}
                placeholder={isVi ? 'Dán mã SHA-256 gốc của nhà phát hành tại đây...' : 'Paste expected SHA-256 digest here...'}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
              />
            </div>
          </div>

          {/* Verification Status Result */}
          <div className="pt-2">
            {isMatch && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-emerald-300 uppercase">
                    {isVi ? 'TÍNH TOÀN VẸN XÁC THỰC: KHỚP 100%' : 'INTEGRITY VERIFIED: EXACT MATCH'}
                  </div>
                  <div className="text-[11px] text-emerald-400/80">
                    {isVi ? 'Tệp tin nguyên vẹn, không bị sửa đổi hay suy hao dữ liệu.' : 'File content is pristine and untampered.'}
                  </div>
                </div>
              </div>
            )}

            {isMismatch && (
              <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-500/40 flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-300 uppercase">
                    {isVi ? 'CẢNH BÁO: MÃ BĂM KHÔNG KHỚP' : 'WARNING: CHECKSUM MISMATCH'}
                  </div>
                  <div className="text-[11px] text-rose-400/80">
                    {isVi ? 'Tệp đã bị can thiệp, sửa đổi hoặc là phiên bản khác.' : 'File has been altered, corrupted, or differs from source.'}
                  </div>
                </div>
              </div>
            )}

            {!expectedHash && calculatedHash && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{isVi ? 'Nhập mã băm kỳ vọng để kiểm tra đối chiếu tự động.' : 'Enter an expected checksum to perform integrity check.'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
