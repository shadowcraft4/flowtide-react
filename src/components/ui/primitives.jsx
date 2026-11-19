import { cn } from '@/lib/utils';

export function Button({ variant = 'ghost', className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full text-[13.5px] font-medium transition duration-200 ease-out active:scale-95 disabled:opacity-35',
        variant === 'ghost' && 'border border-line bg-glass px-4 py-2 text-fg backdrop-blur-xl hover:border-line-strong hover:bg-fg/[.08]',
        variant === 'solid' && 'bg-accent px-5 py-2.5 font-bold text-accent-ink hover:brightness-105',
        variant === 'small' && 'border border-line bg-fg/[.05] px-2.5 py-1 text-[11px] text-fg hover:bg-fg/[.1]',
        className,
      )}
      {...props}
    />
  );
}

/** Frosted glass card tinted by the vibe, so the scene shows through softly. */
export function Card({ className, children, title, aside }) {
  return (
    <div className={cn('relative mb-4 rounded-card border border-line bg-glass p-6 shadow-card backdrop-blur-xl backdrop-saturate-150', className)}>
      {title && (
        <h2 className="mb-4 font-display text-[17px] font-extrabold tracking-[-.01em] text-fg">
          {title} {aside && <span className="font-sans text-sm font-normal text-muted">{aside}</span>}
        </h2>
      )}
      <div className="relative">{children}</div>
    </div>
  );
}

export const inputClass =
  'rounded-tile border border-line bg-fg/[.05] px-3 py-2 text-[14px] text-fg placeholder:text-muted-soft transition focus:border-accent focus:bg-accent/[.06] focus:outline-none';

export function TextInput({ className, ...props }) {
  return <input type="text" className={cn(inputClass, 'min-w-[150px] flex-1', className)} {...props} />;
}

export function Swatch({ color }) {
  return <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] shadow-[0_0_0_1px_rgb(var(--ink)/.2)]" style={{ background: color }} />;
}

export function ProgressBar({ pct, color, className }) {
  return (
    <div className={cn('my-2.5 h-2.5 overflow-hidden rounded-full border border-line bg-fg/[.08]', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${pct}%`, background: color || 'rgb(var(--accent))' }}
      />
    </div>
  );
}

/** Segmented control with a pill that slides to the active option (Aceternity-style shared layout animation). */
export { default as Segmented } from './segmented';
