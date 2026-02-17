"use client";

const MODEL_URL = "/models";

let modelsLoaded = false;
let faceapiModule: typeof import("face-api.js") | null = null;

async function getFaceApi() {
  if (!faceapiModule) {
    faceapiModule = await import("face-api.js");
  }
  return faceapiModule;
}

export async function loadModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    const faceapi = await getFaceApi();
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
    return true;
  } catch (e) {
    console.error("Failed to load face-api models:", e);
    return false;
  }
}

export type EmotionResult = {
  dominant: string;
  scores: Record<string, number>;
  box?: { x: number; y: number; width: number; height: number };
};

export async function detectEmotion(
  input: HTMLVideoElement | HTMLCanvasElement
): Promise<EmotionResult | null> {
  if (!modelsLoaded) return null;
  try {
    const faceapi = await getFaceApi();
    const result = await faceapi
      .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    if (!result) return null;

    const expressions = result.expressions as unknown as Record<string, number>;
    const entries = Object.entries(expressions);
    const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
    const confidence = expressions[dominant] ?? 0;

    const scores: Record<string, number> = {};
    for (const [emotion, value] of entries) {
      scores[emotion] = Math.round(value * 1000) / 10;
    }

    const box = result.detection?.box
      ? {
          x: result.detection.box.x,
          y: result.detection.box.y,
          width: result.detection.box.width,
          height: result.detection.box.height,
        }
      : undefined;

    return {
      dominant,
      scores: { ...scores, [dominant]: Math.round(confidence * 1000) / 10 },
      box,
    };
  } catch {
    return null;
  }
}
