# Emotion Detector

**Privacy-first real-time mood detection** — now a **Next.js** app that runs **entirely in your browser**. No Streamlit, no Python server, no cloud. Deploy to **Vercel** in one click.

- **Camera**: Browser webcam **or your phone as an IP camera** (e.g. IP Webcam app)
- **Emotion detection**: [face-api.js](https://github.com/justadudewhohacks/face-api.js) (TensorFlow.js) in the browser — same 7 emotions (happy, sad, angry, surprised, fearful, disgusted, neutral)
- **Privacy**: Blur or emoji overlay on your face
- **Charts**: 60-second mood trend with Recharts
- **Deploy**: Push to GitHub → connect to Vercel → done

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), allow camera access, and click **Start camera**.

## Using your phone as the camera (IP camera)

Use your phone as a remote “sensor” on the same Wi‑Fi:

1. **On your phone:** Install [IP Webcam](https://play.google.com/store/apps/details?id=com.pas.webcam) (Android), start the server, and note the URL (e.g. `http://192.168.1.5:8080`).
2. **Run the app locally** (`npm run dev`) — laptop and phone must be on the **same Wi‑Fi**.
3. In the app: **Settings → Camera source → Phone (IP)**, enter the base URL (e.g. `http://192.168.1.5:8080`), then **Start camera**.

The app polls the phone’s snapshot URL via a small proxy (`/api/camera-proxy`) so the browser can load the image. **IP camera only works when you run the app locally**; on Vercel the server can’t reach your phone.

## Project walkthrough (IoT / explain the stack)

See **[PROJECT.md](./PROJECT.md)** for a full walkthrough: what the project does, how it fits IoT, architecture, where each technology is used, and how to present or explain it.

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Leave defaults (Framework: Next.js) and deploy.

No env vars or server needed. The app is static + client-side; emotion models are in `public/models` and are loaded by the browser.

## Project structure

```
├── app/
│   ├── api/camera-proxy/  # Proxies IP camera snapshot (phone-as-webcam)
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── CameraFeed.tsx   # Webcam + canvas overlay + emotion loop
│   ├── EmotionChart.tsx # 60s mood trend
│   ├── StatsPanel.tsx  # Current emotion + distribution
│   └── Settings.tsx    # Camera source (webcam / IP), frame skip, privacy
├── lib/
│   ├── faceApi.ts       # face-api.js load + detectEmotion()
│   └── constants.ts     # Emotions, colors, emojis
├── public/
│   └── models/          # face-api.js weights (tiny detector + expression)
├── scripts/
│   └── download-models.mjs  # Re-download models if needed
├── package.json
├── next.config.mjs
├── tailwind.config.ts
└── vercel.json
```

## Re-downloading models

Models are committed in `public/models`. If you need to refresh them:

```bash
node scripts/download-models.mjs
```

## Privacy

- All processing runs in **your browser**. No video or frames are sent to any server.
- Camera is only used when you click “Start camera” and is released when you stop.

## Old Python/Streamlit app

The previous Streamlit version is still in this repo (`app.py`, `utils.py`, `config.py`, `requirements.txt`) for reference. The **live app** is the Next.js one above.

---

**Made with Next.js, face-api.js, and Tailwind. Deploy on Vercel.**
