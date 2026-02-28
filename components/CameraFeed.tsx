"use client";

import { useRef, useEffect, useCallback } from "react";
import { loadModelsWithTimeout, detectEmotion, type EmotionResult } from "@/lib/faceApi";
import { EMOTION_COLORS, EMOTION_EMOJIS, type Theme } from "@/lib/constants";
import { IP_CAMERA_SNAPSHOT_PATH, IP_CAMERA_POLL_MS } from "@/lib/constants";

type MoodEntry = { timestamp: number; emotion: string; confidence: number };

type Props = {
  cameraSource: "webcam" | "ip";
  ipCameraUrl: string;
  frameSkip: number;
  privacyMode: boolean;
  privacyType: "blur" | "emoji";
  showVideo: boolean;
  multiFace: boolean;
  onEmotion: (result: EmotionResult | null) => void;
  onMoodHistory: (history: MoodEntry[]) => void;
  moodHistory: MoodEntry[];
  running: boolean;
  setRunning: (r: boolean) => void;
  setError: (msg: string | null) => void;
  setModelsReady: (ready: boolean) => void;
  onLog?: (msg: string) => void;
  onLoadProgress?: (step: string | null) => void;
  theme: Theme;
};

const MOOD_WINDOW_MS = 60_000;

function buildIpSnapshotUrl(baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, "");
  const snapshotUrl = `${base}${IP_CAMERA_SNAPSHOT_PATH}`;
  if (typeof window === "undefined") return snapshotUrl;
  return `/api/camera-proxy?url=${encodeURIComponent(snapshotUrl)}`;
}

