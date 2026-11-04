import React from 'react';
import { Platform, StatusBar, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/** Full-screen container with status-bar and gesture-bar padding. */
export function Screen({ children, style, bg }: { children: React.ReactNode; style?: ViewStyle; bg?: string }) {
  const { c } = useTheme();
  return (
    <View style={[styles.root, { backgroundColor: bg ?? c.bg }, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: (Platform.OS === 'android' ? StatusBar.currentHeight ?? 24 : 48) + 8,
    paddingBottom: 28,
    paddingHorizontal: 20,
  },
});
