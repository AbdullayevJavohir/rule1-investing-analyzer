import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal } from "lucide-react";

interface TerminalOverlayProps {
  ticker: string;
  onComplete: () => void;
}

const LOG_MESSAGES = [
  "[SYS] Initializing Rule #1 Analysis Engine...",
  "[SYS] Fetching historical price data...",
  "[SYS] Loading financial statements...",
  "[SYS] Calculating Big Five Numbers CAGR...",
  "[SYS] Evaluating Moat indicators...",
  "[SYS] Analyzing Management quality...",
  "[SYS] Computing Sticker Price & MOS...",
  "[SYS] Running Technical Confirmation Engine...",
  "[SYS] MACD (8,17,9) calculated",
  "[SYS] Stochastic (14,3,3) calculated",
  "[SYS] 9 EMA calculated",
  "[SYS] Generating Wonderful Business Scorecard...",
  "[SYS] Analysis complete!",
];

export default function TerminalOverlay({ ticker, onComplete }: TerminalOverlayProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (currentIndex < LOG_MESSAGES.length) {
      const timer = setTimeout(() => {
        setLogs((prev) => [...prev, LOG_MESSAGES[currentIndex]]);
        setProgress(((currentIndex + 1) / LOG_MESSAGES.length) * 100);
        setCurrentIndex((prev) => prev + 1);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-xl mx-4"
      >
        <div className="bg-[#1a1a2e] rounded-xl shadow-2xl overflow-hidden border border-slate-700">
          <div className="flex items-center gap-2 px-4 py-3 bg-[#16162a] border-b border-slate-700">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex items-center gap-2 ml-4">
              <Terminal className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400 font-mono">
                rule1-analyzer -- {ticker}
              </span>
            </div>
          </div>

          <div className="p-4 h-64 overflow-y-auto font-mono text-sm">
            {logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`mb-1 ${
                  log.includes("complete")
                    ? "text-emerald-400"
                    : log.includes("Error") || log.includes("error")
                    ? "text-red-400"
                    : log.startsWith("[")
                    ? "text-blue-400"
                    : "text-slate-300"
                }`}
              >
                {log}
              </motion.div>
            ))}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-2 h-4 bg-emerald-400 ml-1"
            />
          </div>

          <div className="h-1 bg-slate-700">
            <motion.div className="h-full bg-emerald-500" initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
          </div>

          <div className="px-4 py-2 bg-[#16162a] border-t border-slate-700 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-mono">
              Rule #1 Investing Framework
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
