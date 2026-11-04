import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  title: string;
  onBack?: () => void;
}

export function ThemeToggle() {
  const { mode, toggle, c } = useTheme();
  return (
    <Pressable
      onPress={toggle}
      accessibilityRole="button"
      accessibilityLabel={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      hitSlop={8}
      style={[styles.pill, { borderColor: c.border, backgroundColor: c.surface }]}
    >
      <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>
        {mode === 'dark' ? 'Light' : 'Dark'}
      </Text>
    </Pressable>
  );
}

export function Header({ title, onBack }: Props) {
  const { c } = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back">
            <Text style={{ color: c.muted, fontSize: 15, fontWeight: '600' }}>Back</Text>
          </Pressable>
        ) : null}
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      </View>
      <ThemeToggle />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  left: { flexDirection: 'row', alignItems: 'center', gap: 14, flexShrink: 1 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, borderWidth: 1 },
});
