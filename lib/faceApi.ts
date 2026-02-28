"use client";

const MODEL_URL = "/models";

/** Timeout for loading all models (ms). Prevents hanging forever. */
export const MODELS_LOAD_TIMEOUT_MS = 60_000;

let modelsLoaded = false;
let faceapiModule: typeof import("face-api.js") | null = null;

async function getFaceApi() {
  if (!faceapiModule) {
    faceapiModule = await import("face-api.js");
  }
  return faceapiModule;
}

/**
 * Load face detector and emotion model. Called only when user starts camera.
 * Sequential load to avoid blocking the main thread too long at once.
 */
export async function loadModels(
  onProgress?: (step: string) => void
): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    onProgress?.("Loading face-api.js…");
    const faceapi = await getFaceApi();

    onProgress?.("Loading face detector (1/2)…");
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);

    onProgress?.("Loading emotion model (2/2)…");
    await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);

    modelsLoaded = true;
    return true;
  } catch (e) {
    console.error("Failed to load face-api models:", e);
    return false;
  }
}

/** Wrap loadModels with a timeout so we don't hang forever. */
export function loadModelsWithTimeout(
  timeoutMs: number = MODELS_LOAD_TIMEOUT_MS,
  onProgress?: (step: string) => void
): Promise<boolean> {
  return Promise.race([
    loadModels(onProgress),
    new Promise<boolean>((_, reject) =>
      setTimeout(
        () => reject(new Error("Model loading timed out. Try again or check your connection.")),
        timeoutMs
      )
    ),
  ]);
}

export type EmotionResult = {
  dominant: string;
  scores: Record<string, number>;
  box?: { x: number; y: number; width: number; height: number };
};

/**
 * Adjusts raw expression scores to make the model more sensitive.
 * face-api.js is notoriously biased towards "neutral".
 * We dampen "neutral" and amplify others to catch micro-expressions.
 */
function adjustExpressions(expressions: Record<string, number>): Record<string, number> {
  const adjusted = { ...expressions };
  const SENSITIVITY_MULTIPLIER = 3.0; // Boosts non-neutral signals

  for (const emotion in adjusted) {
    if (emotion !== 'neutral') {
      adjusted[emotion] = adjusted[emotion] * SENSITIVITY_MULTIPLIER;
    } else {
      // Dampen neutral so it doesn't overpower subtle expressions
      adjusted[emotion] = adjusted[emotion] * 0.4;
    }
  }
  return adjusted;
}

export async function detectEmotion(
  input: HTMLVideoElement | HTMLCanvasElement,
  multiFace: boolean = false
): Promise<EmotionResult[] | EmotionResult | null> {
  if (!modelsLoaded) return null;
  try {
    const faceapi = await getFaceApi();
    const detectorOptions = new faceapi.TinyFaceDetectorOptions({ inputSize: 160 });

    if (multiFace) {
      const results = await faceapi.detectAllFaces(input, detectorOptions).withFaceExpressions();
      if (!results || results.length === 0) return null;

      return results.map(result => {
        const rawExpressions = result.expressions as unknown as Record<string, number>;
        const adjustedExpressions = adjustExpressions(rawExpressions);
        const entries = Object.entries(adjustedExpressions);
        const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];

        // Use raw confidence for display, but maxed at 99.9%
        const confidence = rawExpressions[dominant] ?? 0;

        const scores: Record<string, number> = {};
        for (const [emotion, value] of Object.entries(rawExpressions)) {
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
      });
    } else {
      const result = await faceapi
        .detectSingleFace(input, detectorOptions)
        .withFaceExpressions();

      if (!result) return null;

      const rawExpressions = result.expressions as unknown as Record<string, number>;
      const adjustedExpressions = adjustExpressions(rawExpressions);
      const entries = Object.entries(adjustedExpressions);
      const dominant = entries.reduce((a, b) => (a[1] > b[1] ? a : b))[0];
      const confidence = rawExpressions[dominant] ?? 0;

      const scores: Record<string, number> = {};
      for (const [emotion, value] of Object.entries(rawExpressions)) {
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
    }
  } catch {
    return null;
  }
}
