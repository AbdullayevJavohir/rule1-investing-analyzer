import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Shield, Target, Users, Calculator, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { trpc } from "@/providers/trpc";
import ScoreCard from "@/components/ScoreCard";
import BigFiveChart from "@/components/BigFiveChart";
import TechnicalPanel from "@/components/TechnicalPanel";
import TerminalOverlay from "@/components/TerminalOverlay";
import type { AnalysisResult, RedFlag } from "@contracts/stock";

export default function Analysis() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const ticker = searchParams.get("ticker")?.toUpperCase() || "";
  const [showTerminal, setShowTerminal] = useState(true);
  const [expandedFlags, setExpandedFlags] = useState<Set<number>>(new Set());

  const analyzeMutation = trpc.stock.analyze.useMutation({
    onError: (_err) => {
      toast.error("Analysis Error: " + (_err.message || "Unknown error"));
      setShowTerminal(false);
    },
  });
  const { data: technicalData } = trpc.stock.getTechnicalIndicators.useQuery(
    { ticker },
    { enabled: !!ticker && !showTerminal }
  );

  useEffect(() => {
    if (ticker) {
      setShowTerminal(true);
      analyzeMutation.mutate({ ticker });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticker]);

  const handleTerminalComplete = () => {
    setShowTerminal(false);
  };

  const analysis = analyzeMutation.data as AnalysisResult | undefined;

  const scoreCardData = useMemo(() => {
    if (!analysis) return [];
    return [
      { label: "Meaning", score: analysis.meaningScore, icon: Target, color: "#3b82f6" },
      { label: "Moat", score: analysis.moatScore, icon: Shield, color: "#10b981" },
      { label: "Management", score: analysis.managementScore, icon: Users, color: "#8b5cf6" },
      { label: "MOS", score: analysis.marginOfSafetyScore, icon: Calculator, color: "#f59e0b" },
    ];
  }, [analysis]);

  const getScoreColor = (score: number) => {
    if (score >= 55) return "bg-amber-500 text-white";
    if (score >= 50) return "bg-emerald-500 text-white";
    if (score >= 40) return "bg-blue-500 text-white";
    if (score >= 30) return "bg-yellow-500 text-white";
    if (score >= 20) return "bg-orange-500 text-white";
    return "bg-red-500 text-white";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 55) return "Exceptional Business";
    if (score >= 50) return "Wonderful Business";
    if (score >= 40) return "Good Business";
    if (score >= 30) return "Average Business";
    if (score >= 20) return "Weak Business";
    return "Avoid";
  };

  const getRecommendationColor = (rec: string) => {
    if (rec === "BUY") return "bg-emerald-500 text-white";
    if (rec === "AVOID") return "bg-red-500 text-white";
    return "bg-amber-500 text-white";
  };

  const getRecommendationIcon = (rec: string) => {
    if (rec === "BUY") return <TrendingUp className="w-5 h-5" />;
    if (rec === "AVOID") return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const toggleFlag = (index: number) => {
    setExpandedFlags(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      <AnimatePresence>
        {showTerminal && (
          <TerminalOverlay
            ticker={ticker}
            onComplete={handleTerminalComplete}
          />
        )}
      </AnimatePresence>

      <header className="w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 fixed top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900">Rule #1 Analyzer</span>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          {analyzeMutation.isPending && (
            <div className="space-y-6">
              <Skeleton className="h-12 w-64" />
              <Skeleton className="h-64 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          )}

          {analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-slate-900">{analysis.ticker}</h1>
                  <Badge className={`${getRecommendationColor(analysis.recommendation)} text-sm px-3 py-1`}>
                    {getRecommendationIcon(analysis.recommendation)}
                    <span className="ml-1">{analysis.recommendation}</span>
                  </Badge>
                </div>
                <p className="text-lg text-slate-600">{analysis.companyName}</p>
              </div>

              <Card className="mb-8 bg-white/80 backdrop-blur border-slate-200/60">
                <CardContent className="pt-6">
                  <p className="text-slate-700 leading-relaxed">{analysis.meaningAnalysis}</p>
                  <div className="mt-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Current Price:</span>
                      <span className="text-lg font-bold text-slate-900">${analysis.currentPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">Sticker Price:</span>
                      <span className="text-lg font-bold text-blue-600">${analysis.stickerPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">MOS Price (50%):</span>
                      <span className="text-lg font-bold text-emerald-600">${analysis.mosPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">The Four M's Scorecard</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {scoreCardData.map((card, i) => (
                    <ScoreCard
                      key={card.label}
                      label={card.label}
                      score={card.score}
                      icon={card.icon}
                      color={card.color}
                      delay={i * 0.15}
                    />
                  ))}
                </div>

                <Card className="bg-white/80 backdrop-blur border-slate-200/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-slate-500">Wonderful Business Score</p>
                        <p className={`text-3xl font-bold ${analysis.totalScore >= 40 ? 'text-emerald-600' : analysis.totalScore >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {analysis.totalScore}/60
                        </p>
                      </div>
                      <Badge className={`${getScoreColor(analysis.totalScore)} text-lg px-4 py-2`}>
                        {getScoreLabel(analysis.totalScore)}
                      </Badge>
                    </div>
                    <Progress
                      value={(analysis.totalScore / 60) * 100}
                      className="h-3"
                    />
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Big Five Numbers (10-Year CAGR)</h2>
                <BigFiveChart data={analysis.bigFiveNumbers} />
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Sticker Price Calculation</h2>
                <Card className="bg-white/80 backdrop-blur border-slate-200/60">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="text-center p-4 bg-slate-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Current Price</p>
                        <p className="text-2xl font-bold text-slate-900">${analysis.currentPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">Sticker Price</p>
                        <p className="text-2xl font-bold text-blue-600">${analysis.stickerPrice.toFixed(2)}</p>
                      </div>
                      <div className="text-center p-4 bg-emerald-50 rounded-xl">
                        <p className="text-sm text-slate-500 mb-1">MOS Price (50%)</p>
                        <p className="text-2xl font-bold text-emerald-600">${analysis.mosPrice.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="mt-4 text-center">
                      {analysis.currentPrice <= analysis.mosPrice ? (
                        <Badge className="bg-emerald-500 text-white px-4 py-2">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          Current Price is at or below MOS - Potential BUY
                        </Badge>
                      ) : analysis.currentPrice > analysis.stickerPrice ? (
                        <Badge className="bg-red-500 text-white px-4 py-2">
                          <TrendingDown className="w-4 h-4 mr-1" />
                          Current Price exceeds Sticker Price - AVOID
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500 text-white px-4 py-2">
                          <Minus className="w-4 h-4 mr-1" />
                          Current Price between MOS and Sticker - WATCHLIST
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="bg-white/80 backdrop-blur border-slate-200/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-600" />
                      Moat Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 text-sm leading-relaxed">{analysis.moatSummary}</p>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">Moat Strength</p>
                      <Progress value={analysis.moatScore * 10} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">{analysis.moatScore}/10</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur border-slate-200/60">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-purple-600" />
                      Management Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 text-sm leading-relaxed">{analysis.managementSummary}</p>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">Management Quality</p>
                      <Progress value={analysis.managementScore * 10} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">{analysis.managementScore}/10</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Financial Strength</h2>
                <Card className="bg-white/80 backdrop-blur border-slate-200/60">
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Gross Margin", value: `${(analysis.financialStrength.grossMargin * 100).toFixed(1)}%`, color: analysis.financialStrength.grossMargin > 0.4 ? 'text-emerald-600' : analysis.financialStrength.grossMargin > 0.2 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "Operating Margin", value: `${(analysis.financialStrength.operatingMargin * 100).toFixed(1)}%`, color: analysis.financialStrength.operatingMargin > 0.2 ? 'text-emerald-600' : analysis.financialStrength.operatingMargin > 0.1 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "Net Margin", value: `${(analysis.financialStrength.netMargin * 100).toFixed(1)}%`, color: analysis.financialStrength.netMargin > 0.15 ? 'text-emerald-600' : analysis.financialStrength.netMargin > 0.08 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "ROE", value: `${(analysis.financialStrength.roe * 100).toFixed(1)}%`, color: analysis.financialStrength.roe > 0.2 ? 'text-emerald-600' : analysis.financialStrength.roe > 0.1 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "ROA", value: `${(analysis.financialStrength.roa * 100).toFixed(1)}%`, color: analysis.financialStrength.roa > 0.1 ? 'text-emerald-600' : analysis.financialStrength.roa > 0.05 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "Debt/Equity", value: analysis.financialStrength.debtToEquity.toFixed(2), color: analysis.financialStrength.debtToEquity < 0.5 ? 'text-emerald-600' : analysis.financialStrength.debtToEquity < 1 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "Interest Coverage", value: analysis.financialStrength.interestCoverage.toFixed(1) + 'x', color: analysis.financialStrength.interestCoverage > 5 ? 'text-emerald-600' : analysis.financialStrength.interestCoverage > 2 ? 'text-yellow-600' : 'text-red-600' },
                        { label: "Free Cash Flow", value: `$${analysis.financialStrength.freeCashFlow.toFixed(1)}B`, color: analysis.financialStrength.freeCashFlow > 0 ? 'text-emerald-600' : 'text-red-600' },
                      ].map((item) => (
                        <div key={item.label} className="p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500">{item.label}</p>
                          <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {analysis.totalScore >= 40 && technicalData && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Technical Confirmation</h2>
                  <TechnicalPanel data={technicalData} ticker={ticker} />
                </div>
              )}

              {analysis.totalScore < 40 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Technical Confirmation</h2>
                  <Card className="bg-slate-50 border-slate-200">
                    <CardContent className="pt-6 text-center py-12">
                      <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">
                        Technical confirmation unavailable because company does not qualify as a wonderful business.
                      </p>
                      <p className="text-sm text-slate-400 mt-1">
                        Wonderful Business Score must be >= 40 (current: {analysis.totalScore})
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {analysis.redFlags.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    Red Flags ({analysis.redFlags.length})
                  </h2>
                  <div className="space-y-2">
                    {analysis.redFlags.map((flag: RedFlag, i: number) => (
                      <Card key={i} className="bg-white/80 backdrop-blur border-slate-200/60 overflow-hidden">
                        <button
                          onClick={() => toggleFlag(i)}
                          className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              className={
                                flag.severity === "high"
                                  ? "bg-red-500 text-white"
                                  : flag.severity === "medium"
                                  ? "bg-yellow-500 text-white"
                                  : "bg-blue-500 text-white"
                              }
                            >
                              {flag.severity.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-slate-900">{flag.type}</span>
                          </div>
                          {expandedFlags.has(i) ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFlags.has(i) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CardContent className="pt-0 pb-4">
                                <p className="text-sm text-slate-600">{flag.description}</p>
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {analysis.redFlags.length === 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    Red Flags
                  </h2>
                  <Card className="bg-emerald-50 border-emerald-200">
                    <CardContent className="pt-6 text-center py-8">
                      <p className="text-emerald-700 font-medium">No significant red flags detected!</p>
                      <p className="text-sm text-emerald-600 mt-1">
                        This company appears financially healthy based on Rule #1 criteria.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
