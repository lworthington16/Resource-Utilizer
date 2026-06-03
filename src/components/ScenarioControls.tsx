import { usePlan } from '../store/planStore';
import { HelpTip } from './HelpTip';

export function ScenarioControls() {
  const activeView = usePlan((s) => s.activeView);
  const setView = usePlan((s) => s.setView);
  const resetScenario = usePlan((s) => s.resetScenario);
  const commitScenario = usePlan((s) => s.commitScenario);
  const proposedCount = usePlan((s) => s.scenario.features.filter((f) => f.proposed).length);

  return (
    <div className="flex items-center gap-3">
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white text-sm">
        <button
          className={`px-3 py-1.5 font-medium ${
            activeView === 'baseline' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setView('baseline')}
        >
          Baseline
        </button>
        <button
          className={`px-3 py-1.5 font-medium ${
            activeView === 'scenario' ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => setView('scenario')}
        >
          What-if{proposedCount > 0 ? ` (+${proposedCount})` : ''}
        </button>
      </div>

      <HelpTip label="How Baseline and What-if work">
        <b className="text-slate-800">Baseline</b> is the committed plan (read-only).{' '}
        <b className="text-slate-800">What-if</b> is an editable sandbox that starts as a copy of it —
        add or reassign work to test scenarios without touching the real plan.
        <span className="mt-1.5 block text-slate-500">
          <b>Commit to baseline</b> promotes your what-if into the baseline. <b>Reset</b> discards
          what-if changes.
        </span>
      </HelpTip>

      {activeView === 'scenario' && (
        <>
          <button
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
            onClick={() => {
              if (confirm('Promote the what-if plan to the committed baseline? This replaces the current baseline.'))
                commitScenario();
            }}
          >
            Commit to baseline
          </button>
          <button
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
            onClick={() => {
              if (confirm('Discard what-if changes and reset to the committed baseline?')) resetScenario();
            }}
          >
            Reset
          </button>
        </>
      )}
    </div>
  );
}
