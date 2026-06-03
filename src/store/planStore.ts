import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Feature, Phase, Scenario } from '../types';
import { ENGINEERS, SEED_FEATURES } from '../seed/seedData';

type View = 'baseline' | 'scenario';

const BASELINE: Scenario = {
  id: 'baseline',
  name: 'Committed plan',
  isBaseline: true,
  features: SEED_FEATURES,
};

function freshScenario(): Scenario {
  // Deep copy so edits never touch the baseline.
  return {
    id: 'scenario',
    name: 'What-if scenario',
    isBaseline: false,
    features: structuredClone(SEED_FEATURES),
  };
}

const uid = () => Math.random().toString(36).slice(2, 9);

interface PlanState {
  engineers: typeof ENGINEERS;
  baseline: Scenario;
  scenario: Scenario;
  activeView: View;

  active(): Scenario;
  setView(v: View): void;
  resetScenario(): void;
  commitScenario(): void;

  addFeature(input: { name: string; division: Feature['division']; phases: Omit<Phase, 'id' | 'featureId'>[] }): void;
  removeFeature(featureId: string): void;
  setPhaseAssignees(featureId: string, phaseId: string, assigneeIds: string[]): void;
  patchPhase(featureId: string, phaseId: string, patch: Partial<Pick<Phase, 'startDate' | 'durationDays'>>): void;
}

function nextDemoKey(features: Feature[]): string {
  const nums = features
    .map((f) => Number(f.key.replace(/[^0-9]/g, '')))
    .filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 100) + 1;
  return `DEMO-${next}`;
}

export const usePlan = create<PlanState>()(
  persist(
    (set, get) => ({
      engineers: ENGINEERS,
      baseline: BASELINE,
      scenario: freshScenario(),
      activeView: 'baseline',

      active: () => (get().activeView === 'baseline' ? get().baseline : get().scenario),
      setView: (v) => set({ activeView: v }),
      resetScenario: () => set({ scenario: freshScenario() }),

      // Promote the what-if into the committed baseline. Proposed features become
      // part of the baseline (clear the flag), and the sandbox is re-synced to the
      // new baseline so What-if continues from the just-committed plan.
      commitScenario: () =>
        set((s) => {
          const committed = structuredClone(s.scenario.features).map((f) => ({ ...f, proposed: false }));
          return {
            baseline: { ...s.baseline, features: committed },
            scenario: { ...s.scenario, features: structuredClone(committed) },
            activeView: 'baseline',
          };
        }),

      addFeature: ({ name, division, phases }) =>
        set((s) => {
          const fid = `f-${uid()}`;
          const feature: Feature = {
            id: fid,
            key: nextDemoKey(s.scenario.features),
            name,
            division,
            proposed: true,
            phases: phases.map((p) => ({ ...p, id: `p-${uid()}`, featureId: fid })),
          };
          return {
            scenario: { ...s.scenario, features: [...s.scenario.features, feature] },
            activeView: 'scenario',
          };
        }),

      removeFeature: (featureId) =>
        set((s) => ({
          scenario: {
            ...s.scenario,
            features: s.scenario.features.filter((f) => f.id !== featureId),
          },
        })),

      setPhaseAssignees: (featureId, phaseId, assigneeIds) =>
        set((s) => ({ scenario: editPhase(s.scenario, featureId, phaseId, () => ({ assigneeIds })) })),

      patchPhase: (featureId, phaseId, patch) =>
        set((s) => ({ scenario: editPhase(s.scenario, featureId, phaseId, () => patch) })),
    }),
    {
      name: 'sdd-planner-scenario',
      // Persist the editable scenario, the (now committable) baseline, and the view
      // so a committed plan survives reloads. Engineers always come from seed.
      partialize: (s) => ({ scenario: s.scenario, baseline: s.baseline, activeView: s.activeView }),
    },
  ),
);

function editPhase(
  scenario: Scenario,
  featureId: string,
  phaseId: string,
  patch: (p: Phase) => Partial<Phase>,
): Scenario {
  return {
    ...scenario,
    features: scenario.features.map((f) =>
      f.id !== featureId
        ? f
        : {
            ...f,
            phases: f.phases.map((p) => (p.id !== phaseId ? p : { ...p, ...patch(p) })),
          },
    ),
  };
}
