import React from 'react';
import { RotateCcw, Home, Trophy, Gauge, Navigation, Flame } from 'lucide-react';
import { RunStats } from '../types';
import { soundEngine } from '../game/audioSynth';

interface GameOverModalProps {
  stats: RunStats;
  highScore: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  onRetry,
  onMainMenu,
}) => {
  const isNewHighScore = stats.score > highScore;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-lg pointer-events-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900/95 border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        {/* Header */}
        <div className="inline-block px-4 py-1 mb-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-bold text-xs uppercase tracking-widest">
          COLLISION CRITICAL
        </div>

        <h2 className="font-display font-black text-4xl sm:text-5xl text-white tracking-wider mb-1">
          RACE OVER
        </h2>

        {isNewHighScore && (
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm mb-4 animate-bounce">
            <Trophy className="w-4 h-4 fill-amber-400" />
            NEW PERSONAL HIGH SCORE!
          </div>
        )}

        {/* Primary Run Score */}
        <div className="w-full p-4 rounded-2xl bg-slate-950/70 border border-slate-800 my-4">
          <div className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            TOTAL SCORE
          </div>
          <div className="font-display font-black text-4xl sm:text-5xl text-cyan-300 tracking-wide mt-1">
            {stats.score.toLocaleString()}
          </div>
          <div className="text-xs font-medium text-slate-400 mt-1">
            ALL-TIME RECORD: <span className="text-amber-400 font-bold">{Math.max(highScore, stats.score).toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Run Statistics */}
        <div className="w-full grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              DISTANCE
            </div>
            <div className="font-display font-bold text-lg text-white mt-0.5">
              {stats.distance.toLocaleString()} M
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              TOP SPEED
            </div>
            <div className="font-display font-bold text-lg text-white mt-0.5">
              {stats.topSpeed} MPH
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left">
            <div className="text-[11px] text-slate-400">CARS PASSED</div>
            <div className="font-display font-bold text-lg text-emerald-400 mt-0.5">
              {stats.carsPassed}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-left">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              NEAR MISSES
            </div>
            <div className="font-display font-bold text-lg text-rose-400 mt-0.5">
              {stats.nearMisses}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row items-center gap-3">
          <button
            id="game-over-retry-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onRetry();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 active:scale-95 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            RETRY RACE
          </button>

          <button
            id="game-over-menu-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onMainMenu();
            }}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 text-white font-display font-bold text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
