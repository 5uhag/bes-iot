export const EMOTION_COLORS: Record<string, string> = {
  happy: "#4CAF50",
  sad: "#2196F3",
  angry: "#F44336",
  surprised: "#FF9800",
  fearful: "#9C27B0",
  disgusted: "#795548",
  neutral: "#9E9E9E",
};

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
