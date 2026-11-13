# On-device voice intake and portal autofill

Updated: 2026-11-13

## Voice intake

JanaSetu now offers two selectable speech paths:

1. **On-device (default):** records with the browser microphone API and transcribes in a dedicated worker using the multilingual ONNX Whisper base model through Transformers.js.
2. **Browser speech:** the existing SpeechRecognition path remains available when a user prefers it or the local model cannot run.

The local worker checks for a usable WebGPU adapter first and uses WebGPU when available. It falls back to WebAssembly when no adapter is available or WebGPU initialization fails. Model files are quantized and cached by the browser after the first download. The current model files are approximately 80 MB; browser/runtime cache may add further storage. A 30-second recording limit bounds memory and inference time.

Audio is decoded and resampled to 16 kHz mono in the browser, then passed to the local worker. The recording is not sent to JanaSetu's API or a speech-recognition API. Only after the citizen clicks **Extract profile facts** does the app send the resulting text to the existing intake parser. The transcript is editable and must be reviewed before profile extraction.

Supported UI languages passed to Whisper: English, Hindi, Kannada, Tamil, Telugu and Malayalam. The automated multilingual fixture test verifies that the worker returns a transcript for each selected language. Its eSpeak-generated fixtures are execution smoke tests, not a transcription-accuracy benchmark. Real-world accent, microphone and background-noise accuracy still needs user testing; users should correct the transcript before proceeding.

### First use

1. Open the workspace using HTTPS.
2. Choose **Record on device** and grant microphone permission.
3. Speak for up to 30 seconds, then choose **Stop & transcribe**.
4. Wait for model download/inference to finish. The model is cached for this browser profile.
5. Review/edit the transcript, then click **Extract profile facts**.
6. Use **Use browser speech instead** to switch back to SpeechRecognition.

The first model download requires internet access. After the model and runtime assets have been cached, local inference is designed to work without a speech API. Clearing browser site data or using a different browser profile requires another model download.

## Start browser autofill

The entry point is **Workspace → Applications & automation → Start portal autofill in four steps**, at /app/automation.

1. **Complete My profile.** The extension export reads the local janSetu.profile.v1 profile from the same browser profile and JanaSetu origin.
2. **Download reviewed profile.** Choose **Download reviewed profile for autofill** and confirm the warning. The JSON is plaintext and contains profile information; store it privately and delete it after importing.
3. **Install the extension once.**
   - Download the JanaSetu Form Assistant ZIP from the automation page.
   - Extract it.
   - Open brave://extensions or chrome://extensions.
   - Enable Developer mode.
   - Choose **Load unpacked** and select the repository's extension/ directory.
4. **Open the official portal.**
   - Open the official portal from the relevant scheme guide or use the PM-KISAN example link on the automation page.
   - Check the address bar yourself. The extension only operates on supported HTTPS .gov.in and .nic.in hosts.
   - Click the JanaSetu Form Assistant toolbar icon.
   - Import the JSON once, preview suggested fields, select only values you have checked, and click **Fill selected fields**.
   - Review every populated field on the portal yourself.

### Safety boundaries

- The helper fills only visible, unambiguous, non-sensitive fields that match its allowlist and the imported profile.
- It does not handle Aadhaar, OTP, CAPTCHA, authentication/security PINs, bank credentials, e-KYC or identity verification.
- It does not upload documents or click Next, Apply, Save, Submit, Confirm or other final/forward navigation controls.
- It does not decide eligibility and does not submit an application.
- PM-KISAN's new farmer registration page asks for Aadhaar and CAPTCHA. The helper intentionally leaves those controls untouched; the example link is for showing where the citizen starts, not for automating identity verification.
- The extension is a generic, citizen-directed browser helper. It is not an official government integration, and universal portal coverage is not enabled.

## Verification

- TypeScript and 177 unit tests.
- Production build.
- E2E checks cover browser speech fallback, on-device recorder-to-worker flow, profile JSON download, extension field preview/fill safety and blocked sensitive controls.
- A real browser-worker smoke test ran the quantized Whisper base model against local synthetic speech fixtures for English, Hindi, Kannada, Tamil, Telugu and Malayalam. This confirms worker/model execution and language-option wiring, not production transcription accuracy for every accent or recording environment.
