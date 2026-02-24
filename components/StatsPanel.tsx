"use client";

import { EMOTION_EMOJIS, type Theme } from "@/lib/constants";

type MoodEntry = { timestamp: number; emotion: string; confidence: number };

type EmotionResult = {
  dominant: string;
  scores: Record<string, number>;
};

type Props = {
  current: EmotionResult | null;
  moodHistory: MoodEntry[];
  theme: Theme;
};

export default function StatsPanel({ current, moodHistory, theme }: Props) {
  const dominant = current?.dominant ?? "neutral";
  const confidence = current?.scores?.[dominant] ?? 0;
  const emoji = EMOTION_EMOJIS[dominant] ?? "😐";

  const distribution: Record<string, number> = {};
  for (const e of moodHistory) {
    distribution[e.emotion] = (distribution[e.emotion] ?? 0) + 1;
  }
  const total = moodHistory.length;
  const top3 = Object.entries(distribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className={`rounded-xl border p-4 space-y-4 transition-colors duration-1000 ${theme.bgPanel} ${theme.border}`}>
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-1">Current emotion</h3>
        <p className="text-2xl font-semibold flex items-center gap-2">
          <span>{emoji}</span>
          <span className={`uppercase transition-colors duration-1000 ${theme.text}`}>{dominant}</span>
        </p>
        <p className="text-sm text-zinc-400 mt-0.5">
          Confidence: <strong className="text-zinc-200">{confidence.toFixed(1)}%</strong>
        </p>
      </div>
      <div>
        <h3 className="text-sm font-medium text-zinc-400 mb-2">
          Last 60s distribution
        </h3>
        <ul className="space-y-1.5">
          {top3.map(([emotion, count]) => {
            const pct = total ? ((count / total) * 100).toFixed(1) : "0";
            const e = EMOTION_EMOJIS[emotion] ?? "😐";
            return (
              <li key={emotion} className="flex justify-between text-sm">
                <span>
                  {e} {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                </span>
                <strong className="text-zinc-200">{pct}%</strong>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
