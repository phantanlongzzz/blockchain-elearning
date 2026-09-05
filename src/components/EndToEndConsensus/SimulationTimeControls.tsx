import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  StepForward,
  Gauge,
  Compass,
  Sliders,
  Bug,
} from 'lucide-react';
import { SimulationMode, SimulationSpeed } from './types';

interface SimulationTimeControlsProps {
  isPlaying: boolean;
  onTogglePlayPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  speed: SimulationSpeed;
  onChangeSpeed: (speed: SimulationSpeed) => void;
  mode: SimulationMode;
  onChangeMode: (mode: SimulationMode) => void;
  language: 'vi' | 'en';
}

export const SimulationTimeControls: React.FC<SimulationTimeControlsProps> = ({
  isPlaying,
  onTogglePlayPause,
  onStepForward,
  onReset,
  speed,
  onChangeSpeed,
  mode,
  onChangeMode,
  language,
}) => {
  const speeds: SimulationSpeed[] = [0.5, 1, 2, 4];

  return (
    <div
      id="e2e-simulation-time-controls"
      className="bg-[#080c16] border border-zinc-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3 font-sans text-xs select-none"
    >
      {/* Left: Mode Selection (Guided / Free / Debug) */}
      <div className="flex items-center gap-1.5">
        <span className="text-zinc-500 text-[11px] font-medium mr-1 hidden sm:inline">
          {language === 'vi' ? 'Chế độ:' : 'Mode:'}
        </span>
        <div className="inline-flex rounded-lg bg-[#060911] border border-zinc-800 p-0.5 text-xs font-mono">
          <button
            type="button"
            id="btn-mode-guided"
            onClick={() => onChangeMode('guided')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              mode === 'guided'
                ? 'bg-emerald-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className="w-3 h-3" />
            <span>{language === 'vi' ? 'Hướng dẫn' : 'Guided'}</span>
          </button>

          <button
            type="button"
            id="btn-mode-free"
            onClick={() => onChangeMode('free')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              mode === 'free'
                ? 'bg-blue-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3 h-3" />
            <span>{language === 'vi' ? 'Tự do' : 'Sandbox'}</span>
          </button>

          <button
            type="button"
            id="btn-mode-debug"
            onClick={() => onChangeMode('debug')}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer ${
              mode === 'debug'
                ? 'bg-purple-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Bug className="w-3 h-3" />
            <span>{language === 'vi' ? 'Gỡ lỗi' : 'Debug'}</span>
          </button>
        </div>
      </div>

      {/* Middle: Simulation Playback & Debugger Step Controls */}
      <div className="flex items-center gap-2">
        {/* Play/Pause */}
        <button
          type="button"
          id="btn-simulation-play-pause"
          onClick={onTogglePlayPause}
          className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-sm'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-sm'
          }`}
          title={
            isPlaying
              ? language === 'vi'
                ? 'Tạm dừng mô phỏng (Phím Space)'
                : 'Pause simulation (Space)'
              : language === 'vi'
              ? 'Tiếp tục mô phỏng (Phím Space)'
              : 'Play simulation (Space)'
          }
        >
          {isPlaying ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Tạm dừng' : 'Pause'}</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Chạy' : 'Play'}</span>
            </>
          )}
        </button>

        {/* Step-by-step Execution (Debugger) */}
        <button
          type="button"
          id="btn-simulation-step"
          onClick={onStepForward}
          disabled={isPlaying}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-medium text-xs flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
          title={
            language === 'vi'
              ? 'Thực thi một sự kiện đơn lẻ (Phím N)'
              : 'Execute single simulation step (N)'
          }
        >
          <StepForward className="w-3.5 h-3.5 text-purple-400" />
          <span>{language === 'vi' ? 'Từng bước' : 'Step'}</span>
        </button>

        {/* Reset */}
        <button
          type="button"
          id="btn-simulation-reset"
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          title={language === 'vi' ? 'Đặt lại toàn bộ (Phím R)' : 'Reset simulation (R)'}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{language === 'vi' ? 'Đặt lại' : 'Reset'}</span>
        </button>
      </div>

      {/* Right: Speed Selector (0.5x, 1x, 2x, 4x) */}
      <div className="flex items-center gap-1.5">
        <Gauge className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-zinc-500 text-[11px] font-medium mr-1 hidden sm:inline">
          {language === 'vi' ? 'Tốc độ:' : 'Speed:'}
        </span>
        <div className="inline-flex rounded-lg bg-[#060911] border border-zinc-800 p-0.5 text-xs font-mono">
          {speeds.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                speed === s
                  ? 'bg-zinc-800 text-text-primary font-bold border border-border-primary'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
