import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildPhases, isCountdownBeep, secondsLeft, stateAt, totalMs,
  type PhaseKind, type TimeSet,
} from './engine';
import { initAudio, playBeep, playBell, releaseAudio, silence, speak } from './audio';

export interface WorkoutView {
  kind: PhaseKind | 'done';
  round: number;
  phaseSecLeft: number;
  totalSecLeft: number;
  paused: boolean;
}

const SPOKEN: Record<PhaseKind, string> = {
  getReady: 'Get ready',
  exercise: 'Exercise',
  rest: 'Rest',
};

export function useWorkout(set: TimeSet) {
  const phases = useMemo(() => buildPhases(set), [set]);
  const [view, setView] = useState<WorkoutView>({
    kind: 'getReady',
    round: 0,
    phaseSecLeft: phases[0] ? phases[0].durationMs / 1000 : 0,
    totalSecLeft: Math.ceil(totalMs(phases) / 1000),
    paused: false,
  });

  // Timestamp-based clock: no drift from setInterval jitter.
  const r = useRef({
    base: 0,                       // elapsed ms accumulated before the current run segment
    startedAt: null as number | null,
    lastIndex: -1,
    lastBeepKey: '',
    done: false,
    ready: false,
  });

  const elapsed = () => r.current.base + (r.current.startedAt ? Date.now() - r.current.startedAt : 0);

  const tick = useCallback(() => {
    const c = r.current;
    if (!c.ready || c.done) return;
    const st = stateAt(phases, elapsed());

    if (st.finished) {
      c.done = true;
      c.startedAt = null;
      playBell();
      speak('Workout complete');
      setView({ kind: 'done', round: set.sets, phaseSecLeft: 0, totalSecLeft: 0, paused: false });
      return;
    }

    const phase = st.phase!;
    if (st.index !== c.lastIndex) {
      c.lastIndex = st.index;
      c.lastBeepKey = '';
      if (phase.kind === 'getReady') {
        speak(SPOKEN.getReady, 0);
      } else {
        playBell();
        speak(SPOKEN[phase.kind]);
      }
    }

    const secLeft = secondsLeft(st.phaseRemainingMs);
    const key = `${st.index}:${secLeft}`;
    if (isCountdownBeep(phase.kind, secLeft, phase.durationMs) && key !== c.lastBeepKey) {
      c.lastBeepKey = key;
      playBeep();
    }

    setView((v) => {
      const next: WorkoutView = {
        kind: phase.kind,
        round: phase.round,
        phaseSecLeft: secLeft,
        totalSecLeft: secondsLeft(st.totalRemainingMs),
        paused: c.startedAt === null,
      };
      return v.kind === next.kind && v.round === next.round && v.phaseSecLeft === next.phaseSecLeft &&
        v.totalSecLeft === next.totalSecLeft && v.paused === next.paused ? v : next;
    });
  }, [phases, set.sets]);

  useEffect(() => {
    let alive = true;
    initAudio().then(() => {
      if (!alive) return;
      r.current.ready = true;
      r.current.startedAt = Date.now();
      tick();
    });
    const id = setInterval(tick, 100);
    return () => {
      alive = false;
      clearInterval(id);
      releaseAudio();
    };
  }, [tick]);

  const pause = useCallback(() => {
    const c = r.current;
    if (c.startedAt === null || c.done) return;
    c.base = elapsed();
    c.startedAt = null;
    silence();
    setView((v) => ({ ...v, paused: true }));
  }, []);

  const resume = useCallback(() => {
    const c = r.current;
    if (c.startedAt !== null || c.done) return;
    c.startedAt = Date.now();
    setView((v) => ({ ...v, paused: false }));
  }, []);

  /** Jump to the start of the next phase (or finish). */
  const skip = useCallback(() => {
    const c = r.current;
    if (c.done) return;
    const st = stateAt(phases, elapsed());
    const target = st.finished ? totalMs(phases) : st.phase!.startMs + st.phase!.durationMs;
    // Skipping also resumes if paused, so the new phase's bell and voice play normally.
    c.base = target;
    c.startedAt = Date.now();
    silence();
    tick();
  }, [phases, tick]);

  return { view, pause, resume, skip, stop: silence };
}
