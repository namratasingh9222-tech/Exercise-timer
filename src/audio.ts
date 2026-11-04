import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';

let bell: AudioPlayer | null = null;
let beep: AudioPlayer | null = null;
let speakTimer: ReturnType<typeof setTimeout> | null = null;

export async function initAudio(): Promise<void> {
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'duckOthers',
    });
  } catch {
    // non-fatal: sounds still play in the foreground
  }
  if (!bell) bell = createAudioPlayer(require('../assets/bell.wav'));
  if (!beep) beep = createAudioPlayer(require('../assets/beep.wav'));
}

function replay(p: AudioPlayer | null) {
  if (!p) return;
  try {
    p.seekTo(0);
    p.play();
  } catch {
    // ignore
  }
}

export function playBell() {
  replay(bell);
}

export function playBeep() {
  replay(beep);
}

/** Speaks with the phone's built-in voice, slightly after the bell starts. */
export function speak(text: string, delayMs = 600) {
  if (speakTimer) clearTimeout(speakTimer);
  speakTimer = setTimeout(() => {
    Speech.stop();
    Speech.speak(text, { rate: 1.0, pitch: 1.0 });
  }, delayMs);
}

export function silence() {
  if (speakTimer) clearTimeout(speakTimer);
  speakTimer = null;
  Speech.stop();
  try {
    bell?.pause();
    beep?.pause();
  } catch {
    // ignore
  }
}

export function releaseAudio() {
  silence();
  try {
    bell?.remove();
    beep?.remove();
  } catch {
    // ignore
  }
  bell = null;
  beep = null;
}
