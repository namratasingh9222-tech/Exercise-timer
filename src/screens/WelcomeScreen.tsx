import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { ThemeToggle } from '../components/Header';
import { useTheme } from '../theme';

export function WelcomeScreen({ onStart }: { onStart: () => void }) {
  const { c } = useTheme();
  return (
    <Screen>
      <View style={styles.top}>
        <ThemeToggle />
      </View>
      <View style={styles.center}>
        <View style={[styles.ring, { borderColor: c.accent }]}>
          <View style={[styles.hand, { backgroundColor: c.text }]} />
        </View>
        <Text style={[styles.title, { color: c.text }]}>Exercise Timer</Text>
        <Text style={[styles.sub, { color: c.muted }]}>
          Set your work and rest, then follow the bells. Hands-free intervals, saved for next time.
        </Text>
      </View>
      <Pressable
        onPress={onStart}
        accessibilityRole="button"
        style={({ pressed }) => [styles.btn, { backgroundColor: c.accent, opacity: pressed ? 0.85 : 1 }]}
      >
        <Text style={[styles.btnText, { color: c.onAccent }]}>Get started</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'flex-end' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  ring: { width: 96, height: 96, borderRadius: 48, borderWidth: 6, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 14, marginBottom: 12 },
  hand: { width: 5, height: 30, borderRadius: 3 },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.8 },
  sub: { fontSize: 16, lineHeight: 24, textAlign: 'center', maxWidth: 320 },
  btn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 17, fontWeight: '700' },
});
