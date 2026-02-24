export const EMOTION_COLORS: Record<string, string> = {
  happy: "#34d399",
  sad: "#60a5fa",
  angry: "#fb7185",
  surprised: "#fbbf24",
  fearful: "#c084fc",
  disgusted: "#a3e635",
  neutral: "#a1a1aa",
};

export type Theme = {
  text: string;
  border: string;
  accent: string;
  bgPanel: string;
  glow: string;
};

export const EMOTION_THEMES: Record<string, Theme> = {
  happy: { text: "text-emerald-400", border: "border-emerald-500/30", accent: "bg-emerald-500", bgPanel: "bg-emerald-950/20 backdrop-blur-xl", glow: "bg-emerald-500" },
  sad: { text: "text-blue-400", border: "border-blue-500/30", accent: "bg-blue-600", bgPanel: "bg-blue-950/20 backdrop-blur-xl", glow: "bg-blue-600" },
  angry: { text: "text-red-400", border: "border-red-500/30", accent: "bg-red-600", bgPanel: "bg-red-950/20 backdrop-blur-xl", glow: "bg-red-600" },
  surprised: { text: "text-amber-400", border: "border-amber-500/30", accent: "bg-amber-500", bgPanel: "bg-amber-950/20 backdrop-blur-xl", glow: "bg-amber-500" },
  fearful: { text: "text-purple-400", border: "border-purple-500/30", accent: "bg-purple-600", bgPanel: "bg-purple-950/20 backdrop-blur-xl", glow: "bg-purple-600" },
  disgusted: { text: "text-lime-400", border: "border-lime-500/30", accent: "bg-lime-600", bgPanel: "bg-lime-950/20 backdrop-blur-xl", glow: "bg-lime-600" },
  neutral: { text: "text-zinc-400", border: "border-zinc-500/30", accent: "bg-zinc-500", bgPanel: "bg-zinc-900/40 backdrop-blur-xl", glow: "bg-zinc-600" },
};

export const DEFAULT_THEME: Theme = { text: "text-indigo-400", border: "border-indigo-500/30", accent: "bg-indigo-600", bgPanel: "bg-indigo-950/20 backdrop-blur-xl", glow: "bg-indigo-600" };

export function getTheme(emotion?: string | null): Theme {
  if (!emotion) return DEFAULT_THEME;
  return EMOTION_THEMES[emotion] || DEFAULT_THEME;
}

export const EMOTION_EMOJIS: Record<string, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  surprised: "😲",
  fearful: "😱",
  disgusted: "🤢",
  neutral: "😐",
};

export const MOOD_HISTORY_DURATION_SEC = 60;
export const DEFAULT_FRAME_SKIP = 5;
export const MIN_FRAME_SKIP = 1;
export const MAX_FRAME_SKIP = 10;

/** Path for IP Webcam (Android) snapshot. Base URL is e.g. http://192.168.1.5:8080 */
export const IP_CAMERA_SNAPSHOT_PATH = "/shot.jpg";
/** How often to poll IP camera for a new frame (ms) */
export const IP_CAMERA_POLL_MS = 200;
