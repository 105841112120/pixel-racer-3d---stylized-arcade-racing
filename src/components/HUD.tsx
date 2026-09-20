import React from 'react';
import { Pause, Camera, Shield, Flame } from 'lucide-react';
import { CameraMode, RunStats, SpeedUnit } from '../types';

interface HUDProps {
  currentSpeedMph: number;
  nitroPercent: number;
  runStats: RunStats;
  speedUnit: SpeedUnit;
  cameraMode: CameraMode;
  countdownText: string | null;
  scoreFlyup: string | null;
  health: number;
  onPause: () => void;
  onToggleCamera: () => void;
  // Touch inputs for mobile/desktop
  onTouchInput: (action: 'left' | 'right' | 'gas' | 'brake' | 'nitro', active: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  currentSpeedMph,
  nitroPercent,
  runStats,
  speedUnit,
  cameraMode,
  countdownText,
  scoreFlyup,
  health,
  onPause,
  onToggleCamera,
  onTouchInput,
}) => {
  const displaySpeed =
    speedUnit === 'MPH'
      ? Math.round(currentSpeedMph)
      : Math.round(currentSpeedMph * 1.60934);

  const unitLabel = speedUnit === 'MPH' ? 'MPH' : 'KM/H';

  // Format speed as 3-digit arcade style: e.g. "071"
  const formattedSpeed = displaySpeed.toString().padStart(3, '0');

  // Touch helper preventing gesture defaults and double events
  const bindTouch = (action: 'left' | 'right' | 'gas' | 'brake' | 'nitro') => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      onTouchInput(action, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      onTouchInput(action, false);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      onTouchInput(action, false);
    },
    onMouseDown: () => onTouchInput(action, true),
    onMouseUp: () => onTouchInput(action, false),
    onMouseLeave: () => onTouchInput(action, false),
  });

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 select-none z-10">
      {/* ================= TOP COMPACT INSTRUMENT PANEL ================= */}
      <div className="w-full flex items-start justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
        {/* Left: Pause & Camera Controls + Health Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
          <button
            id="hud-pause-btn"
            onClick={onPause}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-cyan-400 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-lg shadow-black/40 cursor-pointer"
            title="Pause Game [ESC]"
          >
            <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
          </button>

          <button
            id="hud-camera-toggle-btn"
            onClick={onToggleCamera}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900/85 border border-slate-700/80 hover:border-amber-400 text-white flex items-center justify-center backdrop-blur-md transition-all active:scale-95 shadow-lg shadow-black/40 cursor-pointer"
            title="Toggle Camera Mode [C]"
          >
            <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            <span className="sr-only">Cam {cameraMode}</span>
          </button>

          {/* Health Shield */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-900/85 border border-slate-700/80 backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <div className="w-14 sm:w-20 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-emerald-500 transition-all duration-200"
                style={{ width: `${Math.max(0, health)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: COMPACT SPEEDOMETER & NITRO GAUGE (Moved to TOP as requested) */}
        <div className="flex flex-col items-center px-3 sm:px-5 py-1.5 sm:py-2 rounded-2xl bg-slate-900/90 border border-cyan-500/50 backdrop-blur-md shadow-xl">
          {/* Digital Speedometer */}
          <div className="flex items-baseline gap-1">
            <span className="font-display text-2xl sm:text-4xl font-black tracking-tight text-white drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]">
              {formattedSpeed}
            </span>
            <span className="font-display text-xs sm:text-sm font-bold text-cyan-400">
              {unitLabel}
            </span>
          </div>

          {/* Compact Nitro Meter */}
          <div className="flex items-center gap-1.5 mt-0.5">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
            <div className="w-20 sm:w-28 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  nitroPercent > 30
                    ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-cyan-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
                    : 'bg-red-500'
                }`}
                style={{ width: `${nitroPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-300">
              {Math.round(nitroPercent)}%
            </span>
          </div>

          {/* Distance Indicator */}
          <div className="text-[10px] font-semibold text-slate-400 tracking-wider mt-0.5">
            DIST: <span className="text-cyan-300 font-bold">{runStats.distance.toLocaleString()} M</span>
          </div>
        </div>

        {/* Right: Score & Traffic Passed */}
        <div className="flex flex-col items-end gap-1">
          <div className="px-3 sm:px-4 py-1.5 rounded-2xl bg-slate-900/85 border border-amber-500/40 backdrop-blur-md shadow-xl text-right">
            <div className="text-[9px] uppercase font-bold tracking-wider text-amber-400">SCORE</div>
            <div className="font-display font-bold text-base sm:text-xl text-white tracking-wide">
              {runStats.score.toLocaleString()}
            </div>
          </div>
          <div className="text-[10px] font-bold text-slate-300 bg-slate-900/75 px-2.5 py-0.5 rounded-full border border-slate-700/60 backdrop-blur-sm">
            PASSED: <span className="text-cyan-400">{runStats.carsPassed}</span>
          </div>
        </div>
      </div>

      {/* ================= CENTER OVERLAYS: COUNTDOWN & POPUPS ================= */}
      <div className="flex-1 flex items-center justify-center pointer-events-none">
        {countdownText && (
          <div className="animate-bounce">
            <div className="font-display text-7xl sm:text-9xl font-black text-amber-400 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] tracking-wider">
              {countdownText}
            </div>
          </div>
        )}

        {scoreFlyup && (
          <div className="animate-pulse">
            <div className="font-display text-xl sm:text-2xl font-extrabold text-cyan-300 bg-slate-900/90 border-2 border-cyan-400 px-5 py-2 rounded-2xl shadow-2xl backdrop-blur-md">
              {scoreFlyup}
            </div>
          </div>
        )}
      </div>

      {/* ================= BOTTOM CONTROLLERS: SEJAJAR, RAPIH & HORIZONTAL ================= */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-3 px-1 sm:px-4 pb-2 sm:pb-4 pointer-events-none">
        {/* Left Thumb: STEERING (KIRI / KANAN) - Aligned side-by-side */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Tombol KIRI */}
          <button
            id="ctrl-steer-left"
            {...bindTouch('left')}
            className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-500/40 border-2 border-slate-600/90 active:border-cyan-400 flex flex-col items-center justify-center text-white backdrop-blur-md shadow-xl transition-all active:scale-95 touch-none select-none cursor-pointer"
            aria-label="Steer Left"
          >
            <span className="font-display text-xl sm:text-2xl font-black text-white leading-none">◀</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 tracking-wider mt-0.5">KIRI</span>
          </button>

          {/* Tombol KANAN */}
          <button
            id="ctrl-steer-right"
            {...bindTouch('right')}
            className="w-16 h-14 sm:w-20 sm:h-16 rounded-2xl bg-slate-900/80 active:bg-cyan-500/40 border-2 border-slate-600/90 active:border-cyan-400 flex flex-col items-center justify-center text-white backdrop-blur-md shadow-xl transition-all active:scale-95 touch-none select-none cursor-pointer"
            aria-label="Steer Right"
          >
            <span className="font-display text-xl sm:text-2xl font-black text-white leading-none">▶</span>
            <span className="text-[9px] sm:text-[10px] font-bold text-cyan-300 tracking-wider mt-0.5">KANAN</span>
          </button>
        </div>

        {/* Right Thumb: PEDALS & NITRO (REM / NITRO / GAS) - Same height, aligned sejajar */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Tombol REM */}
          <button
            id="ctrl-pedal-brake"
            {...bindTouch('brake')}
            className="w-13 sm:w-16 h-14 sm:h-16 rounded-2xl bg-rose-950/75 active:bg-rose-600/60 border-2 border-rose-600/80 active:border-rose-400 flex flex-col items-center justify-center text-rose-200 backdrop-blur-md shadow-lg transition-all active:scale-95 touch-none select-none cursor-pointer px-2"
            aria-label="Brake"
          >
            <span className="text-[10px] sm:text-xs font-black tracking-wider text-rose-300">REM</span>
          </button>

          {/* Tombol NITRO */}
          <button
            id="ctrl-pedal-nitro"
            {...bindTouch('nitro')}
            className="w-14 sm:w-18 h-14 sm:h-16 rounded-2xl bg-amber-950/75 active:bg-amber-500/60 border-2 border-amber-600/80 active:border-amber-400 flex flex-col items-center justify-center text-amber-200 backdrop-blur-md shadow-lg transition-all active:scale-95 touch-none select-none cursor-pointer px-2"
            aria-label="Nitro Boost"
          >
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 fill-amber-400" />
            <span className="text-[9px] sm:text-[10px] font-black text-amber-300 tracking-wider">NITRO</span>
          </button>

          {/* Tombol GAS */}
          <button
            id="ctrl-pedal-gas"
            {...bindTouch('gas')}
            className="w-15 sm:w-20 h-14 sm:h-16 rounded-2xl bg-emerald-950/80 active:bg-emerald-500/60 border-2 border-emerald-500/90 active:border-emerald-400 flex flex-col items-center justify-center text-emerald-200 backdrop-blur-md shadow-xl transition-all active:scale-95 touch-none select-none cursor-pointer px-2.5"
            aria-label="Accelerate"
          >
            <span className="text-xs sm:text-sm font-black tracking-wider text-emerald-300">GAS</span>
          </button>
        </div>
      </div>
    </div>
  );
};
