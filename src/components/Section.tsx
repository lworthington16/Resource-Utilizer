import { useState, type ReactNode } from 'react';

/**
 * Collapsible card wrapper. Owns the open/closed state and renders a clickable
 * header (with a chevron) that toggles its body. Each panel keeps its own header
 * styling via the *ClassName props so the distinct looks (gradient, sort hint,
 * badges) are preserved.
 */
export function Section({
  title,
  subtitle,
  headerRight,
  headerClassName = 'border-b border-slate-100 px-4 py-3',
  titleClassName = 'text-sm font-semibold text-slate-800',
  chevronClassName = 'text-slate-400',
  defaultOpen = true,
  children,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  headerRight?: ReactNode;
  headerClassName?: string;
  titleClassName?: string;
  chevronClassName?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-2 text-left transition ${headerClassName}`}
      >
        <span
          className={`shrink-0 text-xs transition-transform ${open ? 'rotate-90' : ''} ${chevronClassName}`}
          aria-hidden="true"
        >
          ▸
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block ${titleClassName}`}>{title}</span>
          {subtitle && <span className="mt-0.5 block text-xs text-slate-400">{subtitle}</span>}
        </span>
        {headerRight}
      </button>
      {open && children}
    </div>
  );
}
