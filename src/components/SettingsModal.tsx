import React from 'react';
import { X, Volume2, Sparkles, Camera, Gauge, Sliders } from 'lucide-react';
import { CameraMode, GameSettings, GraphicsQuality, SpeedUnit } from '../types';
import { soundEngine } from '../game/audioSynth';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md pointer-events-auto">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">SETTINGS</h2>
            <p className="text-xs text-slate-400">ARCADE ENGINE PREFERENCES</p>
          </div>
          <button
            id="settings-close-btn"
            onClick={() => {
              soundEngine.playButtonClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="flex flex-col gap-5 py-6">
          {/* Music Volume */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-cyan-400" />
                MUSIC VOLUME
              </span>
              <span className="text-cyan-400">{Math.round(settings.musicVolume * 100)}%</span>
            </div>
            <input
              id="settings-music-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => onUpdateSettings({ musicVolume: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* SFX Volume */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                SFX VOLUME (ENGINE / CRASH / NITRO)
              </span>
              <span className="text-amber-400">{Math.round(settings.sfxVolume * 100)}%</span>
            </div>
            <input
              id="settings-sfx-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => onUpdateSettings({ sfxVolume: parseFloat(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Speed Unit */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-rose-400" />
              SPEEDOMETER UNIT
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['MPH', 'KMH'] as SpeedUnit[]).map((unit) => (
                <button
                  key={unit}
                  id={`settings-unit-${unit.toLowerCase()}`}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateSettings({ speedUnit: unit });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    settings.speedUnit === unit
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {unit === 'MPH' ? 'MILES / HR (MPH)' : 'KILOMETERS / HR (KM/H)'}
                </button>
              ))}
            </div>
          </div>

          {/* Graphics Quality */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              GRAPHICS QUALITY
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['LOW', 'MEDIUM', 'HIGH'] as GraphicsQuality[]).map((q) => (
                <button
                  key={q}
                  id={`settings-quality-${q.toLowerCase()}`}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateSettings({ graphicsQuality: q });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    settings.graphicsQuality === q
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Camera View Mode */}
          <div>
            <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-purple-400" />
              DEFAULT CAMERA MODE
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['NORMAL', 'CLOSE'] as CameraMode[]).map((cam) => (
                <button
                  key={cam}
                  id={`settings-camera-${cam.toLowerCase()}`}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateSettings({ cameraMode: cam });
                  }}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    settings.cameraMode === cam
                      ? 'bg-purple-500 text-slate-950 border-purple-400 shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                  }`}
                >
                  {cam === 'NORMAL' ? 'NORMAL (CHASE)' : 'CLOSE (ACTION)'}
                </button>
              ))}
            </div>
          </div>

          {/* Control Sensitivity */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
              <span className="flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-400" />
                STEERING SENSITIVITY
              </span>
              <span className="text-blue-400">{Math.round(settings.controlSensitivity * 100)}%</span>
            </div>
            <input
              id="settings-sensitivity-slider"
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={settings.controlSensitivity}
              onChange={(e) => onUpdateSettings({ controlSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-blue-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Footer */}
        <button
          id="settings-save-done-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onClose();
          }}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm transition-all"
        >
          SAVE &amp; CLOSE
        </button>
      </div>
    </div>
  );
};
