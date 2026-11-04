import React from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Screen } from '../components/Screen';
import type { TimeSet } from '../engine';
import { fmt } from '../format';
import { phaseColors } from '../theme';
import { useWorkout } from '../useWorkout';

const LABEL = { getReady: 'GET READY', exercise: 'EXERCISE', rest: 'REST', done: 'DONE' } as const;

export function PlayScreen({ set, onExit }: { set: TimeSet; onExit: () => void }) {
  useKeepAwake();
  const { view, pause, resume, skip, stop } = useWorkout(set);
  const done = view.kind === 'done';

  const confirmStop = () => {
    if (done) return onExit();
    pause();
    Alert.alert('Stop workout?', 'Your progress will be lost.', [
      { text: 'Keep going', style: 'cancel', onPress: resume },
      { text: 'Stop', style: 'destructive', onPress: () => { stop(); onExit(); } },
    ]);
  };

  const btn = (label: string, onPress: () => void, primary = false) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.btn,
        primary ? { backgroundColor: '#FFFFFF' } : { backgroundColor: 'rgba(255,255,255,0.18)' },
        { opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <Text style={[styles.btnText, { color: primary ? '#111' : '#FFF' }]}>{label}</Text>
    </Pressable>
  );

  return (
    <Screen bg={phaseColors[view.kind]}>
      <Text style={styles.setName} numberOfLines={1}>{set.name}</Text>

      <View style={styles.center}>
        <Text style={styles.phase}>{LABEL[view.kind]}</Text>
        {done ? (
          <Text style={styles.doneText}>Workout complete</Text>
        ) : (
          <Text style={styles.time} adjustsFontSizeToFit numberOfLines={1}>{fmt(view.phaseSecLeft)}</Text>
        )}
        {view.kind === 'getReady' || done ? null : (
          <Text style={styles.round}>Set {view.round} of {set.sets}</Text>
        )}
      </View>

      {done ? null : (
        <Text style={styles.total}>Total left {fmt(view.totalSecLeft)}</Text>
      )}

      <View style={styles.buttons}>
        {done ? (
          btn('Done', onExit, true)
        ) : (
          <>
            {btn(view.paused ? 'Resume' : 'Pause', view.paused ? resume : pause, true)}
            <View style={styles.row2}>
              <View style={{ flex: 1 }}>{btn('Skip', skip)}</View>
              <View style={{ flex: 1 }}>{btn('Stop', confirmStop)}</View>
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  setName: { color: 'rgba(255,255,255,0.85)', fontSize: 17, fontWeight: '600', textAlign: 'center', paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  phase: { color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: '700', letterSpacing: 4 },
  time: { color: '#FFFFFF', fontSize: 120, fontWeight: '800', letterSpacing: -4, fontVariant: ['tabular-nums'], maxWidth: '100%' },
  doneText: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', marginTop: 12 },
  round: { color: 'rgba(255,255,255,0.85)', fontSize: 20, fontWeight: '600' },
  total: { color: 'rgba(255,255,255,0.8)', fontSize: 16, textAlign: 'center', marginBottom: 24 },
  buttons: { gap: 12 },
  row2: { flexDirection: 'row', gap: 12 },
  btn: { height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
});
