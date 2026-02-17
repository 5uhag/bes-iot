# Sentient Mirror OSS — IoT Project Walkthrough

Use this as a **cheat sheet** when you present or explain the project (e.g. for a course, demo, or report).

---

## 1. What is this project?

**Sentient Mirror** is a **privacy-first, real-time mood (emotion) detector**. It uses a camera as the “sensor,” runs **face and emotion AI entirely in the browser** (on your device), and shows live feedback plus a 60-second mood trend. No cloud, no uploads — it fits an **IoT / edge** style setup where the “smart” processing happens on the user’s device.

- **Input:** Video from a webcam or from your **phone used as an IP camera**.
- **Output:** Live emotion label (happy, sad, angry, etc.), confidence, and a 60s mood chart.

So in IoT terms: **camera = sensor**, **browser = edge device**, **ML in the browser = edge intelligence**.

---

## 2. How does it fit “IoT”?

| IoT idea | In this project |
|----------|------------------|
| **Sensors** | Camera (laptop webcam or phone as IP camera) |
| **Edge processing** | All processing in the **browser** (no server doing the AI) |
| **Local-first / privacy** | No video or frames sent to the cloud |
| **Optional remote “sensor”** | Phone running IP Webcam app = remote camera over Wi‑Fi |

You can say: *“We have a camera as the sensor; the edge is the user’s browser; the ‘brain’ is a small neural net (face-api.js) that runs locally for emotion detection.”*

---

## 3. High-level architecture (for explaining)

```
┌─────────────────────────────────────────────────────────────────┐
│  USER DEVICE (laptop / desktop)                                  │
│  ┌─────────────┐     ┌──────────────────┐     ┌───────────────┐  │
│  │  Camera     │────▶│  Browser         │────▶│  UI           │  │
│  │  (Webcam or │     │  • Next.js app   │     │  • Live feed  │  │
│  │   IP cam)   │     │  • face-api.js   │     │  • Chart      │  │
│  └─────────────┘     │  • TensorFlow.js│     │  • Stats       │  │
│         ▲            └──────────────────┘     └───────────────┘  │
│         │                     │                                 │
│  Optional: phone on same Wi‑Fi (IP Webcam app)                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Camera:** Either built-in/webcam (browser `getUserMedia`) or **phone as IP camera** (app streams JPEG snapshots; our app polls them).
- **Browser:** Runs the Next.js app, loads the camera feed, runs face + expression models (face-api.js), and draws the UI.
- **No server for AI:** Emotion detection runs in the client. Optional server use: **Vercel** hosts the static app and one small **proxy** so the browser can load the phone’s snapshot URL without CORS/mixed-content issues when you run the app locally.

---

## 4. Where is each technology used?

| Thing | Where it’s used | What it does |
|-------|------------------|---------------|
| **Next.js** | `app/`, `components/` | Front-end app: pages, routing, layout. Deploys to Vercel. |
| **React** | All UI under `app/`, `components/` | Components for camera feed, chart, stats, settings. |
| **Tailwind CSS** | `app/globals.css`, `tailwind.config.ts`, class names in components | Styling (dark theme, layout, buttons). |
| **face-api.js** | `lib/faceApi.ts`, loaded in `CameraFeed` | Face detection + **emotion** (expression) model in the browser. |
| **TensorFlow.js** | Inside face-api.js | Backend for running the neural nets in the browser. |
| **Recharts** | `components/EmotionChart.tsx` | 60-second mood trend (line chart). |
| **getUserMedia** | `CameraFeed.tsx` (webcam path) | Access to laptop/desktop camera. |
| **IP camera / Phone** | Settings → “Phone (IP)”, `app/api/camera-proxy/` | Use phone as remote camera: app polls snapshot URL; proxy fetches it so the browser can use it. |

---

## 5. Main files and folders (what lives where)

| Path | Purpose |
|------|--------|
| **`app/page.tsx`** | Main screen: state (camera on/off, emotion, mood history, settings), layout, and which components to show. |
| **`app/layout.tsx`** | Root layout (font, metadata, dark theme). |
| **`app/api/camera-proxy/route.ts`** | API route that fetches the **IP camera snapshot URL** (e.g. phone) and returns the image. Used so the browser loads “our” URL instead of the phone’s (avoids CORS/mixed content when running locally). |
| **`components/CameraFeed.tsx`** | Camera + AI + overlay. Chooses **webcam** vs **IP camera**; for webcam uses `getUserMedia` + video; for IP camera uses polling + `<img>` + canvas. Runs face-api.js on the current frame and draws emotion + privacy (blur/emoji). |
| **`components/EmotionChart.tsx`** | Recharts line chart for last 60 seconds of mood (one line per emotion). |
| **`components/StatsPanel.tsx`** | Current emotion + confidence and last-60s distribution. |
| **`components/Settings.tsx`** | Camera source (Webcam / Phone (IP)), IP URL, frame skip, privacy mode (blur/emoji). |
| **`lib/faceApi.ts`** | Loads face-api.js models (tiny face detector + expression net), runs **detectEmotion** on video or canvas. |
| **`lib/constants.ts`** | Emotion labels, colors, emojis, frame skip limits, IP camera snapshot path and poll interval. |
| **`public/models/`** | face-api.js model files (tiny face detector + expression). Loaded by the browser from `/models`. |

---

## 6. Data flow (for “how it works”)

1. **User** chooses camera: **Webcam** or **Phone (IP)** and, for IP, enters the base URL (e.g. `http://192.168.1.5:8080`).
2. **Camera feed**
   - **Webcam:** Browser gets stream via `getUserMedia` → `<video>` → each frame (or every Nth for performance) is passed to face-api.js.
   - **IP camera:** App polls snapshot (e.g. `.../shot.jpg`) via the **camera-proxy** API → image drawn to **canvas** → face-api.js runs on that canvas.
