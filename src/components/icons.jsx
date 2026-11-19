// Small icon set. `className` lets the dock make them fill their (magnifying) container.
export const PlayIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M4 2.5v11l10-5.5-10-5.5z" /></svg>
);

export const PauseIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1" /><rect x="9" y="2" width="4" height="12" rx="1" /></svg>
);

export const ChevronIcon = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M4 6l4 4 4-4" /></svg>
);

export const MusicIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 11.5V3.3L13 2v7.7" />
    <circle cx="4.3" cy="11.8" r="1.9" fill="currentColor" stroke="none" />
    <circle cx="11.3" cy="10.3" r="1.9" fill="currentColor" stroke="none" />
  </svg>
);

export const PaletteIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2a6 6 0 1 0 0 12c.8 0 1.4-.6 1.4-1.3 0-.35-.15-.6-.15-.9 0-.5.4-.9.9-.9H11a3 3 0 0 0 3-3A6 6 0 0 0 8 2z" />
    <circle cx="5.3" cy="7.2" r=".7" fill="currentColor" stroke="none" />
    <circle cx="7.8" cy="5" r=".7" fill="currentColor" stroke="none" />
    <circle cx="10.4" cy="7.2" r=".7" fill="currentColor" stroke="none" />
  </svg>
);

export const ExpandIcon = ({ className }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
  </svg>
);
