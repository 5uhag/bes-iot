"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { EMOTION_COLORS } from "@/lib/constants";

type MoodEntry = { timestamp: number; emotion: string; confidence: number };

type Props = {
  data: MoodEntry[];
};

const emotionColors: Record<string, string> = {
  ...EMOTION_COLORS,
  surprised: EMOTION_COLORS.surprised ?? "#FF9800",
  fearful: EMOTION_COLORS.fearful ?? "#9C27B0",
  disgusted: EMOTION_COLORS.disgusted ?? "#795548",
};

const EMOTION_KEYS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "surprised",
  "fearful",
  "disgusted",
];

export default function EmotionChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-[280px] rounded-xl bg-mirror-card border border-mirror-border flex items-center justify-center text-zinc-500">
        Collecting mood data… chart will appear shortly.
      </div>
    );
  }

  const start = data[0].timestamp;
  const chartData: Record<string, number | string | null>[] = data.map((d) => {
    const sec = (d.timestamp - start) / 1000;
    const row: Record<string, number | string | null> = {
      sec,
      time: new Date(d.timestamp).toLocaleTimeString(),
    };
    for (const e of EMOTION_KEYS) {
      row[e] = d.emotion === e ? d.confidence : null;
    }
    return row;
  });

  return (
    <div className="h-[280px] rounded-xl bg-mirror-card border border-mirror-border p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
        >
          <XAxis
            dataKey="sec"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={(v) => `${v}s`}
            stroke="#71717a"
            fontSize={11}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#71717a"
            fontSize={11}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{
              background: "#18181c",
              border: "1px solid #27272a",
              borderRadius: "8px",
            }}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { time?: string })?.time ?? ""
            }
          />
          <Legend
            wrapperStyle={{ fontSize: 11 }}
            formatter={(value) => value.charAt(0).toUpperCase() + value.slice(1)}
          />
          {EMOTION_KEYS.map((emotion) => (
            <Line
              key={emotion}
              type="monotone"
              dataKey={emotion}
              name={emotion}
              stroke={emotionColors[emotion] ?? "#71717a"}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
