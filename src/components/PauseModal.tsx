import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { soundEngine } from '../game/audioSynth';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onOpenSettings,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 border border-slate-700 p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center">
        <h2 className="font-display font-black text-3xl text-white tracking-wider mb-6">
          GAME PAUSED
        </h2>

        <div className="w-full flex flex-col gap-3">
          <button
            id="pause-resume-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onResume();
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            RESUME RACE
          </button>

          <button
            id="pause-restart-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onRestart();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            RESTART
          </button>

          <button
            id="pause-settings-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onOpenSettings();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Settings className="w-4 h-4 text-cyan-400" />
            SETTINGS
          </button>

          <button
            id="pause-menu-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onMainMenu();
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Home className="w-4 h-4" />
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};
