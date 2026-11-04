import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { GET_READY_SEC, totalSeconds, type TimeSet } from '../engine';
import { fmt } from '../format';
import { newId } from '../storage';
import { useTheme } from '../theme';

interface Props {
  initial?: TimeSet;
  onSave: (s: TimeSet) => void;
  onCancel: () => void;
}

const toInt = (v: string) => {
  const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
  return Number.isFinite(n) ? n : 0;
};

function NumField({ label, value, onChange, width = 84 }: { label: string; value: string; onChange: (v: string) => void; width?: number }) {
  const { c } = useTheme();
  return (
    <View style={{ width }}>
      <TextInput
        value={value}
        onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, 3))}
        keyboardType="number-pad"
        selectTextOnFocus
        style={[styles.input, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
      />
      <Text style={[styles.unit, { color: c.muted }]}>{label}</Text>
    </View>
  );
}

export function EditScreen({ initial, onSave, onCancel }: Props) {
  const { c } = useTheme();
  const [name, setName] = useState(initial?.name ?? '');
  const [exMin, setExMin] = useState(String(Math.floor((initial?.exerciseSec ?? 60) / 60)));
  const [exSec, setExSec] = useState(String((initial?.exerciseSec ?? 60) % 60));
  const [rsMin, setRsMin] = useState(String(Math.floor((initial?.restSec ?? 20) / 60)));
  const [rsSec, setRsSec] = useState(String((initial?.restSec ?? 20) % 60));
  const [sets, setSets] = useState(String(initial?.sets ?? 10));

  const exerciseSec = toInt(exMin) * 60 + toInt(exSec);
  const restSec = toInt(rsMin) * 60 + toInt(rsSec);
  const n = toInt(sets);

  const error =
    exerciseSec < 1 ? 'Exercise time must be at least 1 second.' :
    restSec < 1 ? 'Rest time must be at least 1 second.' :
    n < 1 ? 'Number of sets must be at least 1.' : null;

  const total = error ? 0 : totalSeconds(exerciseSec, restSec, n);

  const save = () => {
    if (error) return;
    onSave({
      id: initial?.id ?? newId(),
      name: name.trim() || 'Workout',
      exerciseSec,
      restSec,
      sets: n,
      createdAt: initial?.createdAt ?? Date.now(),
    });
  };

  const Label = ({ children }: { children: string }) => (
    <Text style={[styles.label, { color: c.muted }]}>{children}</Text>
  );

  return (
    <Screen>
      <Header title={initial ? 'Edit time set' : 'New time set'} onBack={onCancel} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ gap: 22, paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
          <View>
            <Label>Name</Label>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning HIIT"
              placeholderTextColor={c.muted}
              maxLength={40}
              style={[styles.input, styles.nameInput, { backgroundColor: c.inputBg, color: c.text, borderColor: c.border }]}
            />
          </View>

          <View>
            <Label>Exercise time</Label>
            <View style={styles.row}>
              <NumField label="min" value={exMin} onChange={setExMin} />
              <NumField label="sec" value={exSec} onChange={setExSec} />
            </View>
          </View>

          <View>
            <Label>Rest time</Label>
            <View style={styles.row}>
              <NumField label="min" value={rsMin} onChange={setRsMin} />
              <NumField label="sec" value={rsSec} onChange={setRsSec} />
            </View>
          </View>

          <View>
            <Label>Number of sets</Label>
            <NumField label="sets" value={sets} onChange={setSets} width={110} />
          </View>

          <View style={[styles.summary, { backgroundColor: c.surface, borderColor: c.border }]}>
            {error ? (
              <Text style={{ color: c.danger, fontSize: 15 }}>{error}</Text>
            ) : (
              <>
                <Text style={[styles.sumLabel, { color: c.muted }]}>Total duration</Text>
                <Text style={[styles.sumValue, { color: c.text }]}>{fmt(total)}</Text>
                <Text style={[styles.sumNote, { color: c.muted }]}>
                  {n} × {fmt(exerciseSec)} work + {n - 1} × {fmt(restSec)} rest. No rest after the last set.
                  A {GET_READY_SEC}s get-ready countdown plays first and is not counted.
                </Text>
              </>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Pressable
        onPress={save}
        disabled={!!error}
        accessibilityRole="button"
        style={({ pressed }) => [styles.btn, { backgroundColor: c.accent, opacity: error ? 0.4 : pressed ? 0.85 : 1 }]}
      >
        <Text style={[styles.btnText, { color: c.onAccent }]}>Save time set</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.6 },
  row: { flexDirection: 'row', gap: 12 },
  input: { height: 52, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 20, fontWeight: '600' },
  nameInput: { fontSize: 17, fontWeight: '500' },
  unit: { fontSize: 13, marginTop: 6, marginLeft: 4 },
  summary: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  sumLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6 },
  sumValue: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  sumNote: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  btn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 17, fontWeight: '700' },
});
