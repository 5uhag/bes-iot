# Sentient Mirror OSS

**Privacy-first real-time mood detection** — now a **Next.js** app that runs **entirely in your browser**. No Streamlit, no Python server, no cloud. Deploy to **Vercel** in one click.

- **Camera**: Browser webcam via `getUserMedia`
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

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import your repo.
3. Leave defaults (Framework: Next.js) and deploy.

No env vars or server needed. The app is static + client-side; emotion models are in `public/models` and are loaded by the browser.

## Project structure

```
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── CameraFeed.tsx   # Webcam + canvas overlay + emotion loop
│   ├── EmotionChart.tsx # 60s mood trend
│   ├── StatsPanel.tsx  # Current emotion + distribution
│   └── Settings.tsx    # Frame skip, privacy mode
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
