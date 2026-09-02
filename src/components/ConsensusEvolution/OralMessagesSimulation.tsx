import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

interface OralMessagesSimulationProps {
  isHandsOn?: boolean;
  onInteracted?: () => void;
  onPrevStage?: () => void;
  onNextStage?: () => void;
}

export const OralMessagesSimulation: React.FC<OralMessagesSimulationProps> = ({
  onInteracted,
  onPrevStage,
  onNextStage,
}) => {
  const { language } = useLanguage();
  const isVi = language === 'vi';

  const [simState, setSimState] = useState<'idle' | 'attacking' | 'failed'>('idle');
  const [lieutenantAliceOrder, setLieutenantAliceOrder] = useState<string | null>(null);
  const [lieutenantBobOrder, setLieutenantBobOrder] = useState<string | null>(null);

  const handleStartAttack = () => {
    setSimState('attacking');
    onInteracted?.();

    setTimeout(() => {
      setLieutenantAliceOrder('ATTACK');
      setLieutenantBobOrder('RETREAT');
      setSimState('failed');
    }, 1200);
  };

  const handleReset = () => {
    setSimState('idle');
    setLieutenantAliceOrder(null);
    setLieutenantBobOrder(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      {/* 1. Header */}
      <div className="pb-4 border-b border-slate-800 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100 font-sans tracking-tight">
              {isVi ? 'Thông điệp truyền miệng' : 'Oral messages simulation'}
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              {isVi
                ? 'Khi thông điệp không có chữ ký số, nút độc hại có thể sửa đổi nội dung và phá vỡ đồng thuận.'
                : 'Without cryptographic signatures, malicious nodes can forge messages and split consensus.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isVi ? 'Khôi phục' : 'Reset'}</span>
            </button>
            <button
              type="button"
              onClick={handleStartAttack}
              disabled={simState !== 'idle'}
              className="px-4 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>
                {simState === 'attacking'
                  ? isVi
                    ? 'Đang phát tán tin giả...'
                    : 'Transmitting...'
                  : isVi
                  ? 'Mô phỏng giả mạo'
                  : 'Simulate forgery'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Flow & Theoretical Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Visual Diagram */}
        <div className="lg:col-span-8 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between min-h-[400px] space-y-4">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-800">
            <span className="text-slate-300 font-medium">
              {isVi ? 'Đường truyền thông điệp không bảo vệ' : 'Unsigned transmission path'}
            </span>
            <span className="text-slate-500 text-[11px] font-mono">
              {isVi ? 'Không có chữ ký số' : 'No digital signature'}
            </span>
          </div>

          {/* Node Diagram */}
          <div className="space-y-6 my-auto py-2">
            {/* Commander */}
            <div className="flex justify-center">
              <div className="p-3 rounded-lg bg-[#080C10] border border-emerald-500/40 text-center min-w-[180px]">
                <div className="text-[10px] text-emerald-400 font-medium">
                  {isVi ? 'Chỉ huy' : 'Commander'}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {isVi ? 'Lệnh ban đầu: ' : 'Order: '}
                  <span className="text-rose-400">{isVi ? 'Tấn công' : 'Attack'}</span>
                </div>
              </div>
            </div>

            {/* Traitor Node */}
            <div className="flex justify-center">
              <div
                className={`p-3 rounded-lg border text-center min-w-[200px] transition-colors ${
                  simState === 'idle'
                    ? 'bg-[#080C10] border-slate-800 text-slate-300'
                    : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                }`}
              >
                <div className="text-[10px] text-rose-400 font-medium">
                  {isVi ? 'Charlie (Nút trung gian / Phản bội)' : 'Charlie (Intermediate / Traitor)'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {simState === 'idle'
                    ? isVi
                      ? 'Nhận lệnh và chuyển tiếp'
                      : 'Receives and relays order'
                    : isVi
                    ? 'Chuyển thông điệp trái ngược cho 2 bên'
                    : 'Sends conflicting messages'}
                </div>
              </div>
            </div>

            {/* Recipients (Alice & Bob) */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800 text-center">
                <div className="text-xs font-medium text-slate-200">Alice</div>
                <div className="text-xs mt-1.5 font-mono">
                  {lieutenantAliceOrder ? (
                    <span className="text-rose-400 font-medium">
                      {isVi ? 'Nhận: Tấn công' : 'Got: Attack'}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">{isVi ? 'Đang chờ...' : 'Waiting...'}</span>
                  )}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800 text-center">
                <div className="text-xs font-medium text-slate-200">Bob</div>
                <div className="text-xs mt-1.5 font-mono">
                  {lieutenantBobOrder ? (
                    <span className="text-emerald-400 font-medium">
                      {isVi ? 'Nhận: Rút lui' : 'Got: Retreat'}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">{isVi ? 'Đang chờ...' : 'Waiting...'}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Outcome Status */}
          {simState === 'failed' && (
            <div className="p-3.5 rounded-lg bg-[#080C10] border border-slate-800 flex items-center gap-3 text-xs">
              <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
              <div>
                <span className="font-semibold text-slate-100">
                  {isVi ? 'Đồng thuận thất bại' : 'Consensus failed'}
                </span>
                <span className="text-slate-400 text-xs ml-2">
                  {isVi
                    ? 'Alice nhận "Tấn công", Bob nhận "Rút lui". Do không có chữ ký số, Bob không thể kiểm chứng tính toàn vẹn.'
                    : 'Alice got Attack, Bob got Retreat. Without signatures, Bob cannot verify authenticity.'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Theory */}
        <div className="lg:col-span-4 bg-[#0B0E12] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="pb-3 border-b border-slate-800">
              <h3 className="text-xs font-medium text-slate-300 font-sans">
                {isVi ? 'Hạn chế của thông điệp truyền miệng' : 'Limitations of oral messages'}
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-1">
                <div className="text-xs font-medium text-slate-200">
                  {isVi ? '1. Tính kháng chối bỏ (Non-repudiation)' : '1. Non-repudiation'}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Không có bằng chứng mã hóa chứng minh ai đã phát ngôn nội dung ban đầu.'
                    : 'Cannot mathematically prove who authored the original message.'}
                </p>
              </div>

              <div className="p-3 rounded-lg bg-[#080C10] border border-slate-800/80 space-y-1">
                <div className="text-xs font-medium text-slate-200">
                  {isVi ? '2. Tính toàn vẹn (Integrity)' : '2. Integrity'}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isVi
                    ? 'Không có hàm băm để phát hiện dữ liệu đã bị sửa đổi trên đường truyền.'
                    : 'No cryptographic digest exists to detect in-transit message tampering.'}
                </p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#080C10] border border-emerald-500/20 text-slate-400 text-xs leading-relaxed">
              <span className="font-medium text-emerald-400">
                {isVi ? 'Giải pháp: ' : 'Solution: '}
              </span>
              {isVi
                ? 'Áp dụng chữ ký số mật mã (ECDSA) để đảm bảo tính toàn vẹn và xác thực nguồn gốc.'
                : 'Apply cryptographic digital signatures (ECDSA) to ensure message origin and integrity.'}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        {onPrevStage ? (
          <button
            type="button"
            onClick={onPrevStage}
            className="px-4 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
          >
            {isVi ? 'Quay lại' : 'Back'}
          </button>
        ) : (
          <div />
        )}

        {onNextStage && (
          <button
            type="button"
            onClick={onNextStage}
            className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-medium text-xs flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>{isVi ? 'Tiếp tục: Thông điệp ký số' : 'Next: Signed Messages'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
