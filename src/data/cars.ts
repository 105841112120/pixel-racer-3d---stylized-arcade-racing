import { CarStats } from '../types';

export const DEFAULT_CARS: CarStats[] = [
  {
    id: 'cyclone-gt',
    name: 'Cyclone GT (Arcade Blue)',
    category: 'Class-S Sports Coupe',
    topSpeed: 135,
    acceleration: 85,
    handling: 88,
    nitroCapacity: 100,
    color: '#00b4d8', // Iconic Cyan-Blue
    stripeColor: '#ffffff', // Dual White Racing Stripes
    unlocked: true,
  },
  {
    id: 'canyon-viper',
    name: 'Canyon Viper (Sunset Edition)',
    category: 'Muscle Arcade',
    topSpeed: 145,
    acceleration: 92,
    handling: 78,
    nitroCapacity: 90,
    color: '#f97316', // Sunset Orange
    stripeColor: '#18181b', // Black Stripes
    unlocked: true,
  },
  {
    id: 'thunder-blade',
    name: 'Thunder Blade (High Velocity)',
    category: 'Hyper Prototype',
    topSpeed: 155,
    acceleration: 96,
    handling: 94,
    nitroCapacity: 110,
    color: '#eab308', // Solar Yellow
    stripeColor: '#ffffff',
    unlocked: true,
  },
];

export const AVAILABLE_COLORS = [
  { name: 'Cyan Blue', hex: '#00b4d8' },
  { name: 'Sunset Orange', hex: '#f97316' },
  { name: 'Solar Yellow', hex: '#eab308' },
  { name: 'Crimson Red', hex: '#ef4444' },
  { name: 'Emerald Green', hex: '#10b981' },
  { name: 'Royal Violet', hex: '#8b5cf6' },
  { name: 'Obsidian Black', hex: '#1e293b' },
  { name: 'Glacier White', hex: '#f8fafc' },
];

export const STRIPE_COLORS = [
  { name: 'Pure White', hex: '#ffffff' },
  { name: 'Midnight Black', hex: '#0f172a' },
  { name: 'Racing Yellow', hex: '#fbbf24' },
  { name: 'Signal Red', hex: '#dc2626' },
];
