import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  totalSeconds, buildPhases, totalMs, stateAt, secondsLeft, isCountdownBeep,
} from '../src/engine.ts';

test('total skips final rest: 22 x 60s + 21 x 20s = 29:00', () => {
  assert.equal(totalSeconds(60, 20, 22), 22 * 60 + 21 * 20);
  assert.equal(totalSeconds(60, 20, 22), 1740);
  assert.equal(totalSeconds(30, 10, 1), 30);
  assert.equal(totalSeconds(30, 10, 0), 0);
});

test('phase sequence: get-ready, then exercise/rest alternating, ends on exercise', () => {
  const p = buildPhases({ exerciseSec: 60, restSec: 20, sets: 3 });
  assert.deepEqual(p.map((x) => x.kind), ['getReady', 'exercise', 'rest', 'exercise', 'rest', 'exercise']);
  assert.deepEqual(p.map((x) => x.round), [0, 1, 1, 2, 2, 3]);
  assert.equal(totalMs(p), (10 + 60 + 20 + 60 + 20 + 60) * 1000);
  // contiguous
  for (let i = 1; i < p.length; i++) assert.equal(p[i].startMs, p[i - 1].startMs + p[i - 1].durationMs);
});

test('single set has no rest', () => {
  const p = buildPhases({ exerciseSec: 45, restSec: 15, sets: 1 });
  assert.deepEqual(p.map((x) => x.kind), ['getReady', 'exercise']);
});

test('stateAt boundaries and finish', () => {
  const p = buildPhases({ exerciseSec: 60, restSec: 20, sets: 2 });
  assert.equal(stateAt(p, 0).phase?.kind, 'getReady');
  assert.equal(stateAt(p, 9_999).phase?.kind, 'getReady');
  const s = stateAt(p, 10_000);
  assert.equal(s.phase?.kind, 'exercise');
  assert.equal(s.phaseRemainingMs, 60_000);
  assert.equal(stateAt(p, 70_000).phase?.kind, 'rest');
  assert.equal(stateAt(p, 90_000).phase?.round, 2);
  const total = totalMs(p);
  assert.equal(stateAt(p, total - 1).finished, false);
  assert.equal(stateAt(p, total).finished, true);
  assert.equal(stateAt(p, 0).totalRemainingMs, total);
});

test('secondsLeft rounds up like a clock', () => {
  assert.equal(secondsLeft(3000), 3);
  assert.equal(secondsLeft(2999), 3);
  assert.equal(secondsLeft(2001), 3);
  assert.equal(secondsLeft(2000), 2);
  assert.equal(secondsLeft(1), 1);
  assert.equal(secondsLeft(0), 0);
});

test('countdown beeps at 3,2,1 for get-ready and rest only', () => {
  assert.equal(isCountdownBeep('rest', 3, 20_000), true);
  assert.equal(isCountdownBeep('rest', 1, 20_000), true);
  assert.equal(isCountdownBeep('rest', 4, 20_000), false);
  assert.equal(isCountdownBeep('getReady', 2, 10_000), true);
  assert.equal(isCountdownBeep('exercise', 2, 60_000), false);
  // short rest of 2s: only 2 and 1 beep
  assert.equal(isCountdownBeep('rest', 3, 2_000), false);
  assert.equal(isCountdownBeep('rest', 2, 2_000), true);
});
