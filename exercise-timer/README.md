# Exercise Timer

Android interval timer. Enter exercise time, rest time and number of sets; the total duration is calculated for you. Save time sets, then press **Go** for a hands-free workout with bells and voice.

## Behaviour
1. 10 s get-ready countdown (once, not counted in the total), 3-2-1 beeps at the end.
2. Bell, voice says "Exercise", exercise countdown.
3. Bell, voice says "Rest", rest countdown, 3-2-1 beeps at the end.
4. Repeat for each set. **No rest after the last set.**
5. Final bell and "Workout complete".

Total = sets × exercise + (sets − 1) × rest. Example: 22 sets, 1:00 / 0:20 = 29:00.

Also: welcome screen on launch (no login), light/dark toggle (remembered), save / edit / duplicate / delete time sets (stored on the phone, works offline), pause / skip / stop, screen stays awake during a workout.

## Get an installable APK (one-time setup, about 15 minutes)
You need [Node.js LTS](https://nodejs.org) and a free account at https://expo.dev.

```bash
cd exercise-timer
npm install
npx expo install --fix          # aligns package versions with your Expo SDK
npx eas-cli login
npx eas-cli build -p android --profile preview
```

When the cloud build finishes (about 10 to 20 minutes) it prints a link and QR code. Open it on your phone, download the `.apk`, allow "Install unknown apps" when asked, and install.

## Try it quickly without building
```bash
npm install && npx expo install --fix && npx expo start
```
Install the **Expo Go** app on your phone and scan the QR code.

## Tests
```bash
npm test     # timing engine: sequence, totals, skipped final rest, beep rules
```

## Known limits (v1)
- The screen is kept awake while a workout runs. If you lock the phone or switch apps, Android may pause the timer after a while. A background service can be added if you need that.
- Voice uses the phone's built-in text-to-speech, so wording and accent depend on your phone's settings.
