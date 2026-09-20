import { useEffect, useRef, useState } from 'react';
import { ArcadeGameEngine } from './game/threeEngine';
import { HUD } from './components/HUD';
import { MainMenu } from './components/MainMenu';
import { Garage } from './components/Garage';
import { GameOverModal } from './components/GameOverModal';
import { PauseModal } from './components/PauseModal';
import { SettingsModal } from './components/SettingsModal';
import { RecordsModal } from './components/RecordsModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { DEFAULT_CARS } from './data/cars';
import {
  CameraMode,
  CarStats,
  GameSettings,
  GameState,
  HighScoreRecord,
  RunStats,
} from './types';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ArcadeGameEngine | null>(null);

  // Game States
  const [gameState, setGameState] = useState<GameState>('MAIN_MENU');
  const [showSettings, setShowSettings] = useState(false);
  const [showRecords, setShowRecords] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Runtime HUD Data
  const [currentSpeedMph, setCurrentSpeedMph] = useState(0);
  const [nitroPercent, setNitroPercent] = useState(100);
  const [health, setHealth] = useState(100);
  const [countdownText, setCountdownText] = useState<string | null>(null);
  const [scoreFlyup, setScoreFlyup] = useState<string | null>(null);
  const [runStats, setRunStats] = useState<RunStats>({
    score: 0,
    distance: 0,
    topSpeed: 0,
    carsPassed: 0,
    nearMisses: 0,
    nitroBonus: 0,
    timeSurvived: 0,
  });

  // Selected Car
  const [currentCar, setCurrentCar] = useState<CarStats>(() => {
    const saved = localStorage.getItem('PR3D_SelectedCar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return DEFAULT_CARS[0];
  });

  // Settings
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('PR3D_Settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      musicVolume: 0.6,
      sfxVolume: 0.8,
      graphicsQuality: 'HIGH',
      cameraMode: 'NORMAL',
      speedUnit: 'MPH',
      controlSensitivity: 1.0,
    };
  });

  // Records / Save
  const [records, setRecords] = useState<HighScoreRecord>(() => {
    const saved = localStorage.getItem('PR3D_Records');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      highScore: 12500,
      maxDistance: 1450,
      maxSpeed: 142,
      totalCarsPassed: 48,
      totalRaces: 6,
    };
  });

  // Initialize 3D Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ArcadeGameEngine(containerRef.current, currentCar, {
      onScoreUpdate: (stats, speed, nitro) => {
        setRunStats(stats);
        setCurrentSpeedMph(speed);
        setNitroPercent(nitro);
      },
      onNearMiss: (points) => {
        setScoreFlyup(`+${points} NEAR MISS!`);
        setTimeout(() => setScoreFlyup(null), 1200);
      },
      onCollision: (damage) => {
        setHealth((prev) => Math.max(0, prev - damage));
      },
      onGameOver: (finalStats) => {
        setGameState('GAME_OVER');
        // Update records
        setRecords((prev) => {
          const updated: HighScoreRecord = {
            highScore: Math.max(prev.highScore, finalStats.score),
            maxDistance: Math.max(prev.maxDistance, finalStats.distance),
            maxSpeed: Math.max(prev.maxSpeed, finalStats.topSpeed),
            totalCarsPassed: prev.totalCarsPassed + finalStats.carsPassed,
            totalRaces: prev.totalRaces + 1,
          };
          localStorage.setItem('PR3D_Records', JSON.stringify(updated));
          return updated;
        });
      },
    });

    engine.setQuality(settings.graphicsQuality);
    engine.setCameraMode(settings.cameraMode);
    engine.animate();
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync settings changes to engine and localStorage
  const handleUpdateSettings = (newPartial: Partial<GameSettings>) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    localStorage.setItem('PR3D_Settings', JSON.stringify(updated));

    if (engineRef.current) {
      if (newPartial.graphicsQuality) engineRef.current.setQuality(newPartial.graphicsQuality);
      if (newPartial.cameraMode) engineRef.current.setCameraMode(newPartial.cameraMode);
    }
  };

  // Sync car customization
  const handleSelectCar = (car: CarStats) => {
    setCurrentCar(car);
    localStorage.setItem('PR3D_SelectedCar', JSON.stringify(car));
    engineRef.current?.updateCarCustomization(car);
  };

  const handleUpdateCarColors = (color: string, stripeColor: string) => {
    const updated: CarStats = { ...currentCar, color, stripeColor };
    setCurrentCar(updated);
    localStorage.setItem('PR3D_SelectedCar', JSON.stringify(updated));
    engineRef.current?.updateCarCustomization(updated);
  };

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!engineRef.current) return;

      if (e.key === 'Escape') {
        if (gameState === 'PLAYING') {
          handlePause();
        } else if (gameState === 'PAUSED') {
          handleResume();
        }
        return;
      }

      if (e.key === 'c' || e.key === 'C') {
        engineRef.current.toggleCamera();
        setSettings((prev) => {
          const nextMode: CameraMode = prev.cameraMode === 'NORMAL' ? 'CLOSE' : 'NORMAL';
          return { ...prev, cameraMode: nextMode };
        });
        return;
      }

      if (gameState !== 'PLAYING') return;

      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.input.left = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.input.right = true;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.input.accelerate = true;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.input.brake = true;
      if (e.key === ' ') {
        e.preventDefault();
        engineRef.current.input.nitro = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') engineRef.current.input.left = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') engineRef.current.input.right = false;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') engineRef.current.input.accelerate = false;
      if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') engineRef.current.input.brake = false;
      if (e.key === ' ') engineRef.current.input.nitro = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Touch Controls from HUD
  const handleTouchInput = (action: 'left' | 'right' | 'gas' | 'brake' | 'nitro', active: boolean) => {
    if (!engineRef.current) return;
    if (action === 'left') engineRef.current.input.left = active;
    if (action === 'right') engineRef.current.input.right = active;
    if (action === 'gas') engineRef.current.input.accelerate = active;
    if (action === 'brake') engineRef.current.input.brake = active;
    if (action === 'nitro') engineRef.current.input.nitro = active;
  };

  // Race Lifecycle
  const handleStartRace = () => {
    setGameState('COUNTDOWN');
    setHealth(100);

    // 3, 2, 1, GO! Countdown sequence
    setCountdownText('3');
    setTimeout(() => {
      setCountdownText('2');
      setTimeout(() => {
        setCountdownText('1');
        setTimeout(() => {
          setCountdownText('GO!');
          setTimeout(() => {
            setCountdownText(null);
            setGameState('PLAYING');
            engineRef.current?.startRace();
          }, 600);
        }, 800);
      }, 800);
    }, 800);
  };

  const handlePause = () => {
    setGameState('PAUSED');
    engineRef.current?.pauseRace();
  };

  const handleResume = () => {
    setGameState('PLAYING');
    engineRef.current?.resumeRace();
  };

  const handleRestart = () => {
    handleStartRace();
  };

  const handleMainMenu = () => {
    setGameState('MAIN_MENU');
    engineRef.current?.pauseRace();
  };

  const handleResetRecords = () => {
    const blank: HighScoreRecord = {
      highScore: 0,
      maxDistance: 0,
      maxSpeed: 0,
      totalCarsPassed: 0,
      totalRaces: 0,
    };
    setRecords(blank);
    localStorage.setItem('PR3D_Records', JSON.stringify(blank));
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 font-body select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        id="racing-3d-viewport"
        ref={containerRef}
        className="absolute inset-0 w-full h-full z-0 cursor-default"
      />

      {/* In-Game HUD (Visible during PLAYING, COUNTDOWN, PAUSED) */}
      {(gameState === 'PLAYING' || gameState === 'COUNTDOWN' || gameState === 'PAUSED') && (
        <HUD
          currentSpeedMph={currentSpeedMph}
          nitroPercent={nitroPercent}
          runStats={runStats}
          speedUnit={settings.speedUnit}
          cameraMode={settings.cameraMode}
          countdownText={countdownText}
          scoreFlyup={scoreFlyup}
          health={health}
          onPause={handlePause}
          onToggleCamera={() => {
            engineRef.current?.toggleCamera();
            setSettings((prev) => ({
              ...prev,
              cameraMode: prev.cameraMode === 'NORMAL' ? 'CLOSE' : 'NORMAL',
            }));
          }}
          onTouchInput={handleTouchInput}
        />
      )}

      {/* Main Menu */}
      {gameState === 'MAIN_MENU' && (
        <MainMenu
          onStartRace={handleStartRace}
          onOpenGarage={() => setGameState('GARAGE')}
          onOpenRecords={() => setShowRecords(true)}
          onOpenHowToPlay={() => setShowHowToPlay(true)}
          onOpenSettings={() => setShowSettings(true)}
        />
      )}

      {/* Garage Screen */}
      {gameState === 'GARAGE' && (
        <Garage
          currentCar={currentCar}
          onSelectCar={handleSelectCar}
          onUpdateCarColors={handleUpdateCarColors}
          onBack={() => setGameState('MAIN_MENU')}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <GameOverModal
          stats={runStats}
          highScore={records.highScore}
          onRetry={handleStartRace}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenSettings={() => setShowSettings(true)}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Records Modal */}
      {showRecords && (
        <RecordsModal
          records={records}
          onClose={() => setShowRecords(false)}
          onResetRecords={handleResetRecords}
        />
      )}

      {/* How To Play Modal */}
      {showHowToPlay && (
        <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
      )}
    </main>
  );
}
