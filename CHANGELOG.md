# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-beta.1] - 2026-08-08

### Initial Beta Features
- **Extensibility**: Configurable `AccessibilityPlugin` interface with `aiIntent` and `aiTarget` for semantic voice mapping without strict equality checks.

### Added
- Initial beta release of the `rafeeq-a11y`.
- Core accessibility context and provider setup.
- Visual adjustments (text resize, dyslexia font, legible font, contrast toggles, magnifier).
- Reading assists (reading mask, reading ruler).
- Dictionary tooltip integration.
- Extensible plugin architecture via the `AccessibilityPlugin` interface.
- Built-in Voice Control and TTS logic utilizing dependency injection (`AIProvider`, `TTSProvider`, `VoiceRecognitionProvider`).
- Pre-defined accessibility profiles (Motor, Blind, Colorblind, Dyslexia, Low Vision, Cognitive, Seizure, ADHD).
- Full RTL and i18n support.

### Security
- Added strict origin checks in `utils/security.ts` to prevent open redirects (`isSafeRedirect`) and unsafe click propagation.
