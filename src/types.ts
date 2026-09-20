export type GameState =
  | 'BOOT'
  | 'MAIN_MENU'
  | 'GARAGE'
  | 'COUNTDOWN'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'SETTINGS';

export type SpeedUnit = 'MPH' | 'KMH';

export type GraphicsQuality = 'LOW' | 'MEDIUM' | 'HIGH';

export type CameraMode = 'NORMAL' | 'CLOSE';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  graphicsQuality: GraphicsQuality;
  cameraMode: CameraMode;
  speedUnit: SpeedUnit;
  controlSensitivity: number;
}

export interface CarStats {
  id: string;
  name: string;
  category: string;
  topSpeed: number; // in mph
  acceleration: number; // 0-100 scale
  handling: number; // 0-100 scale
  nitroCapacity: number; // seconds
  color: string;
  stripeColor: string;
  unlocked: boolean;
}

export interface RunStats {
  score: number;
  distance: number; // meters
  topSpeed: number; // mph
  carsPassed: number;
  nearMisses: number;
  nitroBonus: number;
  timeSurvived: number; // seconds
}

export interface HighScoreRecord {
  highScore: number;
  maxDistance: number;
  maxSpeed: number;
  totalCarsPassed: number;
  totalRaces: number;
}

export interface TrafficVehicleData {
  id: number;
  type: 'sedan' | 'sports' | 'suv' | 'truck' | 'van';
  lane: number; // 0, 1, 2, 3
  z: number;
  x: number;
  speed: number;
  color: string;
  length: number;
  width: number;
  height: number;
}
