import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

/**
 * A pill group whose highlight slides between options, using Motion's shared
 * layout animation — the technique Aceternity's animated tabs are built on.
 * `id` must be unique per group so two groups' pills don't animate into each other.
 */
export default function Segmented({ id, options, value, onChange, className, pillClassName, activeClassName = 'text-accent-ink', dataAttr }) {
  return (
    <div className={cn('inline-flex gap-0.5 rounded-full border border-line bg-fg/[.04] p-1', className)}>
      {options.map(o => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            {...(dataAttr ? { [`data-${dataAttr}`]: o.key } : {})}
            onClick={() => onChange(o.key)}
            className={cn(
              'relative rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors duration-200',
              active ? activeClassName : 'text-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId={`${id}-pill`}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                className={cn('absolute inset-0 rounded-full', pillClassName)}
              />
            )}
            <span className="relative z-10">{o.name}</span>
          </button>
        );
      })}
    </div>
  );
}
