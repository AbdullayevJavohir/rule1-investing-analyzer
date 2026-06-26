import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { trpc } from "@/providers/trpc";
import type { TechnicalIndicators } from "@contracts/stock";

interface TechnicalPanelProps {
  data: TechnicalIndicators;
  ticker: string;
}

export default function TechnicalPanel({ data, ticker }: TechnicalPanelProps) {
  const { data: priceData } = trpc.stock.getHistoricalPrices.useQuery(
    { ticker, period: "6mo" },
    { enabled: !!ticker }
  );

  const chartData = priceData?.map((p: any) => ({
    date: p.date,
    close: p.close,
  })) || [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    if (score >= 20) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/80 backdrop-blur border-slate-200/60">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-500">Technical Confirmation Score</p>
              <p className={`text-3xl font-bold ${getScoreColor(data.technicalScore)}`}>
                {data.technicalScore}/100
              </p>
            </div>
            <Badge className={`${getScoreBg(data.technicalScore)} text-white text-lg px-4 py-2`}>
              {data.technicalClassification}
            </Badge>
          </div>
          <Progress value={data.technicalScore} className="h-3" />
          <p className="text-xs text-slate-400 mt-2">
            Weighted: MACD (40%) + Stochastic (35%) + 9 EMA (25%)
          </p>
        </CardContent>
      </Card>

      {chartData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur border-slate-200/60">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Price Chart with Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} tickFormatter={(val) => { const d = new Date(val); return `${d.getMonth() + 1}/${d.getDate()}`; }} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} domain={["auto", "auto"]} tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]} labelFormatter={(label) => new Date(label).toLocaleDateString()} contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px" }} />
                  <Line type="monotone" dataKey="close" stroke="#2563eb" strokeWidth={2} dot={false} name="Price" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white/80 backdrop-blur border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              MACD (8, 17, 9)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">MACD Line</span>
                <span className="font-semibold">{data.macdLine.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Signal Line</span>
                <span className="font-semibold">{data.signalLine.toFixed(3)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Histogram</span>
                <span className={`font-semibold ${data.histogram > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {data.histogram > 0 ? '+' : ''}{data.histogram.toFixed(3)}
                </span>
              </div>
              <Badge className={data.macdSignal === "Strong Bullish" || data.macdSignal === "Bullish" ? "bg-emerald-500 text-white mt-2" : data.macdSignal === "Strong Bearish" || data.macdSignal === "Bearish" ? "bg-red-500 text-white mt-2" : "bg-slate-500 text-white mt-2"}>
                {data.macdSignal === "Strong Bullish" && <TrendingUp className="w-3 h-3 mr-1" />}
                {data.macdSignal === "Bullish" && <TrendingUp className="w-3 h-3 mr-1" />}
                {data.macdSignal === "Strong Bearish" && <TrendingDown className="w-3 h-3 mr-1" />}
                {data.macdSignal === "Bearish" && <TrendingDown className="w-3 h-3 mr-1" />}
                {data.macdSignal === "Neutral" && <Minus className="w-3 h-3 mr-1" />}
                {data.macdSignal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Activity className="w-4 h-4 text-purple-600" />
              Stochastic (14, 3, 3)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">%K</span>
                <span className="font-semibold">{data.stochasticK.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">%D</span>
                <span className="font-semibold">{data.stochasticD.toFixed(2)}</span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div className={`h-full rounded-full ${data.stochasticK < 20 ? "bg-emerald-500" : data.stochasticK > 80 ? "bg-red-500" : "bg-blue-500"}`} initial={{ width: 0 }} animate={{ width: `${Math.min(data.stochasticK, 100)}%` }} transition={{ duration: 1, delay: 0.5 }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>Oversold (20)</span>
                  <span>Overbought (80)</span>
                </div>
              </div>
              <Badge className={data.stochasticSignal === "Opportunity Zone" ? "bg-emerald-500 text-white mt-2" : data.stochasticSignal === "Extended Zone" ? "bg-red-500 text-white mt-2" : "bg-slate-500 text-white mt-2"}>
                {data.stochasticSignal}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur border-slate-200/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              9 EMA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">9 EMA Value</span>
                <span className="font-semibold">${data.ema9.toFixed(2)}</span>
              </div>
              <Badge className={data.emaSignal === "Bullish" ? "bg-emerald-500 text-white" : data.emaSignal === "Bearish" ? "bg-red-500 text-white" : "bg-slate-500 text-white"}>
                {data.emaSignal === "Bullish" && <TrendingUp className="w-3 h-3 mr-1" />}
                {data.emaSignal === "Bearish" && <TrendingDown className="w-3 h-3 mr-1" />}
                {data.emaSignal === "Neutral" && <Minus className="w-3 h-3 mr-1" />}
                {data.emaSignal}
              </Badge>
              <p className="text-xs text-slate-400 mt-2">
                Price {data.emaSignal === "Bullish" ? "above" : data.emaSignal === "Bearish" ? "below" : "near"} 9 EMA indicates {data.emaSignal.toLowerCase()} short-term momentum
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
