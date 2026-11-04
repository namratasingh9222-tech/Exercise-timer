import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Palette {
  bg: string;
  surface: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
  onAccent: string;
  danger: string;
  inputBg: string;
}

export const light: Palette = {
  bg: '#FAFAF9',
  surface: '#FFFFFF',
  border: '#E7E5E4',
  text: '#1C1917',
  muted: '#78716C',
  accent: '#16A34A',
  onAccent: '#FFFFFF',
  danger: '#DC2626',
  inputBg: '#F5F5F4',
};

export const dark: Palette = {
  bg: '#0F1115',
  surface: '#181B21',
  border: '#272B33',
  text: '#F2F4F8',
  muted: '#9AA3B2',
  accent: '#34D399',
  onAccent: '#04130C',
  danger: '#F87171',
  inputBg: '#1F232B',
};

/** Fixed phase colours used on the workout screen (white text works on all). */
export const phaseColors = {
  getReady: '#2563EB',
  exercise: '#16A34A',
  rest: '#D97706',
  done: '#7C3AED',
};

export type Mode = 'light' | 'dark';

interface Ctx {
  mode: Mode;
  c: Palette;
  toggle: () => void;
}

const ThemeContext = createContext<Ctx>({ mode: 'dark', c: dark, toggle: () => {} });
const KEY = 'theme_v1';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>(Appearance.getColorScheme() === 'light' ? 'light' : 'dark');

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark') setMode(v);
      })
      .catch(() => {});
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      mode,
      c: mode === 'light' ? light : dark,
      toggle: () =>
        setMode((m) => {
          const next: Mode = m === 'light' ? 'dark' : 'light';
          AsyncStorage.setItem(KEY, next).catch(() => {});
          return next;
        }),
    }),
    [mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
