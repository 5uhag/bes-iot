"use client";

import { useState } from "react";

const MAX_LOGS = 50;

type Props = {
  entries: string[];
  onClear: () => void;
};

export default function DebugPanel({ entries, onClear }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-4 rounded-xl border border-amber-500/30 bg-black/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between text-left text-sm text-amber-200 hover:bg-amber-500/10"
      >
        <span className="font-medium">
          Debug log ({entries.length}) — click to {open ? "collapse" : "expand"}
        </span>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <div className="p-3 border-t border-amber-500/20">
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onClear}
              className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-200 hover:bg-amber-500/30"
            >
              Clear
            </button>
          </div>
          <pre className="text-xs text-zinc-300 font-mono max-h-60 overflow-y-auto whitespace-pre-wrap break-words">
            {entries.length === 0
              ? "No logs yet. Start the camera to see flow."
              : entries.join("\n")}
          </pre>
        </div>
      )}
    </div>
  );
}

export function useDebugLog() {
  const [entries, setEntries] = useState<string[]>([]);

  const log = (msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log("[SentientMirror]", msg);
    setEntries((prev) => [...prev.slice(-(MAX_LOGS - 1)), line]);
  };

  const clear = () => setEntries([]);

  return { entries, log, clear };
}
