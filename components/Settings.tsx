"use client";

import {
  DEFAULT_FRAME_SKIP,
  MIN_FRAME_SKIP,
  MAX_FRAME_SKIP,
  type Theme,
} from "@/lib/constants";

type Props = {
  cameraSource: "webcam" | "ip";
  setCameraSource: (v: "webcam" | "ip") => void;
  ipCameraUrl: string;
  setIpCameraUrl: (v: string) => void;
  frameSkip: number;
  setFrameSkip: (v: number) => void;
  privacyMode: boolean;
  setPrivacyMode: (v: boolean) => void;
  privacyType: "blur" | "emoji";
  setPrivacyType: (v: "blur" | "emoji") => void;
  showVideo: boolean;
  setShowVideo: (v: boolean) => void;
  multiFace: boolean;
  setMultiFace: (v: boolean) => void;
  audioFeedback: boolean;
  setAudioFeedback: (v: boolean) => void;
  theme: Theme;
};

export default function Settings({
  cameraSource,
  setCameraSource,
  ipCameraUrl,
  setIpCameraUrl,
  frameSkip,
  setFrameSkip,
  privacyMode,
  setPrivacyMode,
  privacyType,
  setPrivacyType,
  showVideo,
  setShowVideo,
  multiFace,
  setMultiFace,
  audioFeedback,
  setAudioFeedback,
  theme,
}: Props) {
  return (
    <div className={`w-full space-y-6 transition-colors duration-1000 border rounded-xl p-4 ${theme.bgPanel} ${theme.border}`}>
      <div>
        <h2 className="text-sm font-semibold text-zinc-200 mb-3">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-400 mb-2">
              Camera source
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setCameraSource("webcam")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors duration-500 ${cameraSource === "webcam"
                  ? `${theme.accent} text-white`
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
              >
                Webcam
              </button>
              <button
                type="button"
                onClick={() => setCameraSource("ip")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors duration-500 ${cameraSource === "ip"
                  ? `${theme.accent} text-white`
                  : "bg-white/5 text-zinc-400 hover:bg-white/10"
                  }`}
              >
                Phone (IP)
              </button>
            </div>
            {cameraSource === "ip" && (
              <>
                <input
                  type="text"
                  value={ipCameraUrl}
                  onChange={(e) => setIpCameraUrl(e.target.value)}
                  placeholder="http://192.168.29.88:8080"
                  className={`w-full px-3 py-2 rounded-lg border bg-black/20 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors duration-1000 ${theme.border}`}
                />
                <p className="text-xs text-zinc-500 mt-1">
                  Run app locally (npm run dev), same Wi‑Fi as phone. If stream is blocked: open this URL in a new tab, accept the security warning once, then try again here.
                </p>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Frame skip (every Nth frame)
            </label>
            <input
              type="range"
              min={MIN_FRAME_SKIP}
              max={MAX_FRAME_SKIP}
              value={frameSkip}
              onChange={(e) => setFrameSkip(Number(e.target.value))}
              className={`w-full h-2 rounded-lg appearance-none bg-white/10 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full transition-colors duration-1000 [&::-webkit-slider-thumb]:${theme.accent}`}
            />
            <p className="text-xs text-zinc-400 mt-0.5">{frameSkip}</p>
          </div>
          <div className={`pt-2 border-t transition-colors duration-1000 ${theme.border}`}>
            <h3 className="text-xs font-medium text-zinc-300 mb-2">
              Privacy shield
            </h3>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className={`rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-colors duration-1000`}
              />
              <span className="text-sm text-zinc-300">Enable privacy mode</span>
            </label>
            {privacyMode && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPrivacyType("blur")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-500 ${privacyType === "blur"
                    ? `${theme.accent} text-white`
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                >
                  Blur
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacyType("emoji")}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors duration-500 ${privacyType === "emoji"
                    ? `${theme.accent} text-white`
                    : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                >
                  Emoji
                </button>
              </div>
            )}
          </div>
          <div className={`pt-2 border-t transition-colors duration-1000 ${theme.border}`}>
            <h3 className="text-xs font-medium text-zinc-300 mb-2">
              Advanced Features
            </h3>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={showVideo}
                onChange={(e) => setShowVideo(e.target.checked)}
                className={`rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-colors duration-1000`}
              />
              <span className="text-sm text-zinc-300">Show Video Background</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={multiFace}
                onChange={(e) => setMultiFace(e.target.checked)}
                className={`rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-colors duration-1000`}
              />
              <span className="text-sm text-zinc-300">Multi-Face Detection</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={audioFeedback}
                onChange={(e) => setAudioFeedback(e.target.checked)}
                className={`rounded border-white/20 bg-black/20 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0 transition-colors duration-1000`}
              />
              <span className="text-sm text-zinc-300">Ambient Audio Feedback</span>
            </label>
          </div>
        </div>
      </div>
      <div className={`pt-4 border-t text-xs text-zinc-500 space-y-1 transition-colors duration-1000 ${theme.border}`}>
        <p className="font-medium text-zinc-400">Emotion Detector</p>
        <p>100% local processing in your browser. No cloud, no uploads.</p>
      </div>
    </div>
  );
}
