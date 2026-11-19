// Storage keys and data shape match flowtide.html, so exported/imported data stays compatible.
export const SESSIONS_KEY = 'flowtide.sessions';
export const DATA_KEY = 'flowtide.data';

export const DEF_SETTINGS = { focus: 25, brk: 5, longBrk: 15, longEvery: 4, cd: 45, cdSec: 0, sound: true, auto: false, goal: 300 };

export const SUBJECT_PRESETS = [
  { name: 'Math', color: '#3b6fd6' }, { name: 'Science', color: '#2f9e52' },
  { name: 'Languages', color: '#e0a52e' }, { name: 'Computer Science', color: '#7c5cff' },
  { name: 'Reading', color: '#e0529e' }, { name: 'Other', color: '#6e7681' },
];

export const INTERVALS = {
  '25-5-4': { focus: 25, brk: 5, longBrk: 15, longEvery: 4 },
  '50-10-4': { focus: 50, brk: 10, longBrk: 20, longEvery: 4 },
  '90-20-2': { focus: 90, brk: 20, longBrk: 30, longEvery: 2 },
};

export const INTERVAL_CHIPS = [
  { key: '25-5-4', name: 'Classic', sub: '25 / 5' },
  { key: '50-10-4', name: 'Deep', sub: '50 / 10' },
  { key: '90-20-2', name: 'Marathon', sub: '90 / 20' },
  { key: 'custom', name: 'Custom', sub: 'your own' },
];

export const COUNTDOWN_PRESETS = [
  { min: 15, label: '15m' }, { min: 25, label: '25m' }, { min: 45, label: '45m' },
  { min: 60, label: '1h' }, { min: 120, label: '2h' },
];

export const EXAM_PRESETS = [
  { min: 65, label: 'SAT 65m' }, { min: 70, label: 'GRE 70m' },
  { min: 95, label: 'MCAT 95m' }, { min: 35, label: 'LSAT 35m' },
];

export const AMBIENT_TYPES = [
  { key: 'pad', name: 'Dream Pad' },
  { key: 'rain', name: 'Rain' }, { key: 'ocean', name: 'Ocean waves' }, { key: 'wind', name: 'Wind' },
  { key: 'fire', name: 'Campfire' }, { key: 'cafe', name: 'Cafe hum' },
  { key: 'white', name: 'White noise' }, { key: 'brown', name: 'Brown noise' },
];

export const SCENES = [
  { key: 'plain', name: 'Pure Dark' }, { key: 'forest', name: 'Misty Forest' },
  { key: 'neon', name: 'Neon City' }, { key: 'space', name: 'Deep Space' },
  { key: 'library', name: 'Golden Library' }, { key: 'ocean', name: 'Ocean Dusk' },
  { key: 'snow', name: 'Snowfall' }, { key: 'rain', name: 'Rainy Night' },
  { key: 'aurora', name: 'Aurora' }, { key: 'beams', name: 'Beams' },
];

// Which canvas particle behaviour plays over each scene. Deep Space and Beams
// use Aceternity components for their motion instead, so they get none.
export const SCENE_PARTICLES = {
  plain: 'motes', forest: 'fireflies', neon: 'bokeh', space: 'none',
  library: 'motes', ocean: 'bubbles', snow: 'snow', rain: 'rain',
  aurora: 'motes', beams: 'none',
};

export const RING_RADIUS = 138;
