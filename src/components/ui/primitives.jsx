import { cn } from '@/lib/utils';
import { GlowingEffect } from './glowing-effect';

export function Button({ variant = 'ghost', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-[13.5px] font-medium transition duration-200 ease-out active:scale-95 disabled:opacity-35',
        variant === 'ghost' && 'border border-line bg-white/[.04] px-4 py-2 text-fg backdrop-blur hover:border-line-strong hover:bg-white/[.08]',
        variant === 'solid' && 'bg-accent px-5 py-2.5 text-white hover:brightness-110',
        variant === 'small' && 'border border-line bg-white/[.04] px-2.5 py-1 text-[11px] text-fg hover:bg-white/[.08]',
        className,
      )}
      {...props}
    />
  );
}

/** Glass card whose border lights up as the cursor approaches (Aceternity Glowing Effect). */
export function Card({ className, children, title, aside }) {
  return (
    <div className={cn('relative mb-4 rounded-card border border-line bg-glass p-6 shadow-card backdrop-blur-xl', className)}>
      <GlowingEffect spread={40} glow proximity={64} inactiveZone={0.01} borderWidth={2} disabled={false} />
      {title && (
        <h2 className="mb-4 font-display text-[15px] font-semibold tracking-tight text-fg">
          {title} {aside && <span className="font-sans text-sm font-normal text-muted">{aside}</span>}
        </h2>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export const inputClass =
  'rounded-tile border border-line bg-white/[.03] px-3 py-2 text-[14px] text-fg placeholder:text-muted-soft transition focus:border-accent focus:bg-accent/[.06] focus:outline-none';

export function TextInput({ className, ...props }) {
  return <input type="text" className={cn(inputClass, 'min-w-[150px] flex-1', className)} {...props} />;
}

export function Swatch({ color }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgba(255,255,255,.12)]" style={{ background: color }} />;
}

export function ProgressBar({ pct, color, className }) {
  return (
    <div className={cn('my-2.5 h-2.5 overflow-hidden rounded-full border border-line bg-white/[.06]', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: color || 'linear-gradient(90deg,#6d35e0,#8b5cf6,#c9b8ff)' }}
      />
    </div>
  );
}

/** Segmented control with a pill that slides to the active option (Aceternity-style shared layout animation). */
export { default as Segmented } from './segmented';
