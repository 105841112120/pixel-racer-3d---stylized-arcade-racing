import React from 'react';
import { X, Trophy, Gauge, Navigation, Car, ShieldCheck } from 'lucide-react';
import { HighScoreRecord } from '../types';
import { soundEngine } from '../game/audioSynth';

interface RecordsModalProps {
  records: HighScoreRecord;
  onClose: () => void;
  onResetRecords: () => void;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  records,
  onClose,
  onResetRecords,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">RECORDS &amp; STATS</h2>
            <p className="text-xs text-slate-400">OFFLINE CAREER ARCHIVES</p>
          </div>
          <button
            id="records-close-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Offline Badge */}
        <div className="flex items-center gap-2 p-3 my-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          Data profil dan rekor balap tersimpan secara lokal (100% Offline)
        </div>

        {/* Big High Score Box */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/40 text-center mb-4">
          <div className="text-xs font-semibold text-amber-400 uppercase tracking-widest flex items-center justify-center gap-1">
            <Trophy className="w-4 h-4 fill-amber-400" />
            ALL-TIME HIGH SCORE
          </div>
          <div className="font-display font-black text-4xl sm:text-5xl text-white tracking-wider mt-1">
            {records.highScore.toLocaleString()}
          </div>
        </div>

        {/* Record Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              LONGEST RUN
            </div>
            <div className="font-display font-bold text-xl text-white">
              {records.maxDistance.toLocaleString()} M
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Gauge className="w-3.5 h-3.5 text-amber-400" />
              PEAK VELOCITY
            </div>
            <div className="font-display font-bold text-xl text-white">
              {records.maxSpeed} MPH
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Car className="w-3.5 h-3.5 text-purple-400" />
              CARS PASSED
            </div>
            <div className="font-display font-bold text-xl text-purple-300">
              {records.totalCarsPassed.toLocaleString()}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
              <Trophy className="w-3.5 h-3.5 text-rose-400" />
              RACES FINISHED
            </div>
            <div className="font-display font-bold text-xl text-rose-300">
              {records.totalRaces.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="records-reset-btn"
            onClick={() => {
              if (confirm('Reset career records and high score?')) {
                onResetRecords();
              }
            }}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 text-xs font-semibold transition-all"
          >
            RESET
          </button>

          <button
            id="records-done-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="flex-1 py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm transition-all"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
