import React, { useState } from 'react';
import { Play, Wrench, Trophy, HelpCircle, Settings, LogOut, Check } from 'lucide-react';
import { soundEngine } from '../game/audioSynth';

interface MainMenuProps {
  onStartRace: () => void;
  onOpenGarage: () => void;
  onOpenRecords: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  onStartRace,
  onOpenGarage,
  onOpenRecords,
  onOpenHowToPlay,
  onOpenSettings,
}) => {
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleButtonClick = (action: () => void) => {
    soundEngine.playButtonClick();
    action();
  };

  const handleExitClick = () => {
    soundEngine.playButtonClick();
    setShowExitConfirm(true);
  };

  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-between p-6 sm:p-10 pointer-events-auto bg-gradient-to-t from-slate-950/95 via-slate-950/40 to-transparent select-none">
      {/* Spacer Top */}
      <div className="w-full max-w-5xl h-6" />

      {/* Center Title Brand */}
      <div className="text-center my-auto flex flex-col items-center">
        <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-200 to-cyan-400 drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
          PIXEL RACER 3D
        </h1>

        <p className="font-display font-semibold text-sm sm:text-lg text-amber-300 tracking-widest uppercase mt-3 drop-shadow-md">
          &quot;BALAP CEPAT DI JALAN RAYA&quot;
        </p>
      </div>

      {/* Main Action Buttons */}
      <div className="w-full max-w-md flex flex-col gap-3 mb-6">
        {/* START RACE */}
        <button
          id="menu-start-race-btn"
          onClick={() => handleButtonClick(onStartRace)}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 active:scale-[0.98] text-white font-display font-bold text-xl tracking-wider flex items-center justify-center gap-3 shadow-[0_8px_30px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          START RACE
        </button>

        {/* Secondary 2-Column Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* GARAGE */}
          <button
            id="menu-garage-btn"
            onClick={() => handleButtonClick(onOpenGarage)}
            className="py-3 px-4 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Wrench className="w-4 h-4 text-cyan-400" />
            GARAGE
          </button>

          {/* RECORDS */}
          <button
            id="menu-records-btn"
            onClick={() => handleButtonClick(onOpenRecords)}
            className="py-3 px-4 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            RECORDS
          </button>

          {/* HOW TO PLAY */}
          <button
            id="menu-how-to-play-btn"
            onClick={() => handleButtonClick(onOpenHowToPlay)}
            className="py-3 px-4 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            HOW TO PLAY
          </button>

          {/* SETTINGS */}
          <button
            id="menu-settings-btn"
            onClick={() => handleButtonClick(onOpenSettings)}
            className="py-3 px-4 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-slate-100 font-semibold text-sm flex items-center justify-center gap-2 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <Settings className="w-4 h-4 text-slate-300" />
            SETTINGS
          </button>
        </div>

        {/* EXIT */}
        <button
          id="menu-exit-btn"
          onClick={handleExitClick}
          className="w-full py-3 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-slate-400" />
          EXIT
        </button>
      </div>

      {/* Exit Confirmation Dialog */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 text-center shadow-2xl">
            <h3 className="font-display font-bold text-lg text-white mb-2">KELUAR DARI PERMAINAN</h3>
            <p className="text-xs text-slate-300 mb-6 leading-relaxed">
              Pada versi Windows Standalone (.exe), opsi ini akan menutup aplikasi secara langsung. Apakah Anda ingin keluar?
            </p>
            <div className="flex gap-3">
              <button
                id="exit-cancel-btn"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setShowExitConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                BATAL
              </button>
              <button
                id="exit-confirm-btn"
                onClick={() => {
                  soundEngine.playButtonClick();
                  setShowExitConfirm(false);
                  try {
                    window.close();
                  } catch {}
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                YA, KELUAR
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
