"use client";

import { useState, useCallback } from "react";
import { type Theme } from "@/lib/constants";

const MAX_LOGS = 50;

type Props = {
  entries: string[];
  onClear: () => void;
  theme: Theme;
};

export default function DebugPanel({ entries, onClear, theme }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`mt-4 rounded-xl border overflow-hidden transition-colors duration-1000 ${theme.bgPanel} ${theme.border}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-4 py-2 flex items-center justify-between text-left text-sm text-zinc-300 hover:bg-white/5"
      >
        <span className="font-medium">
          Debug log ({entries.length}) — click to {open ? "collapse" : "expand"}
        </span>
        {open ? "▼" : "▶"}
      </button>
      {open && (
        <div className={`p-3 border-t transition-colors duration-1000 ${theme.border}`}>
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onClear}
              className={`text-xs px-2 py-1 rounded transition-colors duration-1000 ${theme.bgPanel} hover:opacity-80 text-white border ${theme.border}`}
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

  const log = useCallback((msg: string) => {
    const line = `[${new Date().toLocaleTimeString()}] ${msg}`;
    console.log("[SentientMirror]", msg);
    setEntries((prev) => [...prev.slice(-(MAX_LOGS - 1)), line]);
  }, []);

  const clear = useCallback(() => setEntries([]), []);

  return { entries, log, clear };
}
