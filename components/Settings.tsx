"use client";

import {
  DEFAULT_FRAME_SKIP,
  MIN_FRAME_SKIP,
  MAX_FRAME_SKIP,
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
}: Props) {
  return (
    <aside className="w-64 shrink-0 space-y-6 border-l border-mirror-border pl-6">
      <div>
        <h2 className="text-sm font-semibold text-zinc-300 mb-3">Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-zinc-500 mb-2">
              Camera source
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => setCameraSource("webcam")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  cameraSource === "webcam"
                    ? "bg-mirror-purple text-white"
                    : "bg-mirror-border text-zinc-400 hover:bg-zinc-600"
                }`}
              >
                Webcam
              </button>
              <button
                type="button"
                onClick={() => setCameraSource("ip")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                  cameraSource === "ip"
                    ? "bg-mirror-purple text-white"
                    : "bg-mirror-border text-zinc-400 hover:bg-zinc-600"
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
                  placeholder="http://192.168.1.5:8080"
                  className="w-full px-3 py-2 rounded-lg bg-mirror-card border border-mirror-border text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-mirror-purple"
                />
                <p className="text-xs text-zinc-500 mt-1">
                  IP Webcam app URL. Run the app locally (npm run dev) on same Wi‑Fi — the proxy loads the feed so the browser won’t block it.
                </p>
              </>
            )}
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">
              Frame skip (every Nth frame)
            </label>
            <input
              type="range"
              min={MIN_FRAME_SKIP}
              max={MAX_FRAME_SKIP}
              value={frameSkip}
              onChange={(e) => setFrameSkip(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none bg-mirror-border accent-mirror-purple"
            />
            <p className="text-xs text-zinc-500 mt-0.5">{frameSkip}</p>
          </div>
          <div className="pt-2 border-t border-mirror-border">
            <h3 className="text-xs font-medium text-zinc-400 mb-2">
              Privacy shield
            </h3>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="rounded border-mirror-border bg-mirror-card text-mirror-purple focus:ring-mirror-purple"
              />
              <span className="text-sm">Enable privacy mode</span>
            </label>
            {privacyMode && (
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPrivacyType("blur")}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    privacyType === "blur"
                      ? "bg-mirror-purple text-white"
                      : "bg-mirror-border text-zinc-400 hover:bg-zinc-600"
                  }`}
                >
                  Blur
                </button>
                <button
                  type="button"
                  onClick={() => setPrivacyType("emoji")}
                  className={`px-3 py-1.5 rounded-lg text-sm ${
                    privacyType === "emoji"
                      ? "bg-mirror-purple text-white"
                      : "bg-mirror-border text-zinc-400 hover:bg-zinc-600"
                  }`}
                >
                  Emoji
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pt-4 border-t border-mirror-border text-xs text-zinc-500 space-y-1">
        <p className="font-medium text-zinc-400">Sentient Mirror OSS</p>
        <p>100% local processing in your browser. No cloud, no uploads.</p>
      </div>
    </aside>
  );
}
