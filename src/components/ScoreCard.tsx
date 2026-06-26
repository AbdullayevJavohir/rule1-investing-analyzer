import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";

interface ScoreCardProps {
  label: string;
  score: number;
  icon: LucideIcon;
  color: string;
  delay?: number;
}

export default function ScoreCard({ label, score, icon: Icon, color, delay = 0 }: ScoreCardProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  const getScoreLabel = (s: number) => {
    if (s >= 9) return "Excellent";
    if (s >= 7) return "Good";
    if (s >= 5) return "Average";
    if (s >= 3) return "Weak";
    return "Poor";
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white/80 backdrop-blur border border-slate-200/60 rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition-shadow"
    >
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="8"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, delay: delay + 0.3, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-slate-900">{score}</span>
          <span className="text-[10px] text-slate-400">/10</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-xs text-slate-400">{getScoreLabel(score)}</span>
    </motion.div>
  );
}
