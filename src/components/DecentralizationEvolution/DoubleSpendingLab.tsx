import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, CheckCircle2, XCircle, ArrowRight, Server, Send, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface DoubleSpendingLabProps {
  onInteracted?: () => void;
  onNextStage?: () => void;
  onPrevStage?: () => void;
  isHandsOn?: boolean;
}

export const DoubleSpendingLab: React.FC<DoubleSpendingLabProps> = ({
  onInteracted,
  onNextStage,
  onPrevStage,
  isHandsOn = false,
}) => {
  const { language } = useLanguage();

  // Mode: centralized vs no_authority (decentralized problem state)
  const [authorityMode, setAuthorityMode] = useState<'centralized' | 'no_authority'>('centralized');

  // Balances
  const [aliceBalance, setAliceBalance] = useState<number>(10);
  const [bobBalance, setBobBalance] = useState<number>(0);
  const [charlieBalance, setCharlieBalance] = useState<number>(0);

  // Status of TX A & TX B
  const [txAStatus, setTxAStatus] = useState<'idle' | 'submitted' | 'accepted' | 'rejected'>('idle');
  const [txBStatus, setTxBStatus] = useState<'idle' | 'submitted' | 'accepted' | 'rejected'>('idle');
  const [logMessages, setLogMessages] = useState<string[]>([]);
  const [solutionRevealed, setSolutionRevealed] = useState<boolean>(false);

  const handleReset = () => {
    setAliceBalance(10);
    setBobBalance(0);
    setCharlieBalance(0);
    setTxAStatus('idle');
    setTxBStatus('idle');
    setLogMessages([]);
    setSolutionRevealed(false);
  };

  const handleSwitchMode = (mode: 'centralized' | 'no_authority') => {
    setAuthorityMode(mode);
    handleReset();
    onInteracted?.();
  };

  const handleSubmitTxA = () => {
    if (txAStatus !== 'idle') return;

    if (authorityMode === 'centralized') {
      if (aliceBalance >= 10) {
        setAliceBalance(0);
        setBobBalance(10);
        setTxAStatus('accepted');
        setLogMessages((prev) => [
          `✓ [CENTRAL SERVER]: Hợp lệ! Alice gửi 10 Coin cho Bob. Số dư Alice còn 0.`,
          ...prev,
        ]);
      } else {
        setTxAStatus('rejected');
        setLogMessages((prev) => [
          `❌ [CENTRAL SERVER]: Từ chối TX A! Số dư Alice không đủ (${aliceBalance} Coin).`,
          ...prev,
        ]);
      }
    } else {
      // In NO AUTHORITY / P2P without Blockchain:
      // Alice broadcasts TX A to Bob's neighborhood
      setTxAStatus('accepted');
      setBobBalance(10);
      setLogMessages((prev) => [
        `⚠ [P2P Cụm 1]: Bob nhận được file dữ liệu TX A (10 Coin). Bob tưởng mình đã nhận được tiền thật!`,
        ...prev,
      ]);
    }
    onInteracted?.();
  };

  const handleSubmitTxB = () => {
    if (txBStatus !== 'idle') return;

    if (authorityMode === 'centralized') {
      if (aliceBalance >= 10) {
        setAliceBalance(0);
        setCharlieBalance(10);
        setTxBStatus('accepted');
        setLogMessages((prev) => [
          `✓ [CENTRAL SERVER]: Hợp lệ! Alice gửi 10 Coin cho Charlie. Số dư Alice còn 0.`,
          ...prev,
        ]);
      } else {
        setTxBStatus('rejected');
        setLogMessages((prev) => [
          `❌ [CENTRAL SERVER]: TỪ CHỐI TX B! Số dư của Alice không đủ (${aliceBalance} Coin). Ngăn chặn tiêu đúp thành công!`,
          ...prev,
        ]);
      }
    } else {
      // In NO AUTHORITY / P2P without Blockchain:
      // Alice simultaneously broadcasts identical digital copy TX B to Charlie's neighborhood
      setTxBStatus('accepted');
      setCharlieBalance(10);
      setLogMessages((prev) => [
        `🚨 [P2P Cụm 2]: Charlie cũng nhận được file dữ liệu TX B (10 Coin). Cả Bob và Charlie đều giao hàng, nhưng Alice chỉ có 10 Coin ban đầu! => DOUBLE SPENDING XẢY RA!`,
        ...prev,
      ]);
    }
    onInteracted?.();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#0B0E12] border border-rose-500/20 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'PHẦN 04 · THÍ NGHIỆM TIÊU ĐÚP' : 'PART 04 · DOUBLE SPENDING LAB'}</span>
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              {language === 'vi'
                ? 'Bài toán Tiêu Đúp (Double Spending) — Thách thức lớn nhất của Tiền Kỹ Thuật Số'
                : 'The Double Spending Problem — The Holy Grail Challenge of Digital Money'}
            </h3>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'vi'
                ? 'Dữ liệu số (file mp3, hình ảnh, chuỗi byte) có thể sao chép vô hạn mà không mất file gốc. Làm thế nào để ngăn ai đó gửi cùng 1 đồng tiền kỹ thuật số cho 2 người khác nhau khi KHÔNG CÓ máy chủ trung tâm?'
                : 'Digital bits can be duplicated effortlessly. How can we prevent spending the same coin twice without relying on a central referee?'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg bg-[#0F1217] hover:bg-[#161D26] border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
            </button>
          </div>
        </div>

        {/* Environment Mode Switcher */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
          <span className="text-xs font-mono text-slate-400">
            {language === 'vi' ? 'CHỌN MÔI TRƯỜNG THỬ NGHIỆM:' : 'SELECT ENVIRONMENT:'}
          </span>
          <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleSwitchMode('centralized')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                authorityMode === 'centralized'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? '1. Có Server Trung Tâm (Centralized)' : '1. Centralized Authority'}</span>
            </button>
            <button
              type="button"
              onClick={() => handleSwitchMode('no_authority')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                authorityMode === 'no_authority'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-950/60 ring-2 ring-rose-400/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-300" />
              <span>{language === 'vi' ? '2. XÓA BỎ CHỦ THỂ TRUNG TÂM' : '2. NO CENTRAL AUTHORITY'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alice's Double Attack Dashboard */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl space-y-5">
          {/* Alice's Initial Balance */}
          <div className="p-4 rounded-xl bg-[#05070c] border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-sm">
                A
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">Alice (Ví gốc)</div>
                <div className="text-[11px] text-slate-400">
                  {language === 'vi' ? 'Đang sở hữu đồng xu duy nhất' : 'Holds a single digital token'}
                </div>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="text-[10px] text-slate-500">{language === 'vi' ? 'SỐ DƯ KHẢ DỤNG' : 'BALANCE'}</div>
              <div className="text-lg font-bold text-financial font-mono">{aliceBalance} COIN</div>
            </div>
          </div>

          {/* Double Spend Transactions Split */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">
              {language === 'vi' ? 'ALICE TẠO 2 GIAO DỊCH MÂU THUẪN ĐỒNG THỜI:' : 'SIMULTANEOUS CONFLICTING TRANSACTIONS:'}
            </div>

            {/* Transaction A */}
            <div className={`p-4 rounded-xl border transition-all ${
              txAStatus === 'accepted'
                ? 'bg-white/[0.04] border-border-primary'
                : txAStatus === 'rejected'
                ? 'bg-rose-950/20 border-rose-500/40 opacity-60'
                : 'bg-[#05070c] border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-white/[0.08] text-text-primary">TX A</span>
                    <span>Alice → Bob: 10 COIN</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'vi' ? 'Mục đích: Mua chiếc xe đạp từ Bob' : 'Purpose: Buy a bicycle from Bob'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {txAStatus === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleSubmitTxA}
 className="px-3.5 py-1.5 rounded-lg bg-financial hover:bg-financial/90 text-black font-semibold text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      <Send className="w-3 h-3" />
                      <span>{language === 'vi' ? 'GỬI TX A' : 'SUBMIT A'}</span>
                    </button>
                  ) : txAStatus === 'accepted' ? (
                    <span className="px-2 py-1 rounded bg-white/[0.08] text-text-primary text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'ĐƯỢC CHẤP NHẬN' : 'ACCEPTED'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'BỊ TỪ CHỐI' : 'REJECTED'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Transaction B */}
            <div className={`p-4 rounded-xl border transition-all ${
              txBStatus === 'accepted'
                ? 'bg-white/[0.04] border-border-primary'
                : txBStatus === 'rejected'
                ? 'bg-rose-950/20 border-rose-500/40 opacity-60'
                : 'bg-[#05070c] border-slate-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">TX B</span>
                    <span>Alice → Charlie: 10 COIN</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {language === 'vi' ? 'Mục đích: Mua chiếc máy tính từ Charlie' : 'Purpose: Buy a laptop from Charlie'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {txBStatus === 'idle' ? (
                    <button
                      type="button"
                      onClick={handleSubmitTxB}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold cursor-pointer flex items-center gap-1 shadow-md"
                    >
                      <Send className="w-3 h-3" />
                      <span>{language === 'vi' ? 'GỬI TX B' : 'SUBMIT B'}</span>
                    </button>
                  ) : txBStatus === 'accepted' ? (
                    <span className="px-2 py-1 rounded bg-white/[0.08] text-text-primary text-xs font-mono font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'ĐƯỢC CHẤP NHẬN' : 'ACCEPTED'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-400 text-xs font-mono font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{language === 'vi' ? 'BỊ TỪ CHỐI' : 'REJECTED'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipients Result Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800">
              <div className="text-xs font-mono font-bold text-text-primary">Bob (Merchant A)</div>
              <div className="text-sm font-bold font-mono text-white mt-1">
                <span className="text-financial font-mono"><span className="text-financial font-mono">{bobBalance} COIN</span></span> {bobBalance > 0 && '(Giao hàng ✓)'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-[#05070c] border border-slate-800">
              <div className="text-xs font-mono font-bold text-amber-400">Charlie (Merchant B)</div>
              <div className="text-sm font-bold font-mono text-white mt-1">
                <span className="text-financial font-mono"><span className="text-financial font-mono">{charlieBalance} COIN</span></span> {charlieBalance > 0 && '(Giao hàng ✓)'}
              </div>
            </div>
          </div>

          {/* Activity Log Terminal */}
          <div className="p-3.5 rounded-xl bg-[#030509] border border-slate-900 font-mono text-xs space-y-1">
            <div className="text-slate-500 text-[10px] uppercase">HỆ THỐNG GHI NHẬN:</div>
            {logMessages.length === 0 ? (
              <div className="text-slate-600 italic">Chưa có giao dịch nào được gửi... Hãy bấm gửi TX A và TX B.</div>
            ) : (
              logMessages.map((msg, i) => (
                <div key={i} className="text-slate-300 leading-relaxed">
                  {msg}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Problem Analysis & "Try to Solve" Discovery */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#090d16] border border-slate-800 shadow-xl flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-text-primary uppercase">
              <Sparkles className="w-4 h-4" />
              <span>{language === 'vi' ? 'BẢN CHẤT VẤN ĐỀ' : 'CORE INSIGHT'}</span>
            </div>

            {authorityMode === 'centralized' ? (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-white">
                  {language === 'vi' ? 'Trong hệ thống Tập trung (Ngân hàng):' : 'In a Centralized Banking System:'}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'vi'
                    ? 'Ngân hàng đóng vai trò Trọng tài Duy nhất. Khi Alice gửi TX A, ngân hàng trừ ngay 10 coin trong database. Khi Alice gửi tiếp TX B, ngân hàng thấy số dư = 0 và LẬP TỨC TỪ CHỐI.'
                    : 'The bank acts as the sole referee. When TX A arrives, it decrements Alice balance to 0. When TX B arrives, it sees 0 balance and instantly rejects it.'}
                </p>
                <div className="p-3 rounded-lg bg-[#0e1422] border border-border-primary text-xs text-text-secondary">
                  {language === 'vi'
                    ? '✓ Tiêu đúp được giải quyết dễ dàng nhờ 1 máy chủ độc quyền nắm quyền sinh sát.'
                    : '✓ Double spending is trivial to prevent when 1 central boss controls the database.'}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-rose-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>{language === 'vi' ? 'Khi XÓA BỎ Máy chủ trung tâm:' : 'When the Central Server is REMOVED:'}</span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {language === 'vi'
                    ? 'Không có trọng tài nào để phân xử TX A hay TX B đến trước. Vì dữ liệu số dễ dàng nhân bản, Alice có thể lừa cả mạng lưới để tiêu cùng 1 đồng tiền nhiều lần!'
                    : 'Without a central referee, who decides whether TX A or TX B arrived first? Because digital data can be copied, Alice can trick both merchants!'}
                </p>

                {/* Discovery CTA: Try to solve */}
                {!solutionRevealed ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSolutionRevealed(true);
                      onInteracted?.();
                    }}
 className="w-full py-2.5 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-mono text-xs font-bold uppercase tracking-wider shadow-lg cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    {language === 'vi' ? '💡 TÌM CÁCH GIẢI BÀI TOÁN NÀY' : '💡 DISCOVER THE SOLUTION'}
                  </button>
                ) : (
                  <div className="p-4 rounded-xl bg-[#10151D] border border-border-primary space-y-2 animate-fadeIn">
                    <div className="text-xs font-mono font-bold text-text-primary flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>{language === 'vi' ? 'LỜI GIẢI: PHÁT MINH BLOCKCHAIN' : 'THE BLOCKCHAIN BREAKTHROUGH'}</span>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed">
                      {language === 'vi'
                        ? 'Để giải quyết tiêu đúp mà KHÔNG CẦN máy chủ trung tâm, chúng ta cần gom các giao dịch vào từng KHỐI (BLOCK), liên kết các khối lại theo thứ tự thời gian bằng HÀM BĂM MẬT MÃ (PREVIOUS HASH), và sử dụng THUẬT TOÁN ĐỒNG THUẬN để toàn mạng cùng thống nhất một cuốn Sổ Cái duy nhất!'
                        : 'To prevent double spending without a central referee, we package transactions into BLOCKS, link them chronologically via CRYPTOGRAPHIC HASHES (Previous Hash), and use CONSENSUS RULES to agree on a single history!'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {onPrevStage && (
              <button
                type="button"
                onClick={onPrevStage}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-mono text-slate-400 cursor-pointer"
              >
                {language === 'vi' ? '← Quay lại Phần 03' : '← Back to Part 03'}
              </button>
            )}
            {onNextStage && (
              <button
                type="button"
                onClick={onNextStage}
 className="px-4 py-2 rounded-xl bg-text-primary hover:bg-white/90 text-bg-primary font-semibold font-mono text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ml-auto shadow-md"
              >
                <span>{language === 'vi' ? 'Tiếp: Phần 05 · Tự Xây Dựng Blockchain' : 'Next: Part 05 · Build a Blockchain'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
