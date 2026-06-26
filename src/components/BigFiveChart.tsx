import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { BigFiveNumbers } from "@contracts/stock";

interface BigFiveChartProps {
  data: BigFiveNumbers;
}

export default function BigFiveChart({ data }: BigFiveChartProps) {
  const chartData = [
    { name: "Revenue Growth", value: Math.round(data.revenueGrowth * 100), raw: data.revenueGrowth },
    { name: "EPS Growth", value: Math.round(data.epsGrowth * 100), raw: data.epsGrowth },
    { name: "Equity Growth", value: Math.round(data.equityGrowth * 100), raw: data.equityGrowth },
    { name: "FCF Growth", value: Math.round(data.freeCashFlowGrowth * 100), raw: data.freeCashFlowGrowth },
    { name: "ROIC", value: Math.round(data.roic * 100), raw: data.roic },
  ];

  const getBarColor = (value: number) => {
    if (value >= 15) return "#10b981";
    if (value >= 10) return "#f59e0b";
    return "#ef4444";
  };

  const getClassification = (value: number) => {
    if (value >= 15) return "Excellent";
    if (value >= 10) return "Good";
    if (value >= 5) return "Average";
    return "Weak";
  };

  return (
    <div className="bg-white/80 backdrop-blur border border-slate-200/60 rounded-xl p-6">
      <div className="hidden md:block h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 12, fill: "#64748b" }} tickFormatter={(v) => `${v}%`} />
            <Tooltip
              formatter={(value: number) => [`${value}%`, "CAGR"]}
              contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="md:hidden space-y-3 mb-6">
        {chartData.map((item, i) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
          >
            <span className="text-sm font-medium text-slate-700">{item.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold" style={{ color: getBarColor(item.value) }}>
                {item.value}%
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: getBarColor(item.value) + "20", color: getBarColor(item.value) }}>
                {getClassification(item.value)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-4 justify-center text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-emerald-500" />
          <span className="text-slate-600">Excellent (&gt;15%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-amber-500" />
          <span className="text-slate-600">Good (10-15%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-red-500" />
          <span className="text-slate-600">Weak (&lt;10%)</span>
        </div>
      </div>
    </div>
  );
}
