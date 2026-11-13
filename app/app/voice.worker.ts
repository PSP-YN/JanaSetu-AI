/// <reference lib="webworker" />
import { env, pipeline } from "@huggingface/transformers";

type VoiceRequest = { id: number; audio: Float32Array; language: string };
type VoiceResponse = { id: number; type: "progress" | "result" | "error"; progress?: number; message?: string; transcript?: string; backend?: string };

const scope = self as DedicatedWorkerGlobalScope;
let transcriber: any = null;
let backend = "wasm";
let loading: Promise<void> | null = null;

env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;
const runtimeEnv = env as typeof env & { backends?: { onnx?: { wasm?: { numThreads: number } } } };
if (runtimeEnv.backends?.onnx?.wasm) runtimeEnv.backends.onnx.wasm.numThreads = 1;

async function loadModel(id: number) {
  if (transcriber) return;
  if (!loading) {
    loading = (async () => {
      const progress_callback = (event: { status?: string; progress?: number }) => {
        const progress = Math.max(0, Math.min(100, Math.round(event.progress ?? 0)));
        scope.postMessage({ id, type: "progress", progress, message: event.status || "Preparing the on-device speech model" } satisfies VoiceResponse);
      };
      const gpu = (scope as unknown as { navigator?: { gpu?: { requestAdapter: () => Promise<unknown> } } }).navigator?.gpu;
      const adapter = gpu?.requestAdapter ? await gpu.requestAdapter().catch(() => null) : null;
      if (adapter) {
        try {
          transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-base", { dtype: "q8", device: "webgpu", progress_callback });
          backend = "webgpu";
          return;
        } catch {
          transcriber = null;
        }
      }
      transcriber = await pipeline("automatic-speech-recognition", "onnx-community/whisper-base", { dtype: "q8", device: "wasm", progress_callback });
      backend = "wasm";
    })().catch((error) => { loading = null; throw error; });
  }
  await loading;
}

scope.onmessage = async (event: MessageEvent<VoiceRequest>) => {
  const { id, audio, language } = event.data;
  try {
    if (!(audio instanceof Float32Array) || audio.length < 16000) throw new Error("No usable audio was recorded. Try speaking for at least one second.");
    await loadModel(id);
    if (!transcriber) throw new Error("The on-device speech model could not be loaded.");
    scope.postMessage({ id, type: "progress", message: "Model ready. Transcribing audio on this device." } satisfies VoiceResponse);
    const result = await transcriber(audio, { language, task: "transcribe", return_timestamps: false });
    const transcript = typeof result === "string" ? result : Array.isArray(result) ? result.map((item: any) => item.text || "").join(" ") : result.text || "";
    if (!transcript.trim()) throw new Error("No speech was recognised. Try a quieter place and speak clearly.");
    scope.postMessage({ id, type: "result", transcript: transcript.trim(), backend } satisfies VoiceResponse);
  } catch (error) {
    scope.postMessage({ id, type: "error", message: error instanceof Error ? error.message : "On-device transcription failed." } satisfies VoiceResponse);
  }
};
