// Pure timing logic: no React, no audio. Easy to unit test.

export interface TimeSet {
  id: string;
  name: string;
  exerciseSec: number;
  restSec: number;
  sets: number;
  createdAt: number;
}

export type PhaseKind = 'getReady' | 'exercise' | 'rest';

export interface Phase {
  kind: PhaseKind;
  startMs: number;
  durationMs: number;
  /** 1-based exercise round this phase belongs to (0 for get-ready). */
  round: number;
}

export const GET_READY_SEC = 10;
export const BEEP_COUNTDOWN_SEC = 3;

/** Workout length, excluding get-ready. Final rest is skipped. */
export function totalSeconds(exerciseSec: number, restSec: number, sets: number): number {
  if (sets < 1) return 0;
  return sets * exerciseSec + (sets - 1) * restSec;
}

export function buildPhases(
  set: Pick<TimeSet, 'exerciseSec' | 'restSec' | 'sets'>,
  getReadySec: number = GET_READY_SEC
): Phase[] {
  const phases: Phase[] = [];
  let t = 0;
  const push = (kind: PhaseKind, sec: number, round: number) => {
    if (sec <= 0) return;
    phases.push({ kind, startMs: t, durationMs: sec * 1000, round });
    t += sec * 1000;
  };
  push('getReady', getReadySec, 0);
  for (let r = 1; r <= set.sets; r++) {
    push('exercise', set.exerciseSec, r);
    if (r < set.sets) push('rest', set.restSec, r);
  }
  return phases;
}

export function totalMs(phases: Phase[]): number {
  const last = phases[phases.length - 1];
  return last ? last.startMs + last.durationMs : 0;
}

export interface PlaybackState {
  /** Index into phases, or phases.length when finished. */
  index: number;
  finished: boolean;
  phase: Phase | null;
  phaseRemainingMs: number;
  totalRemainingMs: number;
}

export function stateAt(phases: Phase[], elapsedMs: number): PlaybackState {
  const total = totalMs(phases);
  if (elapsedMs >= total) {
    return { index: phases.length, finished: true, phase: null, phaseRemainingMs: 0, totalRemainingMs: 0 };
  }
  const e = Math.max(0, elapsedMs);
  let index = phases.findIndex((p) => e >= p.startMs && e < p.startMs + p.durationMs);
  if (index < 0) index = 0;
  const phase = phases[index];
  return {
    index,
    finished: false,
    phase,
    phaseRemainingMs: phase.startMs + phase.durationMs - e,
    totalRemainingMs: total - e,
  };
}

/** Whole seconds remaining, rounded up (what a person reads on a clock). */
export function secondsLeft(ms: number): number {
  return Math.max(0, Math.ceil(ms / 1000 - 1e-9));
}

/** Should a 3-2-1 beep sound for this second of this phase? */
export function isCountdownBeep(kind: PhaseKind, secLeft: number, phaseDurationMs: number): boolean {
  if (kind === 'exercise') return false;
  if (secLeft < 1 || secLeft > BEEP_COUNTDOWN_SEC) return false;
  return secLeft * 1000 <= phaseDurationMs;
}
