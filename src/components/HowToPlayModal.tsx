import React from 'react';
import { X, Keyboard, Smartphone, Zap, Sparkles, ShieldAlert } from 'lucide-react';
import { soundEngine } from '../game/audioSynth';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto overflow-y-auto">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">HOW TO PLAY</h2>
            <p className="text-xs text-slate-400">ARCADE RACING GUIDE &amp; CONTROLS</p>
          </div>
          <button
            id="how-to-play-close-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-5 py-6">
          {/* Desktop Controls */}
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Keyboard className="w-4 h-4" />
              DESKTOP KEYBOARD CONTROLS
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">STEER LEFT / RIGHT</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-cyan-300 font-mono font-bold">A / D or ◀ ▶</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">ACCELERATE (GAS)</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-emerald-300 font-mono font-bold">W or ▲</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">BRAKE / SLOW</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-red-300 font-mono font-bold">S or ▼</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">ACTIVATE NITRO</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-amber-300 font-mono font-bold">SPACEBAR</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">TOGGLE CAMERA</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-purple-300 font-mono font-bold">C</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex justify-between items-center">
                <span className="text-slate-400">PAUSE GAME</span>
                <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-200 font-mono font-bold">ESC</span>
              </div>
            </div>
          </div>

          {/* Android Controls */}
          <div>
            <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              ANDROID TOUCHSCREEN (LANDSCAPE)
            </div>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed">
              Touch controls are embedded directly on the left (Steer Left/Right) and right (Brake, Gas, Nitro). Designed for comfortable two-thumb arcade driving!
            </div>
          </div>

          {/* Scoring Tips */}
          <div>
            <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              PRO RACING STRATEGIES
            </div>
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Near-Miss Bonus (+600 pts &amp; Nitro refill):</strong> Swerve closely past traffic without hitting them to immediately recharge your Nitro boost!
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Arcade Collision System:</strong> Minor bumps shave off your velocity and damage your vehicle. Maintain sharp reflexes across the 4 highway lanes to survive long runs!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <button
          id="how-to-play-done-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm transition-all"
        >
          GOT IT, LET&apos;S RACE!
        </button>
      </div>
    </div>
  );
};
