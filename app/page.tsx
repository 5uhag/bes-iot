"use client";

import { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import EmotionChart from "@/components/EmotionChart";
import StatsPanel from "@/components/StatsPanel";
import Settings from "@/components/Settings";
import DebugPanel, { useDebugLog } from "@/components/DebugPanel";
import type { EmotionResult } from "@/lib/faceApi";
import { EMOTION_COLORS } from "@/lib/constants";

type MoodEntry = { timestamp: number; emotion: string; confidence: number };

const DEFAULT_IP_CAMERA_URL = "http://192.168.29.88:8080";

export default function Home() {
  const { entries: debugEntries, log, clear: clearDebug } = useDebugLog();
  const [running, setRunning] = useState(false);
  const [emotion, setEmotion] = useState<EmotionResult | null>(null);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [cameraSource, setCameraSource] = useState<"webcam" | "ip">("webcam");
  const [ipCameraUrl, setIpCameraUrl] = useState(DEFAULT_IP_CAMERA_URL);
  const [frameSkip, setFrameSkip] = useState(5);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [privacyType, setPrivacyType] = useState<"blur" | "emoji">("blur");
  const [error, setError] = useState<string | null>(null);
  const [modelsReady, setModelsReady] = useState(false);
  const [modelLoadStep, setModelLoadStep] = useState<string | null>(null);

  const moodColor = emotion?.dominant ? EMOTION_COLORS[emotion.dominant] : undefined;
  const moodBg = moodColor
    ? `linear-gradient(135deg, ${moodColor}18 0%, ${moodColor}08 50%, transparent 100%)`
    : undefined;

  return (
    <div
      className="min-h-screen p-6 transition-[background] duration-700"
      style={moodBg ? { background: moodBg } : undefined}
    >
      <header className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gradient">
          Sentient Mirror OSS
        </h1>
        <p className="text-zinc-500 mt-1">
          Privacy-first real-time mood detection — runs entirely in your browser.
          Works across face types; good lighting helps.
        </p>
        {moodColor && (
          <p
            className="mt-2 text-sm font-medium transition-opacity duration-500"
            style={{ color: moodColor }}
          >
            Mood: {emotion?.dominant ?? ""}
          </p>
        )}
        {error && (
          <div className="mt-3 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm">
            {error}
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto flex gap-6 flex-col lg:flex-row">
        <div className="flex-1 min-w-0 space-y-6">
          <section>
            <h2 className="text-sm font-medium text-zinc-400 mb-2">
              Live video
            </h2>
            <CameraFeed
              cameraSource={cameraSource}
              ipCameraUrl={ipCameraUrl}
              frameSkip={frameSkip}
              privacyMode={privacyMode}
              privacyType={privacyType}
              onEmotion={setEmotion}
              onMoodHistory={setMoodHistory}
              moodHistory={moodHistory}
              running={running}
              setRunning={setRunning}
              setError={setError}
              setModelsReady={setModelsReady}
              onLog={log}
              onLoadProgress={setModelLoadStep}
            />
          </section>
          <section>
            <h2 className="text-sm font-medium text-zinc-400 mb-2">
              Mood trend (60s)
            </h2>
            <EmotionChart data={moodHistory} />
          </section>
          <section className="lg:hidden space-y-4">
            <h2 className="text-sm font-medium text-zinc-400">Current stats</h2>
            <StatsPanel current={emotion} moodHistory={moodHistory} />
            <Settings
              cameraSource={cameraSource}
              setCameraSource={setCameraSource}
              ipCameraUrl={ipCameraUrl}
              setIpCameraUrl={setIpCameraUrl}
              frameSkip={frameSkip}
              setFrameSkip={setFrameSkip}
              privacyMode={privacyMode}
              setPrivacyMode={setPrivacyMode}
              privacyType={privacyType}
              setPrivacyType={setPrivacyType}
            />
          </section>
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">
            <h2 className="text-sm font-medium text-zinc-400">Current stats</h2>
            <StatsPanel current={emotion} moodHistory={moodHistory} />
            <Settings
              cameraSource={cameraSource}
              setCameraSource={setCameraSource}
              ipCameraUrl={ipCameraUrl}
              setIpCameraUrl={setIpCameraUrl}
              frameSkip={frameSkip}
              setFrameSkip={setFrameSkip}
              privacyMode={privacyMode}
              setPrivacyMode={setPrivacyMode}
              privacyType={privacyType}
              setPrivacyType={setPrivacyType}
            />
          </div>
        </div>
      </main>

      {running && !modelsReady && !error && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-10 p-4">
          <div className="bg-mirror-card border border-mirror-border rounded-xl p-6 max-w-md text-left">
            <p className="text-white font-medium mb-2">
              {modelLoadStep ?? "Loading AI models…"}
            </p>
            <p className="text-zinc-400 text-sm mb-2">
              Downloading two small neural nets into your browser: one to find faces, one to read emotions. They run 100% on your device — no video is sent anywhere. First time can take 15–45s; we’ll give up after 60s if it’s stuck.
            </p>
            <p className="text-zinc-500 text-xs">
              If this hangs, try a faster connection or refresh and start camera again.
            </p>
          </div>
        </div>
      )}

      <DebugPanel entries={debugEntries} onClear={clearDebug} />
    </div>
  );
}
