import React from 'react';
import { ArrowLeft, Check, Gauge, Zap, Compass, Flame } from 'lucide-react';
import { CarStats } from '../types';
import { AVAILABLE_COLORS, DEFAULT_CARS, STRIPE_COLORS } from '../data/cars';
import { soundEngine } from '../game/audioSynth';

interface GarageProps {
  currentCar: CarStats;
  onSelectCar: (car: CarStats) => void;
  onUpdateCarColors: (color: string, stripeColor: string) => void;
  onBack: () => void;
}

export const Garage: React.FC<GarageProps> = ({
  currentCar,
  onSelectCar,
  onUpdateCarColors,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 pointer-events-auto bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      {/* Top Header */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <button
          id="garage-back-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:border-cyan-400 text-slate-200 text-sm font-semibold transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          BACK TO MENU
        </button>

        <div className="text-right">
          <h2 className="font-display font-bold text-2xl text-white">GARAGE &amp; TUNING</h2>
          <p className="text-xs text-slate-400">VEHICLE CUSTOMIZATION</p>
        </div>
      </div>

      {/* Center Vehicle Selection & Stats */}
      <div className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left: Car Models Carousel */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">SELECT VEHICLE</h3>
          {DEFAULT_CARS.map((car) => {
            const isSelected = currentCar.id === car.id;
            return (
              <button
                key={car.id}
                id={`garage-select-${car.id}`}
                onClick={() => {
                  soundEngine.playButtonClick();
                  onSelectCar(car);
                }}
                className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-950/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="font-display font-bold text-base text-white">{car.name}</div>
                  <div className="text-xs text-slate-400">{car.category}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-cyan-400 flex items-center justify-center">
                    <Check className="w-4 h-4 text-slate-950 font-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Center: Live Vehicle Preview Card */}
        <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/50 border border-slate-800 text-center">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">
            CURRENT VEHICLE
          </div>
          <div className="font-display font-black text-3xl text-white mb-4">
            {currentCar.name}
          </div>

          {/* Color Preview Swatch */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-700">
            <div
              className="w-10 h-10 rounded-xl shadow-inner border border-white/20"
              style={{ backgroundColor: currentCar.color }}
            />
            <div className="text-left text-xs">
              <div className="text-slate-400">Body Finish</div>
              <div className="font-bold text-white uppercase">{currentCar.color}</div>
            </div>
            <div
              className="w-4 h-10 rounded-md border border-white/30"
              style={{ backgroundColor: currentCar.stripeColor }}
            />
          </div>
        </div>

        {/* Right: Technical Stats & Color Palettes */}
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-slate-900/80 border border-slate-800">
          {/* Stats Bars */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              PERFORMANCE SPECS
            </h3>

            <div className="flex flex-col gap-3">
              {/* SPEED */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    TOP SPEED
                  </span>
                  <span className="text-cyan-400 font-bold">{currentCar.topSpeed} MPH</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${(currentCar.topSpeed / 170) * 100}%` }}
                  />
                </div>
              </div>

              {/* ACCELERATION */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    ACCELERATION
                  </span>
                  <span className="text-amber-400 font-bold">{currentCar.acceleration}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full"
                    style={{ width: `${currentCar.acceleration}%` }}
                  />
                </div>
              </div>

              {/* HANDLING */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-400" />
                    HANDLING
                  </span>
                  <span className="text-emerald-400 font-bold">{currentCar.handling}%</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full"
                    style={{ width: `${currentCar.handling}%` }}
                  />
                </div>
              </div>

              {/* NITRO */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-rose-400" />
                    NITRO DURATION
                  </span>
                  <span className="text-rose-400 font-bold">{currentCar.nitroCapacity} SEC</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-rose-400 rounded-full"
                    style={{ width: `${(currentCar.nitroCapacity / 120) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palettes */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              BODY PAINT
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_COLORS.map((col) => (
                <button
                  key={col.hex}
                  id={`color-paint-${col.name.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateCarColors(col.hex, currentCar.stripeColor);
                  }}
                  className={`h-9 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                    currentCar.color === col.hex ? 'border-white ring-2 ring-cyan-400' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {currentCar.color === col.hex && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              RACING STRIPES
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {STRIPE_COLORS.map((col) => (
                <button
                  key={col.hex}
                  id={`color-stripe-${col.name.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    soundEngine.playButtonClick();
                    onUpdateCarColors(currentCar.color, col.hex);
                  }}
                  className={`h-8 rounded-xl border flex items-center justify-center transition-all active:scale-95 ${
                    currentCar.stripeColor === col.hex ? 'border-white ring-2 ring-cyan-400' : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: col.hex }}
                  title={col.name}
                >
                  {currentCar.stripeColor === col.hex && (
                    <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-center pt-4">
        <button
          id="garage-done-btn"
          onClick={() => {
            soundEngine.playButtonClick();
            onBack();
          }}
          className="px-10 py-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-base transition-all active:scale-95 shadow-lg shadow-cyan-500/20"
        >
          CONFIRM CONFIGURATION
        </button>
      </div>
    </div>
  );
};
