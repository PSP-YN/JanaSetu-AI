# Localized landing layout and voice-input diagnostics — 13 November 2026

## Localized landing-page defect

The regional landing pages under `/hi`, `/kn`, `/te`, `/ta` and `/ml` share the global `.brand` class used elsewhere in the workspace. The localized header did not constrain the logo image, so the SVG's intrinsic dimensions participated in flex sizing and expanded the header to nearly the full viewport width in height. The hero and every following section were consequently displaced.

The fix scopes the logo dimensions and flex behavior to `.localized-header`, keeps translated brand text shrinkable, wraps long translated strings, and reflows the header and content at tablet/mobile breakpoints. The page now keeps the brand, language navigation, CTA, hero, trust cards, steps, FAQ and disclaimer in their intended document order.

## Voice-input failure

The intake UI uses the browser's Web Speech `SpeechRecognition` implementation. That recognition service is provided by the browser and may fail independently of JanaSetu. A live Chromium reproduction returned the error code `network` even after microphone permission was granted, which indicates that the browser speech service could not connect in that test environment.

The UI previously discarded the browser error event and displayed the same generic message for every failure. It now preserves the error code, provides a localized microphone/network recovery hint, and does not show a failure toast when recognition was intentionally aborted. A browser-service network failure is not falsely represented as a successful transcript; citizens can still type into the intake field.

**Current limitation:** speech recognition still depends on the browser's speech service and network availability. JanaSetu does not yet bundle an offline speech-recognition model or a server-side transcription provider. The voice-input UI tests cover both successful transcript insertion and actionable error handling.

## Verification

- Regional landing pages: test widths 320, 360, 390, 430, 600, 768, 850 and 1024 CSS pixels.
- Header logo dimensions: maximum 48 × 48 CSS pixels.
- Header height: below 180 CSS pixels at all tested widths.
- Hero placement: begins after the header, with no oversized-logo displacement.
- Voice input: mocked browser speech-service network error produces an actionable message.
- Voice input: a successful mocked transcript is appended to the intake field.

## Judge-demo implications

For a reliable live pitch, use typed intake unless the presentation machine's browser microphone permission and speech-service connectivity have been tested immediately before the session. Do not claim offline voice transcription.
