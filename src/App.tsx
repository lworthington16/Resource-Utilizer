import { useMemo, useState } from 'react';
import { usePlan } from './store/planStore';
import { detectConflicts } from './lib/capacity';
import { ScenarioControls } from './components/ScenarioControls';
import { ConflictBanner } from './components/ConflictBanner';
import { TimelineBoard } from './components/TimelineBoard';
import { RosterPanel } from './components/RosterPanel';
import { AvailabilityFinder } from './components/AvailabilityFinder';
import { NewWorkForm } from './components/NewWorkForm';

type Page = 'planner' | 'roster' | 'availability';

const PAGES: { id: Page; label: string }[] = [
  { id: 'planner', label: 'Planner' },
  { id: 'roster', label: 'Resource roster' },
  { id: 'availability', label: 'Availability finder' },
];

function App() {
  const activeView = usePlan((s) => s.activeView);
  const baseline = usePlan((s) => s.baseline);
  const scenario = usePlan((s) => s.scenario);
  const engineers = usePlan((s) => s.engineers);

  const [page, setPage] = useState<Page>('planner');

  const active = activeView === 'baseline' ? baseline : scenario;
  const conflicts = useMemo(() => detectConflicts(active, engineers), [active, engineers]);

  return (
    <div className="mx-auto max-w-[1400px] p-4 lg:p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SDD Capacity Planner</h1>
          <p className="text-sm text-slate-500">
            Who's on what · when they're free · what-if without touching Jira
          </p>
        </div>
        <ScenarioControls />
      </header>

      {/* page tabs */}
      <nav className="mb-4 flex gap-1 border-b border-slate-200">
        {PAGES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPage(p.id)}
            aria-current={page === p.id ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              page === p.id
                ? 'border-violet-600 text-violet-700'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
            }`}
          >
            {p.label}
          </button>
        ))}
      </nav>

      {/* Conflict status is relevant where conflicts are visualized; keep the finder page clean. */}
      {page !== 'availability' && (
        <div className="mb-4">
          <ConflictBanner conflicts={conflicts} engineers={engineers} />
        </div>
      )}

      {page === 'planner' && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <TimelineBoard scenario={active} engineers={engineers} conflicts={conflicts} />
          </div>
          <NewWorkForm />
        </div>
      )}

      {page === 'roster' && (
        <RosterPanel scenario={active} engineers={engineers} conflicts={conflicts} />
      )}

      {page === 'availability' && (
        <div className="max-w-xl">
          <AvailabilityFinder scenario={active} engineers={engineers} />
        </div>
      )}

      <footer className="mt-6 text-center text-xs text-slate-400">
        Synthetic data only — no PHI/PII. Prototype for hackathon. Capacity model: one phase per person
        at a time.
      </footer>
    </div>
  );
}

export default App;
