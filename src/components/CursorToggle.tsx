import React from 'react';
import { useCursor } from '../context/CursorContext';

interface CursorToggleProps {
  className?: string;
  label?: string;
  // Keep optional props for backward compatibility
  showIcon?: boolean;
  compact?: boolean;
  showSubtitle?: boolean;
}

export const CursorToggle: React.FC<CursorToggleProps> = ({
  className = '',
  label = 'Cursor',
}) => {
  const { customCursorEnabled, toggleCustomCursor } = useCursor();

  return (
    <div
      className={`flex items-center justify-between gap-4 select-none ${className}`}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <span className="text-xs font-medium text-[#F2F4F7] tracking-tight">
        {label}
      </span>

      {/* Dark Minimalist Switch */}
      <button
        type="button"
        role="switch"
        aria-checked={customCursorEnabled}
        aria-label="Toggle Cursor"
        onClick={toggleCustomCursor}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-1 focus-visible:ring-[#00C98D] ${
          customCursorEnabled
            ? 'bg-[#00C98D]'
            : 'bg-[#1C2430] hover:bg-[#242E3D]'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform duration-200 ease-in-out ${
            customCursorEnabled
              ? 'translate-x-4 bg-[#090A0F]'
              : 'translate-x-0 bg-[#717B8C]'
          }`}
        />
      </button>
    </div>
  );
};