export default function CameraFeed({
  cameraSource,
  ipCameraUrl,
  frameSkip,
  privacyMode,
  privacyType,
  showVideo,
  multiFace,
  onEmotion,
  onMoodHistory,
  running,
  setRunning,
  setError,
  setModelsReady,
  onLog,
  onLoadProgress,
  theme,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const log = useCallback((msg: string) => onLog?.(msg), [onLog]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const rafRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const historyRef = useRef<MoodEntry[]>([]);

  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, result: EmotionResult | null) => {
      if (!result || !canvasRef.current) return;
      const confidence = result.scores[result.dominant] ?? 0;
      const color = EMOTION_COLORS[result.dominant] ?? "#fff";

      if (result.box && !(privacyMode && privacyType === "emoji")) {
        const { x, y, width: w, height: h } = result.box;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.strokeRect(x, y, w, h);
      }

      const label = `${result.dominant.toUpperCase()} (${confidence.toFixed(1)}%)`;
      ctx.font = "bold 20px system-ui, sans-serif";
      const metrics = ctx.measureText(label);
      const pad = 10;
      const boxW = metrics.width + pad * 2;
      const boxH = 28;

      const startX = result.box ? result.box.x : 10;
      const startY = result.box ? result.box.y : 10 + boxH;

      ctx.fillStyle = color;
      ctx.fillRect(startX, Math.max(0, startY - boxH), boxW, boxH);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, startX + pad, Math.max(0, startY - boxH) + 20);
    },
    [privacyMode, privacyType]
  );

  const takeSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `emotion-snapshot-${new Date().getTime()}.png`;
    a.click();
  }, []);

  const processFrameWebcam = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !running || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrameWebcam);
      return;
    }

    frameCountRef.current += 1;
    const shouldDetect = frameCountRef.current % frameSkip === 0;

    let results: EmotionResult[] = [];
    if (shouldDetect) {
      const detectResult = await detectEmotion(video, multiFace);
      if (detectResult) {
        results = Array.isArray(detectResult) ? detectResult : [detectResult];

        // Use the largest face or first face for main stats
        const mainResult = results[0];

        log(`detect: ${mainResult.dominant} ${(mainResult.scores[mainResult.dominant] ?? 0).toFixed(1)}%`);
        onEmotion(mainResult);
        const confidence = mainResult.scores[mainResult.dominant] ?? 0;
        const entry: MoodEntry = {
          timestamp: Date.now(),
          emotion: mainResult.dominant,
          confidence,
        };
        historyRef.current = [...historyRef.current, entry].filter(
          (e) => e.timestamp > Date.now() - MOOD_WINDOW_MS
        );
        onMoodHistory(historyRef.current);
      } else {
        log("detect: no face in frame");
      }
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      if (showVideo) {
        ctx.drawImage(video, 0, 0);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      for (const result of results) {
        if (privacyMode && result.box && showVideo) {
          if (privacyType === "blur") {
            ctx.filter = "blur(25px)";
            ctx.drawImage(
              canvas,
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height,
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height
            );
            ctx.filter = "none";
          } else if (privacyType === "emoji") {
            const emoji = EMOTION_EMOJIS[result.dominant] ?? "😐";
            ctx.font = "120px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height
            );
            ctx.fillText(
              emoji,
              result.box.x + result.box.width / 2,
              result.box.y + result.box.height / 2
            );
          }
        }
        drawOverlay(ctx, result);
      }
    }

    rafRef.current = requestAnimationFrame(processFrameWebcam);
  }, [
    running,
    frameSkip,
    privacyMode,
    privacyType,
    onEmotion,
    onMoodHistory,
    drawOverlay,
    log,
  ]);

  const ipSkipLogRef = useRef(false);
  const processIpFrame = useCallback(async () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas || !running) return;
    if (!img.complete || img.naturalWidth === 0) {
      if (!ipSkipLogRef.current) {
        ipSkipLogRef.current = true;
        log("ip: waiting for first image (is the proxy reaching your phone?)");
      }
      return;
    }
    ipSkipLogRef.current = false;

    frameCountRef.current += 1;
    const shouldDetect = frameCountRef.current % frameSkip === 0;

    let results: EmotionResult[] = [];
    if (shouldDetect) {
      const detectResult = await detectEmotion(canvas, multiFace);
      if (detectResult) {
        results = Array.isArray(detectResult) ? detectResult : [detectResult];

        const mainResult = results[0];
        log(`detect(ip): ${mainResult.dominant} ${(mainResult.scores[mainResult.dominant] ?? 0).toFixed(1)}%`);
        onEmotion(mainResult);
        const confidence = mainResult.scores[mainResult.dominant] ?? 0;
        const entry: MoodEntry = {
          timestamp: Date.now(),
          emotion: mainResult.dominant,
          confidence,
        };
        historyRef.current = [...historyRef.current, entry].filter(
          (e) => e.timestamp > Date.now() - MOOD_WINDOW_MS
        );
        onMoodHistory(historyRef.current);
      } else {
        log("detect(ip): no face in frame");
      }
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (canvas.width !== img.naturalWidth || canvas.height !== img.naturalHeight) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
      }

      if (showVideo) {
        ctx.drawImage(img, 0, 0);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      for (const result of results) {
        if (privacyMode && result.box && showVideo) {
          if (privacyType === "blur") {
            ctx.filter = "blur(25px)";
            ctx.drawImage(
              canvas,
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height,
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height
            );
            ctx.filter = "none";
          } else if (privacyType === "emoji") {
            const emoji = EMOTION_EMOJIS[result.dominant] ?? "😐";
            ctx.font = "120px system-ui, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "rgba(0,0,0,0.4)";
            ctx.fillRect(
              result.box.x,
              result.box.y,
              result.box.width,
              result.box.height
            );
            ctx.fillText(
              emoji,
              result.box.x + result.box.width / 2,
              result.box.y + result.box.height / 2
            );
          }
        }

        drawOverlay(ctx, result);
      }
    }
  }, [
    running,
    frameSkip,
    privacyMode,
    privacyType,
    onEmotion,
    onMoodHistory,
    drawOverlay,
    log,
  ]);

  useEffect(() => {
    if (!running) {
      onLoadProgress?.(null);
      return;
    }
    let mounted = true;
    setError(null);
    onLoadProgress?.("Starting…");
    log("models: loading (deferred until you started camera)...");
    const timeoutId = setTimeout(() => {
      (async () => {
        try {
          const ok = await loadModelsWithTimeout(60_000, (step) => {
            if (mounted) {
              onLoadProgress?.(step);
              log(`models: ${step}`);
            }
          });
          if (mounted) {
            setModelsReady(ok);
            onLoadProgress?.(null);
            if (ok) log("models: loaded OK");
            else {
              log("models: FAILED to load");
              setError("Failed to load AI models. Check /models.");
            }
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Load failed";
          if (mounted) {
            onLoadProgress?.(null);
            setModelsReady(false);
            setError(msg);
            log(`models: ${msg}`);
          }
        }
      })();
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      mounted = false;
      onLoadProgress?.(null);
    };
  }, [running, setModelsReady, setError, onLoadProgress, log]);

  useEffect(() => {
    if (!running) return;

    if (cameraSource === "webcam") {
      const video = videoRef.current;
      if (!video) {
        log("webcam: no video element ref");
        return;
      }
      log("webcam: requesting getUserMedia...");
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 } })
        .then((stream) => {
          streamRef.current = stream;
          log(`webcam: stream active, tracks=${stream.getTracks().length}`);
          video.srcObject = stream;
          video.play().then(
            () => log("webcam: video.play() resolved"),
            (e) => log(`webcam: video.play() rejected: ${e?.message ?? e}`)
          );
          video.onloadeddata = () =>
            log(`webcam: video readyState=${video.readyState} size=${video.videoWidth}x${video.videoHeight}`);
          video.onerror = () => log(`webcam: video error`);
        })
        .catch((err) => {
          const msg = err.message || "Permission denied";
          log(`webcam: getUserMedia failed: ${msg}`);
          setError("Could not access camera: " + msg);
          setRunning(false);
        });
      return () => {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
      };
    }

    if (cameraSource === "ip") {
      log(`ip: starting poll url=${ipCameraUrl}`);
    }
    setError(null);
    return () => { };
  }, [running, cameraSource, ipCameraUrl, setError, setRunning, log]);

  useEffect(() => {
    if (!running) return;

    if (cameraSource === "webcam") {
      rafRef.current = requestAnimationFrame(processFrameWebcam);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [running, cameraSource, processFrameWebcam]);

  useEffect(() => {
    if (!running || cameraSource !== "ip") return;

    const proxyUrl = buildIpSnapshotUrl(ipCameraUrl);
    const fullUrl = `${proxyUrl}&t=${Date.now()}`;
    log(`ip: proxy URL = ${fullUrl}`);
    log("ip: app must be run locally (npm run dev) on same Wi‑Fi as phone for proxy to reach the camera");

    const tick = () => {
      const img = imgRef.current;
      if (img) {
        img.src = `${proxyUrl}&t=${Date.now()}`;
      }
    };

    log("ip: polling started (fetching snapshot every 200ms)");
    intervalRef.current = setInterval(tick, IP_CAMERA_POLL_MS);
    tick();
    return () => {
      log("ip: polling stopped");
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [running, cameraSource, ipCameraUrl, log]);

  if (!running) {
    return (
      <div className={`w-full h-full rounded-xl border transition-colors duration-1000 ${theme.bgPanel} ${theme.border} overflow-hidden aspect-video flex items-center justify-center`}>
        <div className="text-center p-8">
          <p className="text-zinc-400 mb-4">
            Camera is off
            {cameraSource === "ip" && (
              <span className="block text-xs mt-1 text-zinc-500">
                Use Settings → Phone (IP) and enter your IP Webcam URL
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={() => setRunning(true)}
            className={`px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-colors duration-1000 ${theme.accent}`}
          >
            Start camera
          </button>
        </div>
      </div>
    );
  }

  if (cameraSource === "ip") {
    const proxyUrl = buildIpSnapshotUrl(ipCameraUrl);
    return (
      <div className={`relative w-full h-full rounded-xl overflow-hidden border transition-colors duration-1000 ${theme.border} aspect-video bg-black`}>
        <img
          ref={(el) => {
            imgRef.current = el;
          }}
          src={`${proxyUrl}&t=${Date.now()}`}
          alt="IP camera"
          className="absolute inset-0 w-full h-full object-contain opacity-0"
          onLoad={() => {
            log(`ip: image loaded ${imgRef.current?.naturalWidth ?? 0}x${imgRef.current?.naturalHeight ?? 0}`);
            processIpFrame();
          }}
          onError={() => {
            log("ip: image load FAILED — check: same Wi‑Fi as phone, app run locally (npm run dev), correct IP Webcam URL (e.g. http://192.168.1.x:8080)");
          }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain"
        />
        <div className="absolute bottom-3 right-3 flex gap-2">
          <button
            type="button"
            onClick={takeSnapshot}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity backdrop-blur-md bg-white/20 border border-white/50 shadow-lg flex items-center gap-2`}
          >
            📸 Snapshot
          </button>
          <button
            type="button"
            onClick={() => setRunning(false)}
            className="px-4 py-2 rounded-lg bg-red-500/90 text-white text-sm font-medium hover:bg-red-500"
          >
            Stop camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full rounded-xl overflow-hidden border transition-colors duration-1000 ${theme.border} aspect-video bg-black`}>
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${showVideo ? "" : "opacity-0 invisible"}`}
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />
      <div className="absolute bottom-3 right-3 flex gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={takeSnapshot}
          className={`px-4 py-2 rounded-lg text-white text-sm font-medium hover:opacity-80 transition-opacity backdrop-blur-md bg-white/20 border border-white/50 shadow-lg flex items-center gap-2`}
        >
          📸 Snapshot
        </button>
        <button
          type="button"
          onClick={() => setRunning(false)}
          className="px-4 py-2 rounded-lg bg-red-500/90 text-white text-sm font-medium hover:bg-red-500"
        >
          Stop camera
        </button>
      </div>
    </div>
  );
}
