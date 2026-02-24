"use client";

import { useState } from "react";
import CameraFeed from "@/components/CameraFeed";
import EmotionChart from "@/components/EmotionChart";
import StatsPanel from "@/components/StatsPanel";
import Settings from "@/components/Settings";
import DebugPanel, { useDebugLog } from "@/components/DebugPanel";
import type { EmotionResult } from "@/lib/faceApi";
import { getTheme, EMOTION_EMOJIS } from "@/lib/constants";

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

  const dominant = emotion?.dominant ?? "neutral";
  const theme = getTheme(dominant);
  const currentEmoji = EMOTION_EMOJIS[dominant] ?? "😐";

  return (
    <div className="relative min-h-screen p-4 md:p-8 transition-colors duration-1000 overflow-x-hidden overflow-y-auto text-zinc-200 z-0 flex flex-col items-center">
      {/* Dynamic Background Glow */}
      <div
        className={`fixed -top-[50%] -left-[50%] w-[200%] h-[200%] transition-colors duration-1000 ${theme.glow} opacity-20 blur-[150px] pointer-events-none -z-10`}
      />

      <header className="w-full max-w-[90rem] flex justify-between items-center mb-8 z-20">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white drop-shadow-md">
            Sentient
          </h1>
          <p className="text-xs font-medium text-zinc-400 tracking-wider">
            LOCAL OSS MOOD ENGINE
          </p>
        </div>
        {error && (
          <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm backdrop-blur-md">
            {error}
          </div>
        )}
      </header>

      <main className="w-full max-w-[90rem] grid grid-cols-1 xl:grid-cols-12 gap-8 relative z-10 flex-1 items-start">

        {/* Left Side: Stats & Settings */}
        <div className="xl:col-span-3 space-y-6 flex flex-col w-full">
          <StatsPanel current={emotion} moodHistory={moodHistory} theme={theme} />
          <Settings
            theme={theme}
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

        {/* Center: Hero Camera */}
        <div className="xl:col-span-6 flex flex-col items-center justify-start w-full">

          <div className="flex flex-col items-center justify-center h-32 mb-6">
            {emotion?.dominant ? (
              <>
                <span className="text-6xl drop-shadow-2xl mb-2 animate-bounce">{currentEmoji}</span>
                <h2 className={`text-5xl font-black uppercase tracking-tighter transition-colors duration-1000 ${theme.text} drop-shadow-2xl`}>
                  {emotion.dominant}
                </h2>
              </>
            ) : (
              <>
                <span className="text-4xl drop-shadow-2xl mb-2 opacity-50">{currentEmoji}</span>
                <h2 className={`text-2xl font-black uppercase tracking-widest transition-colors duration-1000 text-zinc-500 drop-shadow-2xl`}>
                  Awaiting Face
                </h2>
              </>
            )}
          </div>

          <div className={`w-full max-w-3xl p-2 rounded-[2.5rem] border-4 transition-colors duration-1000 ${theme.border} ${theme.bgPanel} shadow-2xl`}>
            <div className="rounded-[2rem] overflow-hidden bg-black/50 aspect-video flex items-center justify-center relative w-full h-full">
              <CameraFeed
                theme={theme}
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
            </div>
          </div>

        </div>

        {/* Right Side: Chart & Debug */}
        <div className="xl:col-span-3 space-y-6 flex flex-col w-full">
          <EmotionChart data={moodHistory} theme={theme} />
          <DebugPanel entries={debugEntries} onClear={clearDebug} theme={theme} />
        </div>

      </main>

      {/* Loading Modal */}
      {running && !modelsReady && !error && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className={`border transition-colors duration-1000 ${theme.border} ${theme.bgPanel} rounded-xl p-6 max-w-md text-left shadow-2xl shadow-black/50`}>
            <p className="text-white font-medium mb-2">
              {modelLoadStep ?? "Loading AI models…"}
            </p>
            <p className="text-zinc-300 text-sm mb-2">
              Downloading two small neural nets into your browser: one to find faces, one to read emotions. They run 100% on your device — no video is sent anywhere. First time can take 15–45s; we’ll give up after 60s if it’s stuck.
            </p>
            <p className="text-zinc-400 text-xs">
              If this hangs, try a faster connection or refresh and start camera again.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
