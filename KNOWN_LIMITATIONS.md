# Known Limitations (1.0.0-beta.1)

1. **Browser Support**: The default Voice Recognition provider relies on `window.SpeechRecognition` which is heavily supported in Chrome/Edge, but requires polyfills for Safari/Firefox.
2. **Screen Reader API**: The default TTS uses `window.speechSynthesis`, which may vary in voice quality depending on the OS.
