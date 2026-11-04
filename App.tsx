import React, { useCallback, useEffect, useState } from 'react';
import { BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme';
import { loadSets, newId, saveSets } from './src/storage';
import type { TimeSet } from './src/engine';
import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { ListScreen } from './src/screens/ListScreen';
import { EditScreen } from './src/screens/EditScreen';
import { PlayScreen } from './src/screens/PlayScreen';

type Route =
  | { name: 'welcome' }
  | { name: 'list' }
  | { name: 'edit'; set?: TimeSet }
  | { name: 'play'; set: TimeSet };

function Root() {
  const { mode } = useTheme();
  const [route, setRoute] = useState<Route>({ name: 'welcome' });
  const [sets, setSets] = useState<TimeSet[]>([]);

  useEffect(() => {
    loadSets().then(setSets);
  }, []);

  const persist = useCallback((next: TimeSet[]) => {
    setSets(next);
    saveSets(next).catch(() => {});
  }, []);

  // Android hardware back: return to the list instead of closing the app.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (route.name === 'edit' || route.name === 'play') {
        setRoute({ name: 'list' });
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [route]);

  return (
    <>
      <StatusBar style={route.name === 'play' ? 'light' : mode === 'dark' ? 'light' : 'dark'} />
      {route.name === 'welcome' && <WelcomeScreen onStart={() => setRoute({ name: 'list' })} />}
      {route.name === 'list' && (
        <ListScreen
          sets={sets}
          onPlay={(s) => setRoute({ name: 'play', set: s })}
          onNew={() => setRoute({ name: 'edit' })}
          onEdit={(s) => setRoute({ name: 'edit', set: s })}
          onDuplicate={(s) =>
            persist([{ ...s, id: newId(), name: `${s.name} copy`, createdAt: Date.now() }, ...sets])
          }
          onDelete={(s) => persist(sets.filter((x) => x.id !== s.id))}
        />
      )}
      {route.name === 'edit' && (
        <EditScreen
          initial={route.set}
          onCancel={() => setRoute({ name: 'list' })}
          onSave={(s) => {
            const exists = sets.some((x) => x.id === s.id);
            persist(exists ? sets.map((x) => (x.id === s.id ? s : x)) : [s, ...sets]);
            setRoute({ name: 'list' });
          }}
        />
      )}
      {route.name === 'play' && <PlayScreen set={route.set} onExit={() => setRoute({ name: 'list' })} />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}
