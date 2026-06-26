import { z } from "zod";

export const BigFiveNumbersSchema = z.object({
  revenueGrowth: z.number(),
  epsGrowth: z.number(),
  equityGrowth: z.number(),
  freeCashFlowGrowth: z.number(),
  roic: z.number(),
});

export const RedFlagSchema = z.object({
  type: z.string(),
  description: z.string(),
  severity: z.enum(["high", "medium", "low"]),
});

export const AnalysisInputSchema = z.object({
  ticker: z.string().min(1).max(20).toUpperCase(),
});

export const AnalysisResultSchema = z.object({
  ticker: z.string(),
  companyName: z.string(),
  meaningScore: z.number().min(0).max(10),
  moatScore: z.number().min(0).max(10),
  managementScore: z.number().min(0).max(10),
  marginOfSafetyScore: z.number().min(0).max(10),
  financialQualityScore: z.number().min(0).max(10),
  predictabilityScore: z.number().min(0).max(10),
  totalScore: z.number().min(0).max(60),
  classification: z.string(),
  recommendation: z.enum(["BUY", "WATCHLIST", "AVOID"]),
  currentPrice: z.number(),
  stickerPrice: z.number(),
  mosPrice: z.number(),
  technicalScore: z.number().nullable(),
  bigFiveNumbers: BigFiveNumbersSchema,
  redFlags: z.array(RedFlagSchema),
  moatSummary: z.string(),
  managementSummary: z.string(),
  meaningAnalysis: z.string(),
  risks: z.array(z.string()),
  financialStrength: z.object({
    grossMargin: z.number(),
    operatingMargin: z.number(),
    netMargin: z.number(),
    roe: z.number(),
    roa: z.number(),
    debtToEquity: z.number(),
    interestCoverage: z.number(),
    freeCashFlow: z.number(),
  }),
});

export const HistoricalPriceSchema = z.object({
  date: z.string(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
  adjClose: z.number(),
});

export const TechnicalIndicatorsSchema = z.object({
  ema9: z.number(),
  macdLine: z.number(),
  signalLine: z.number(),
  histogram: z.number(),
  stochasticK: z.number(),
  stochasticD: z.number(),
  macdSignal: z.enum(["Strong Bullish", "Bullish", "Neutral", "Bearish", "Strong Bearish"]),
  stochasticSignal: z.enum(["Opportunity Zone", "Neutral Zone", "Extended Zone"]),
  emaSignal: z.enum(["Bullish", "Neutral", "Bearish"]),
  technicalScore: z.number(),
  technicalClassification: z.string(),
  lastCrossover: z.string().nullable(),
});

export type BigFiveNumbers = z.infer<typeof BigFiveNumbersSchema>;
export type RedFlag = z.infer<typeof RedFlagSchema>;
export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;
export type HistoricalPrice = z.infer<typeof HistoricalPriceSchema>;
export type TechnicalIndicators = z.infer<typeof TechnicalIndicatorsSchema>;