3. **face-api.js** (in `lib/faceApi.ts`) runs:
   - Face detection (TinyFaceDetector),
   - Then expression net → 7 emotions + confidence scores.
4. **Result** is sent up to `page.tsx` (e.g. `setEmotion`, `setMoodHistory`).
5. **UI** updates: overlay on video/canvas, **StatsPanel** (current emotion + distribution), **EmotionChart** (60s trend).

So: **Camera → frame (video or canvas) → face-api.js → emotion result → React state → UI.**

---

## 7. Using the phone as a webcam (IP camera)

- **Why:** Demo “remote sensor”: the **phone is the camera**, laptop is the “edge” that runs the app and the AI.
- **Steps:**
  1. On the **phone:** Install an app that turns the camera into an IP camera (e.g. **IP Webcam** on Android). Start the server and note the URL (e.g. `http://192.168.1.5:8080`).
  2. **Laptop and phone** on the **same Wi‑Fi**.
  3. **Run the app locally:** `npm run dev` (so the proxy runs on your machine and can reach the phone).
  4. In the app: **Settings → Camera source → Phone (IP)**, enter the base URL (e.g. `http://192.168.1.5:8080`), then **Start camera**.
- **Under the hood:** The app requests snapshots from `http://.../shot.jpg`. Because that’s another origin (or HTTP when the app is HTTPS), we use **`/api/camera-proxy?url=...`** so the browser loads the image from our origin. The proxy runs on the same machine as the dev server, so it can reach the phone on the local network. **On Vercel**, the server is in the cloud and cannot see your phone, so “Phone (IP)” only works when you run the app **locally**.

---

## 8. How to present it (short script)

1. **One-liner:** *“This is an IoT-style mood detector: the camera is the sensor, and all the AI runs in the browser on your device, so nothing is sent to the cloud.”*
2. **Demo:** Turn on the camera (webcam or phone), show the live emotion label and the 60s chart. Optionally show Settings (frame skip, privacy blur/emoji, and if you use the phone, the IP camera option).
3. **Tech:** *“Front-end is Next.js and React; emotion detection is face-api.js with TensorFlow.js in the browser; we can use either the laptop webcam or the phone as an IP camera over Wi‑Fi.”*
4. **IoT angle:** *“The ‘thing’ is the camera; the edge is the browser; we added support for the phone as a remote camera to show a simple IoT sensor setup.”*

---

## 9. Quick reference: emotions and stack

**Emotions detected:** neutral, happy, sad, angry, surprised, fearful, disgusted.

**Stack:** Next.js 14, React 18, TypeScript, Tailwind, face-api.js, TensorFlow.js (via face-api), Recharts. Optional: phone + IP Webcam app for “phone as webcam.”

You can point to **PROJECT.md** (this file) and **README.md** (setup, run, deploy) when someone asks “what is this and how do I run it?”
