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
  { key: '25-5-4', name: 'classic', sub: '25 / 5' },
  { key: '50-10-4', name: 'deep', sub: '50 / 10' },
  { key: '90-20-2', name: 'marathon', sub: '90 / 20' },
  { key: 'custom', name: 'custom', sub: 'your own' },
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

/**
 * Vibes: each one sets the painted scene (src/lib/scenes.js), the colour tokens,
 * the effect drawn on top and a suggested sound mix. The layout never changes.
 * Colours are "r g b" triplets so Tailwind can add opacity (bg-accent/15).
 *   base: page colour behind everything     ink: text
 *   accent / accentInk: ring, buttons, stickers and the text on them
 *   glass: tint of see-through cards (glassA = normal, glassStrongA = popovers)
 *   surface: solid colour for native dropdowns and tooltips
 *   scrim: soft shade behind the clock so it reads over the scene
 * Each palette pairs one colour family with a contrasting accent.
 */
export const VIBES = [
  {
    key: 'lofi', name: 'late night lofi', sticker: 'locked in', fx: 'rain', fxColors: ['#c7d4ff'], mix: ['rain', 'pad'],
    base: '18 14 42', ink: '244 239 255', accent: '255 196 107', accentInk: '34 24 10',
    glass: '20 14 48', glassA: 0.42, glassStrongA: 0.86, surface: '32 25 66', scrim: 'rgba(12,8,30,.45)',
    dots: ['#2a2160', '#8a6fd6', '#ffc46b'],
  },
  {
    key: 'koi', name: 'koi pond', sticker: 'zen mode', fx: 'sparkles', fxColors: ['#fffbe6'], mix: ['pad', 'ocean'],
    base: '15 59 64', ink: '242 251 248', accent: '255 138 76', accentInk: '42 18 6',
    glass: '8 48 54', glassA: 0.38, glassStrongA: 0.88, surface: '16 66 72', scrim: 'rgba(5,35,40,.42)',
    dots: ['#0f4a52', '#5f9e6e', '#ff8a4c'],
  },
  {
    key: 'sakura', name: 'cherry blossom', sticker: 'in bloom', fx: 'petals', fxColors: ['#f7a6bd', '#fbc6d4', '#f28fae'], mix: ['pad', 'wind'],
    base: '251 232 238', ink: '59 32 64', accent: '95 116 214', accentInk: '255 255 255',
    glass: '255 255 255', glassA: 0.45, glassStrongA: 0.9, surface: '255 244 248', scrim: 'rgba(255,240,246,.55)',
    dots: ['#f6b5c7', '#a4ade0', '#5f74d6'],
  },
  {
    key: 'aurora', name: 'northern lights', sticker: 'northern lights', fx: 'snow', fxColors: ['#ffffff'], mix: ['wind', 'pad'],
    base: '7 18 38', ink: '238 252 255', accent: '255 122 200', accentInk: '42 10 31',
    glass: '8 20 40', glassA: 0.4, glassStrongA: 0.88, surface: '16 32 58', scrim: 'rgba(4,10,25,.45)',
    dots: ['#0b1d3a', '#4ef0a8', '#ff7ac8'],
  },
  {
    key: 'academia', name: 'dark academia', sticker: 'study hall', fx: 'embers', fxColors: ['#ffb066', '#ffd08a'], mix: ['fire', 'rain'],
    base: '29 20 16', ink: '245 232 212', accent: '134 196 154', accentInk: '15 26 18',
    glass: '30 20 13', glassA: 0.5, glassStrongA: 0.9, surface: '44 31 23', scrim: 'rgba(16,10,6,.55)',
    dots: ['#3b2619', '#5b1f1f', '#86c49a'],
  },
  {
    key: 'golden', name: 'golden hour', sticker: 'golden hour', fx: 'sparkles', fxColors: ['#fff8dc', '#ffffff'], mix: ['ocean', 'wind'],
    base: '42 20 36', ink: '255 248 239', accent: '60 194 180', accentInk: '13 43 40',
    glass: '70 28 44', glassA: 0.32, glassStrongA: 0.88, surface: '74 34 52', scrim: 'rgba(60,20,40,.38)',
    dots: ['#f49bb0', '#ffc48c', '#3cc2b4'],
  },
  {
    // The calm option: a still, near-black screen with no effect, grain or sticker.
    key: 'plain', name: 'plain dark', still: true, sticker: '', fx: 'none', fxColors: ['#ffffff'], mix: ['brown'],
    base: '14 13 19', ink: '232 230 240', accent: '178 162 232', accentInk: '22 18 38',
    glass: '30 28 40', glassA: 0.6, glassStrongA: 0.94, surface: '30 28 40', scrim: 'rgba(0,0,0,0)',
    dots: ['#0e0d13', '#3a3748', '#b2a2e8'],
  },
];

export const vibeByKey = key => VIBES.find(v => v.key === key) || VIBES[0];

/** Writes a vibe's colours onto <html> as the CSS variables Tailwind and index.css read. */
export function applyVibeTokens(v) {
  const s = document.documentElement.style;
  s.setProperty('--base', v.base);
  s.setProperty('--ink', v.ink);
  s.setProperty('--accent', v.accent);
  s.setProperty('--accent-ink', v.accentInk);
  s.setProperty('--glass', v.glass);
  s.setProperty('--glass-a', v.glassA);
  s.setProperty('--glass-strong-a', v.glassStrongA);
  s.setProperty('--surface', v.surface);
  s.setProperty('--scrim', v.scrim);
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `rgb(${v.base.replace(/ /g, ',')})`);
}

export const RING_RADIUS = 138;
