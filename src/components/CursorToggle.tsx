import React from 'react';
import { useCursor } from '../context/CursorContext';
import { MousePointer } from 'lucide-react';

interface CursorToggleProps {
  showIcon?: boolean;
  compact?: boolean;
  className?: string;
  showSubtitle?: boolean;
}

export const CursorToggle: React.FC<CursorToggleProps> = ({
  showIcon = true,
  compact = false,
  className = '',
  showSubtitle = false,
}) => {
  const { customCursorEnabled, toggleCustomCursor } = useCursor();

  return (
    <div
      className={`flex items-center justify-between gap-3 select-none ${className}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {showIcon && (
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              customCursorEnabled
                ? 'bg-[#00C98D]/15 text-[#00C98D] border border-[#00C98D]/30'
                : 'bg-[#161F2C] text-[#717B8C] border border-[#1C2430]'
            }`}
          >
            <MousePointer className="w-3.5 h-3.5" />
          </div>
        )}
        <div className="min-w-0">
          <div className="text-xs font-medium text-[#F2F4F7] truncate flex items-center gap-1.5">
            <span>Con trỏ tùy chỉnh</span>
          </div>
          {showSubtitle && (
            <div className="text-[11px] text-[#717B8C] truncate">
              {customCursorEnabled ? 'Đang dùng con trỏ vàng' : 'Con trỏ mặc định của máy'}
            </div>
          )}
        </div>
      </div>

      {/* Switch Button */}
      <button
        type="button"
        role="switch"
        aria-checked={customCursorEnabled}
        aria-label="Bật hoặc tắt con trỏ tùy chỉnh"
        onClick={toggleCustomCursor}
        className={`relative inline-flex items-center shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
          compact ? 'h-5 w-9 p-0.5' : 'h-6 w-11 p-0.5'
        } ${
          customCursorEnabled
            ? 'bg-[#00C98D]/30 border border-[#00C98D]/60'
            : 'bg-[#161F2C] border border-[#2A3444]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block rounded-full transform transition-transform duration-200 ease-in-out flex items-center justify-center text-[8px] font-bold ${
            compact ? 'h-3.5 w-3.5' : 'h-4.5 w-4.5'
          } ${
            customCursorEnabled
              ? `${compact ? 'translate-x-4' : 'translate-x-5'} bg-[#00C98D] text-[#090A0F]`
              : 'translate-x-0.5 bg-[#717B8C] text-white'
          }`}
        />
        <span
          className={`absolute text-[9px] font-mono font-bold tracking-tight select-none pointer-events-none transition-opacity ${
            customCursorEnabled
              ? 'left-1.5 text-[#00C98D] opacity-100'
              : 'right-1.5 text-[#717B8C] opacity-100'
          }`}
        >
          {customCursorEnabled ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
};
