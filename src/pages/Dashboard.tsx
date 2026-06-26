import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router";
import { Search, TrendingUp, Shield, BarChart3, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const POPULAR_TICKERS = [
  { ticker: "AAPL", name: "Apple Inc." },
  { ticker: "MSFT", name: "Microsoft Corp." },
  { ticker: "GOOGL", name: "Alphabet Inc." },
  { ticker: "AMZN", name: "Amazon.com Inc." },
  { ticker: "TSLA", name: "Tesla Inc." },
  { ticker: "NVDA", name: "NVIDIA Corp." },
  { ticker: "META", name: "Meta Platforms" },
  { ticker: "BRK-B", name: "Berkshire Hathaway" },
  { ticker: "JPM", name: "JPMorgan Chase" },
  { ticker: "V", name: "Visa Inc." },
  { ticker: "WMT", name: "Walmart Inc." },
  { ticker: "JNJ", name: "Johnson & Johnson" },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [recentAnalyses, setRecentAnalyses] = useState<Array<{ ticker: string; date: string }>>([]);

  useEffect(() => {
    const stored = localStorage.getItem("recentAnalyses");
    if (stored) {
      try {
        setRecentAnalyses(JSON.parse(stored));
      } catch { /* ignore */ }
    }
  }, []);

  const filteredTickers = searchQuery.length > 0
    ? POPULAR_TICKERS.filter(
        t =>
          t.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleAnalyze = useCallback((ticker: string) => {
    const newRecent = [{ ticker: ticker.toUpperCase(), date: new Date().toISOString() }, ...recentAnalyses.filter(r => r.ticker !== ticker.toUpperCase())].slice(0, 5);
    setRecentAnalyses(newRecent);
    localStorage.setItem("recentAnalyses", JSON.stringify(newRecent));
    navigate(`/analysis?ticker=${ticker.toUpperCase()}`);
  }, [navigate, recentAnalyses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      handleAnalyze(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">Rule #1 Analyzer</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm font-medium text-blue-600 cursor-pointer">Dashboard</span>
            <span className="text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Screener</span>
            <span className="text-sm font-medium text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">Watchlist</span>
          </nav>
        </div>
      </header>

      <main className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Find Your Next{" "}
              <span className="text-blue-600">Wonderful Business</span>
            </h1>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Analyze any publicly traded company using Phil Town's Rule #1 investing framework.
              Evaluate Meaning, Moat, Management, and Margin of Safety.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-2xl mx-auto mb-16"
          >
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Enter ticker symbol (e.g., AAPL, MSFT, TSLA)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                  className="w-full h-14 pl-12 pr-4 text-lg rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-lg shadow-slate-200/50"
                />
                <Button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </form>

            <AnimatePresence>
              {isFocused && filteredTickers.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-40"
                >
                  {filteredTickers.map((t) => (
                    <button
                      key={t.ticker}
                      onClick={() => handleAnalyze(t.ticker)}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-sm font-bold text-blue-700">{t.ticker}</span>
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{t.name}</p>
                          <p className="text-xs text-slate-500">{t.ticker}</p>
                        </div>
                      </div>
                      <TrendingUp className="w-4 h-4 text-slate-400" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <Card className="bg-white/70 backdrop-blur border-slate-200/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                  <Shield className="w-5 h-5 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">Four M's Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Evaluate Meaning, Moat, Management, and Margin of Safety with detailed scoring for each criterion.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-slate-200/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Big Five Numbers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  Analyze Revenue, EPS, Equity, Free Cash Flow growth, and Return on Invested Capital over 10 years.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-slate-200/60 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Technical Confirmation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-500">
                  9 EMA, MACD (8,17,9), and Stochastic (14,3,3) indicators with weighted scoring engine.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Popular Stocks</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {POPULAR_TICKERS.map((t) => (
                <button
                  key={t.ticker}
                  onClick={() => handleAnalyze(t.ticker)}
                  className="group p-3 bg-white/70 backdrop-blur border border-slate-200/60 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all text-center"
                >
                  <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{t.ticker}</p>
                  <p className="text-xs text-slate-500 truncate">{t.name}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {recentAnalyses.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12"
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Analyses</h2>
              <div className="flex flex-wrap gap-3">
                {recentAnalyses.map((r) => (
                  <button
                    key={r.ticker}
                    onClick={() => handleAnalyze(r.ticker)}
                    className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center gap-2"
                  >
                    <span className="font-semibold text-slate-900">{r.ticker}</span>
                    <span className="text-xs text-slate-400">
                      {new Date(r.date).toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
