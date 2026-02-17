"use client";

import { useRef, useEffect, useCallback } from "react";
import { loadModels, detectEmotion, type EmotionResult } from "@/lib/faceApi";
import { EMOTION_COLORS, EMOTION_EMOJIS } from "@/lib/constants";

type MoodEntry = { timestamp: number; emotion: string; confidence: number };

type Props = {
  frameSkip: number;
  privacyMode: boolean;
  privacyType: "blur" | "emoji";
  onEmotion: (result: EmotionResult | null) => void;
  onMoodHistory: (history: MoodEntry[]) => void;
  moodHistory: MoodEntry[];
  running: boolean;
  setRunning: (r: boolean) => void;
  setError: (msg: string | null) => void;
  setModelsReady: (ready: boolean) => void;
};

const MOOD_WINDOW_MS = 60_000;

export default function CameraFeed({
  frameSkip,
  privacyMode,
  privacyType,
  onEmotion,
  onMoodHistory,
  moodHistory,
  running,
  setRunning,
  setError,
  setModelsReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameCountRef = useRef(0);
  const rafRef = useRef<number>(0);
  const historyRef = useRef<MoodEntry[]>([]);

  const drawOverlay = useCallback(
    (ctx: CanvasRenderingContext2D, result: EmotionResult | null) => {
      if (!result || !canvasRef.current) return;
      const { width, height } = canvasRef.current;
      const confidence = result.scores[result.dominant] ?? 0;
      const color = EMOTION_COLORS[result.dominant] ?? "#fff";
      const rgb = hexToRgb(color);

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
      ctx.fillStyle = color;
      ctx.fillRect(10, 10, boxW, boxH);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, 10 + pad, 10 + 20);
    },
    [privacyMode, privacyType]
  );

  const processFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || !running || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    frameCountRef.current += 1;
    const shouldDetect = frameCountRef.current % frameSkip === 0;

    let result: EmotionResult | null = null;
    if (shouldDetect) {
      result = await detectEmotion(video);
      if (result) {
        onEmotion(result);
        const confidence = result.scores[result.dominant] ?? 0;
        const entry: MoodEntry = {
          timestamp: Date.now(),
          emotion: result.dominant,
          confidence,
        };
        historyRef.current = [...historyRef.current, entry].filter(
          (e) => e.timestamp > Date.now() - MOOD_WINDOW_MS
        );
        onMoodHistory(historyRef.current);
      }
    }

    const ctx = canvas.getContext("2d");
    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);

      if (result && privacyMode && result.box) {
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

      if (result) drawOverlay(ctx, result);
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [
    running,
    frameSkip,
    privacyMode,
    privacyType,
    onEmotion,
    onMoodHistory,
    drawOverlay,
  ]);

  useEffect(() => {
    if (!running) return;
    rafRef.current = requestAnimationFrame(processFrame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running, processFrame]);

  useEffect(() => {
    let mounted = true;
    setError(null);
    (async () => {
      const ok = await loadModels();
      if (mounted) setModelsReady(ok);
      if (!ok && mounted) setError("Failed to load AI models. Check /models.");
    })();
    return () => {
      mounted = false;
    };
  }, [setModelsReady, setError]);

  useEffect(() => {
    if (!running) return;
    const video = videoRef.current;
    if (!video) return;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        streamRef.current = stream;
        video.srcObject = stream;
        video.play();
      })
      .catch((err) => {
        setError("Could not access camera: " + (err.message || "Permission denied"));
        setRunning(false);
      });
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (video) video.srcObject = null;
    };
  }, [running, setError, setRunning]);

  if (!running) {
    return (
      <div className="rounded-xl bg-mirror-card border border-mirror-border overflow-hidden aspect-video max-w-3xl flex items-center justify-center">
        <div className="text-center p-8">
          <p className="text-zinc-400 mb-4">Camera is off</p>
          <button
            type="button"
            onClick={() => setRunning(true)}
            className="px-6 py-3 rounded-lg bg-gradient-to-r from-mirror-purple to-mirror-violet text-white font-medium hover:opacity-90 transition"
          >
            Start camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-xl overflow-hidden border border-mirror-border aspect-video max-w-3xl bg-black">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: "scaleX(-1)" }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ transform: "scaleX(-1)" }}
      />
      <button
        type="button"
        onClick={() => setRunning(false)}
        className="absolute bottom-3 right-3 px-4 py-2 rounded-lg bg-red-500/90 text-white text-sm font-medium hover:bg-red-500"
      >
        Stop camera
      </button>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgb(${r},${g},${b})`;
}
