import React from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { Header } from '../components/Header';
import { totalSeconds, type TimeSet } from '../engine';
import { fmt } from '../format';
import { useTheme } from '../theme';

interface Props {
  sets: TimeSet[];
  onPlay: (s: TimeSet) => void;
  onNew: () => void;
  onEdit: (s: TimeSet) => void;
  onDuplicate: (s: TimeSet) => void;
  onDelete: (s: TimeSet) => void;
}

export function ListScreen({ sets, onPlay, onNew, onEdit, onDuplicate, onDelete }: Props) {
  const { c } = useTheme();

  const confirmDelete = (s: TimeSet) =>
    Alert.alert('Delete time set?', `"${s.name}" will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => onDelete(s) },
    ]);

  return (
    <Screen>
      <Header title="Time sets" />
      <FlatList
        data={sets}
        keyExtractor={(s) => s.id}
        contentContainerStyle={sets.length ? { gap: 12, paddingBottom: 90 } : { flexGrow: 1 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: c.text }]}>No time sets yet</Text>
            <Text style={[styles.emptySub, { color: c.muted }]}>
              Create one with your exercise time, rest time and number of sets.
            </Text>
          </View>
        }
        renderItem={({ item: s }) => (
          <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
            <View style={styles.cardTop}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>{s.name}</Text>
                <Text style={[styles.meta, { color: c.muted }]}>
                  {fmt(s.exerciseSec)} work · {fmt(s.restSec)} rest · {s.sets} sets
                </Text>
                <Text style={[styles.meta, { color: c.muted }]}>
                  Total {fmt(totalSeconds(s.exerciseSec, s.restSec, s.sets))}
                </Text>
              </View>
              <Pressable
                onPress={() => onPlay(s)}
                accessibilityRole="button"
                accessibilityLabel={`Start ${s.name}`}
                style={({ pressed }) => [styles.go, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}
              >
                <Text style={[styles.goText, { color: c.onAccent }]}>Go</Text>
              </Pressable>
            </View>
            <View style={[styles.actions, { borderTopColor: c.border }]}>
              <Pressable onPress={() => onEdit(s)} hitSlop={8}><Text style={[styles.action, { color: c.muted }]}>Edit</Text></Pressable>
              <Pressable onPress={() => onDuplicate(s)} hitSlop={8}><Text style={[styles.action, { color: c.muted }]}>Duplicate</Text></Pressable>
              <Pressable onPress={() => confirmDelete(s)} hitSlop={8}><Text style={[styles.action, { color: c.danger }]}>Delete</Text></Pressable>
            </View>
          </View>
        )}
      />
      <Pressable
        onPress={onNew}
        accessibilityRole="button"
        style={({ pressed }) => [styles.fab, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={[styles.fabText, { color: c.onAccent }]}>+ New time set</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 24 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptySub: { fontSize: 15, lineHeight: 22, textAlign: 'center' },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  meta: { fontSize: 14, lineHeight: 20 },
  go: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  goText: { fontSize: 18, fontWeight: '800' },
  actions: { flexDirection: 'row', gap: 22, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12 },
  action: { fontSize: 14, fontWeight: '600' },
  fab: { position: 'absolute', left: 20, right: 20, bottom: 28, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  fabText: { fontSize: 17, fontWeight: '700' },
});
