import type { ReactNode } from 'react';

/**
 * Small "?" help affordance with a hover/focus tooltip. CSS-only (group-hover /
 * group-focus-within) to match the project's Tailwind style — no extra state.
 * The popover anchors its right edge under the icon so it never clips off-screen
 * when the icon sits near the right edge of the header.
 */
export function HelpTip({ children, label = 'Help' }: { children: ReactNode; label?: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={label}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-bold text-slate-400 transition hover:border-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-300"
      >
        ?
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-slate-200 bg-white p-2.5 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {children}
      </span>
    </span>
  );
}
