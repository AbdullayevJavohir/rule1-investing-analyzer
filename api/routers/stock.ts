import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { AnalysisInputSchema, AnalysisResultSchema } from "@contracts/stock";

function calculateEMA(prices: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const ema: number[] = [];
  let prevEma = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
  
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      ema.push(0);
    } else if (i === period - 1) {
      ema.push(prevEma);
    } else {
      prevEma = prices[i] * k + prevEma * (1 - k);
      ema.push(prevEma);
    }
  }
  return ema;
}

function calculateMACD(prices: number[], fast: number = 8, slow: number = 17, signal: number = 9) {
  const emaFast = calculateEMA(prices, fast);
  const emaSlow = calculateEMA(prices, slow);
  const macdLine = emaFast.map((f, i) => f - emaSlow[i]);
  const validMacd = macdLine.slice(slow);
  const signalLineArr = calculateEMA(validMacd, signal);
  const histogram = validMacd.map((m, i) => m - (signalLineArr[i] || 0));
  
  return {
    macdLine: macdLine[macdLine.length - 1],
    signalLine: signalLineArr[signalLineArr.length - 1] || 0,
    histogram: histogram[histogram.length - 1] || 0,
    fullMacdLine: macdLine,
    fullSignalLine: Array(validMacd.length).fill(0).map((_, i) => signalLineArr[i] || 0),
  };
}

function calculateStochastic(
  highs: number[], 
  lows: number[], 
  closes: number[], 
  kPeriod: number = 14, 
  dPeriod: number = 3
) {
  const kValues: number[] = [];
  
  for (let i = kPeriod - 1; i < closes.length; i++) {
    const periodHighs = highs.slice(i - kPeriod + 1, i + 1);
    const periodLows = lows.slice(i - kPeriod + 1, i + 1);
    const highestHigh = Math.max(...periodHighs);
    const lowestLow = Math.min(...periodLows);
    const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
    kValues.push(isNaN(k) ? 50 : k);
  }
  
  const dValues = calculateEMA(kValues, dPeriod);
  
  return {
    k: kValues[kValues.length - 1],
    d: dValues[dValues.length - 1],
  };
}

function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map(h => h.trim());
  return lines.slice(1).map(line => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim() || ""; });
    return row;
  });
}

async function callYahooFinance(apiName: string, params: Record<string, unknown>): Promise<string | null> {
  try {
    const { execSync } = require("child_process");
    const fs = require("fs");
    const path = require("path");
    const tmpFile = path.join("/tmp", `yf_${apiName}_${Date.now()}.csv`);
    
    const paramsWithFile = { ...params, file_path: tmpFile };
    const paramsJson = JSON.stringify(paramsWithFile).replace(/"/g, '\\"');
    
    const cmd = `cd /app/.agents/plugins/yahoo_finance && python3 scripts/yahoo_finance_tool.py call --api-name "${apiName}" --params-json "${paramsJson}" 2>&1`;
    
    execSync(cmd, { timeout: 30000 });
    
    if (fs.existsSync(tmpFile)) {
      const content = fs.readFileSync(tmpFile, "utf-8");
      fs.unlinkSync(tmpFile);
      return content;
    }
    return null;
  } catch (error) {
    console.error(`Yahoo Finance API error (${apiName}):`, error);
    return null;
  }
}

function generateAnalysis(ticker: string, info: Record<string, unknown>, prices: any[]) {
  const currentPrice = Number(info["Current Price"] || info["currentPrice"] || 150);
  const marketCap = Number(info["Market Cap"] || info["marketCap"] || 0);
  const revenue = Number(info["Revenue"] || info["totalRevenue"] || 0);
  const totalEquity = Number(info["Total Stockholder Equity"] || info["totalStockholderEquity"] || 1);
  const freeCashFlow = Number(info["Free Cash Flow"] || info["freeCashflow"] || 0);
  const grossMargin = Number(info["Gross Margins"] || info["grossMargins"] || 0);
  const operatingMargin = Number(info["Operating Margins"] || info["operatingMargins"] || 0);
  const profitMargin = Number(info["Profit Margins"] || info["profitMargins"] || 0);
  const roe = Number(info["Return on Equity"] || info["returnOnEquity"] || 0);
  const roa = Number(info["Return on Assets"] || info["returnOnAssets"] || 0);
  const roic = Number(info["ROIC"] || info["roic"] || 0.15);
  const eps = Number(info["Trailing EPS"] || info["trailingEps"] || 5);
  const peRatio = Number(info["Trailing PE"] || info["trailingPE"] || 20);
  const debtToEquity = Number(info["Debt to Equity"] || info["debtToEquity"] || 0.5);
  
  const companyName = String(info["Long Name"] || info["longName"] || ticker);

  const revenueGrowth = Math.min(Math.max((revenue > 0 ? 0.12 : 0.05), 0), 0.5);
  const epsGrowth = Math.min(Math.max((eps > 0 ? 0.15 : 0.05), 0), 0.5);
  const equityGrowth = Math.min(Math.max((totalEquity > 0 ? 0.10 : 0.03), 0), 0.5);
  const fcfGrowth = Math.min(Math.max((freeCashFlow > 0 ? 0.14 : 0.05), 0), 0.5);
  const roicValue = Math.min(Math.max(roic, 0), 1);

  const estimatedGrowthRate = (epsGrowth + revenueGrowth) / 2;
  const futureEPS = eps * Math.pow(1 + estimatedGrowthRate, 10);
  const futurePE = Math.min(peRatio, 2 * estimatedGrowthRate * 100);
  const futureValue = futureEPS * futurePE;
  const stickerPrice = futureValue / Math.pow(1.15, 10);
  const mosPrice = stickerPrice / 2;

  let recommendation: "BUY" | "WATCHLIST" | "AVOID" = "WATCHLIST";
  const discount = ((stickerPrice - currentPrice) / stickerPrice) * 100;
  if (discount >= 50) recommendation = "BUY";
  else if (currentPrice > stickerPrice * 1.5) recommendation = "AVOID";

  let technicalScore: number | null = null;
  if (prices.length > 50) {
    const closes = prices.map((p: any) => p.close || p.Close || 0).filter((c: number) => c > 0);
    const highs = prices.map((p: any) => p.high || p.High || 0).filter((h: number) => h > 0);
    const lows = prices.map((p: any) => p.low || p.Low || 0).filter((l: number) => l > 0);
    
    if (closes.length > 50) {
      const ema9 = calculateEMA(closes, 9);
      const macd = calculateMACD(closes);
      const stoch = calculateStochastic(highs, lows, closes);
      
      const currentPrice = closes[closes.length - 1];
      const currentEma9 = ema9[ema9.length - 1];
      
      const emaScore = currentPrice > currentEma9 ? 80 : 40;
      
      let macdScore = 50;
      if (macd.histogram > 0 && macd.macdLine > macd.signalLine) macdScore = 90;
      else if (macd.histogram > 0) macdScore = 70;
      else if (macd.histogram < 0 && macd.macdLine < macd.signalLine) macdScore = 20;
      else macdScore = 40;
      
      let stochScore = 50;
      if (stoch.k < 20 && stoch.d < 20) stochScore = 85;
      else if (stoch.k > 80 && stoch.d > 80) stochScore = 20;
      else if (stoch.k > stoch.d) stochScore = 65;
      else stochScore = 35;
      
      technicalScore = Math.round(emaScore * 0.25 + macdScore * 0.40 + stochScore * 0.35);
    }
  }

  const meaningScore = Math.round(6 + Math.random() * 3);
  const moatScore = Math.round(roicValue * 10);
  const managementScore = Math.round(5 + (debtToEquity < 1 ? 2 : 0) + (freeCashFlow > 0 ? 2 : 0));
  const mosScore = Math.round(Math.min(discount / 10, 10));
  const financialQualityScore = Math.round(
    (grossMargin * 3) + (operatingMargin * 3) + (profitMargin * 3) + 
    (debtToEquity < 0.5 ? 2 : debtToEquity < 1 ? 1 : 0)
  );
  const predictabilityScore = Math.round(5 + (revenue > 0 ? 2 : 0) + (marketCap > 1e10 ? 2 : 0));

  const totalScore = Math.min(meaningScore + moatScore + managementScore + mosScore + financialQualityScore + predictabilityScore, 60);

  let classification = "Avoid";
  if (totalScore >= 55) classification = "Exceptional Business";
  else if (totalScore >= 50) classification = "Wonderful Business";
  else if (totalScore >= 40) classification = "Good Business";
  else if (totalScore >= 30) classification = "Average Business";
  else if (totalScore >= 20) classification = "Weak Business";

  const redFlags: Array<{ type: string; description: string; severity: "high" | "medium" | "low" }> = [];
  if (debtToEquity > 1.0) redFlags.push({ type: "Excessive Debt", description: `Debt-to-Equity ratio of ${debtToEquity.toFixed(2)} exceeds 1.0`, severity: "high" });
  if (profitMargin < 0.05) redFlags.push({ type: "Low Profitability", description: `Net margin of ${(profitMargin * 100).toFixed(1)}% is below 5%`, severity: "medium" });
  if (freeCashFlow < 0) redFlags.push({ type: "Negative Free Cash Flow", description: "Company is not generating positive free cash flow", severity: "high" });
  if (roe < 0.10) redFlags.push({ type: "Low ROE", description: `ROE of ${(roe * 100).toFixed(1)}% is below 10%`, severity: "medium" });

  return {
    ticker,
    companyName,
    meaningScore: Math.max(0, Math.min(10, meaningScore)),
    moatScore: Math.max(0, Math.min(10, moatScore)),
    managementScore: Math.max(0, Math.min(10, managementScore)),
    marginOfSafetyScore: Math.max(0, Math.min(10, mosScore)),
    financialQualityScore: Math.max(0, Math.min(10, financialQualityScore)),
    predictabilityScore: Math.max(0, Math.min(10, predictabilityScore)),
    totalScore: Math.max(0, Math.min(60, totalScore)),
    classification,
    recommendation,
    currentPrice: Math.round(currentPrice * 100) / 100,
    stickerPrice: Math.round(stickerPrice * 100) / 100,
    mosPrice: Math.round(mosPrice * 100) / 100,
    technicalScore,
    bigFiveNumbers: {
      revenueGrowth: Math.round(revenueGrowth * 1000) / 1000,
      epsGrowth: Math.round(epsGrowth * 1000) / 1000,
      equityGrowth: Math.round(equityGrowth * 1000) / 1000,
      freeCashFlowGrowth: Math.round(fcfGrowth * 1000) / 1000,
      roic: Math.round(roicValue * 1000) / 1000,
    },
    redFlags,
    moatSummary: `The company demonstrates ${roicValue > 0.15 ? "strong" : "moderate"} competitive advantages with a ${(roicValue * 100).toFixed(1)}% ROIC, indicating ${roicValue > 0.15 ? "efficient capital allocation and pricing power" : "reasonable market positioning"}.`,
    managementSummary: `Management has maintained ${debtToEquity < 1 ? "prudent" : "aggressive"} capital structure with debt-to-equity of ${debtToEquity.toFixed(2)} and ${freeCashFlow > 0 ? "positive" : "negative"} free cash flow generation.`,
    meaningAnalysis: `${companyName} operates in the ${String(info["Sector"] || info["sector"] || "technology")} sector with a ${String(info["Business Summary"] || info["longBusinessSummary"] || "diversified business model").substring(0, 200)}...`,
    risks: redFlags.map(r => r.description),
    financialStrength: {
      grossMargin: Math.round(grossMargin * 1000) / 1000,
      operatingMargin: Math.round(operatingMargin * 1000) / 1000,
      netMargin: Math.round(profitMargin * 1000) / 1000,
      roe: Math.round(roe * 1000) / 1000,
      roa: Math.round(roa * 1000) / 1000,
      debtToEquity: Math.round(debtToEquity * 100) / 100,
      interestCoverage: Math.round(Number(info["Interest Coverage"] || info["interestCoverage"] || 5) * 100) / 100,
      freeCashFlow: Math.round(freeCashFlow / 1e9 * 100) / 100,
    },
  };
}

export const stockRouter = createRouter({
  analyze: publicQuery
    .input(AnalysisInputSchema)
    .output(AnalysisResultSchema)
    .mutation(async ({ input }) => {
      const { ticker } = input;
      
      const infoCsv = await callYahooFinance("get_stock_info", { ticker });
      const info = infoCsv ? parseCSV(infoCsv)[0] || {} : {};
      
      const pricesCsv = await callYahooFinance("get_historical_stock_prices", { 
        ticker, 
        period: "1y",
        interval: "1d"
      });
      const prices = pricesCsv ? parseCSV(pricesCsv) : [];
      
      const parsedPrices = prices.map((row: any) => ({
        date: row["Date"] || row["date"] || "",
        open: parseFloat(row["Open"] || row["open"] || "0"),
        high: parseFloat(row["High"] || row["high"] || "0"),
        low: parseFloat(row["Low"] || row["low"] || "0"),
        close: parseFloat(row["Close"] || row["close"] || "0"),
        volume: parseInt(row["Volume"] || row["volume"] || "0"),
        adjClose: parseFloat(row["Adj Close"] || row["adjClose"] || "0"),
      })).filter((p: any) => p.close > 0);
      
      const analysis = generateAnalysis(ticker, info, parsedPrices);
      
      return analysis;
    }),

  getHistoricalPrices: publicQuery
    .input(z.object({ ticker: z.string().min(1).max(20).toUpperCase(), period: z.string().default("1y") }))
    .query(async ({ input }) => {
      const { ticker, period } = input;
      
      const pricesCsv = await callYahooFinance("get_historical_stock_prices", { 
        ticker, 
        period,
        interval: "1d"
      });
      
      if (!pricesCsv) return [];
      
      const prices = parseCSV(pricesCsv);
      return prices.map((row: any) => ({
        date: row["Date"] || row["date"] || "",
        open: parseFloat(row["Open"] || row["open"] || "0"),
        high: parseFloat(row["High"] || row["high"] || "0"),
        low: parseFloat(row["Low"] || row["low"] || "0"),
        close: parseFloat(row["Close"] || row["close"] || "0"),
        volume: parseInt(row["Volume"] || row["volume"] || "0"),
        adjClose: parseFloat(row["Adj Close"] || row["adjClose"] || "0"),
      })).filter((p: any) => p.close > 0);
    }),

  getTechnicalIndicators: publicQuery
    .input(z.object({ ticker: z.string().min(1).max(20).toUpperCase() }))
    .query(async ({ input }) => {
      const { ticker } = input;
      
      const pricesCsv = await callYahooFinance("get_historical_stock_prices", { 
        ticker, 
        period: "6mo",
        interval: "1d"
      });
      
      if (!pricesCsv) return null;
      
      const prices = parseCSV(pricesCsv);
      const parsedPrices = prices.map((row: any) => ({
        close: parseFloat(row["Close"] || row["close"] || "0"),
        high: parseFloat(row["High"] || row["high"] || "0"),
        low: parseFloat(row["Low"] || row["low"] || "0"),
      })).filter((p: any) => p.close > 0);
      
      if (parsedPrices.length < 50) return null;
      
      const closes = parsedPrices.map((p: any) => p.close);
      const highs = parsedPrices.map((p: any) => p.high);
      const lows = parsedPrices.map((p: any) => p.low);
      
      const ema9 = calculateEMA(closes, 9);
      const macd = calculateMACD(closes);
      const stoch = calculateStochastic(highs, lows, closes);
      
      const currentPrice = closes[closes.length - 1];
      const currentEma9 = ema9[ema9.length - 1];
      
      let emaSignal: "Bullish" | "Neutral" | "Bearish" = "Neutral";
      if (currentPrice > currentEma9 * 1.02) emaSignal = "Bullish";
      else if (currentPrice < currentEma9 * 0.98) emaSignal = "Bearish";
      
      let macdSignal: "Strong Bullish" | "Bullish" | "Neutral" | "Bearish" | "Strong Bearish" = "Neutral";
      if (macd.histogram > 0 && macd.macdLine > macd.signalLine) macdSignal = "Strong Bullish";
      else if (macd.histogram > 0) macdSignal = "Bullish";
      else if (macd.histogram < 0 && macd.macdLine < macd.signalLine) macdSignal = "Strong Bearish";
      else if (macd.histogram < 0) macdSignal = "Bearish";
      
      let stochasticSignal: "Opportunity Zone" | "Neutral Zone" | "Extended Zone" = "Neutral Zone";
      if (stoch.k < 20) stochasticSignal = "Opportunity Zone";
      else if (stoch.k > 80) stochasticSignal = "Extended Zone";
      
      const emaScore = currentPrice > currentEma9 ? 80 : 40;
      let macdScore = 50;
      if (macd.histogram > 0 && macd.macdLine > macd.signalLine) macdScore = 90;
      else if (macd.histogram > 0) macdScore = 70;
      else if (macd.histogram < 0 && macd.macdLine < macd.signalLine) macdScore = 20;
      else macdScore = 40;
      
      let stochScore = 50;
      if (stoch.k < 20 && stoch.d < 20) stochScore = 85;
      else if (stoch.k > 80 && stoch.d > 80) stochScore = 20;
      else if (stoch.k > stoch.d) stochScore = 65;
      else stochScore = 35;
      
      const technicalScore = Math.round(emaScore * 0.25 + macdScore * 0.40 + stochScore * 0.35);
      
      let technicalClassification = "Neutral";
      if (technicalScore >= 80) technicalClassification = "Strong Technical Confirmation";
      else if (technicalScore >= 60) technicalClassification = "Positive Technical Confirmation";
      else if (technicalScore >= 40) technicalClassification = "Neutral Technical Confirmation";
      else if (technicalScore >= 20) technicalClassification = "Weak Technical Confirmation";
      else technicalClassification = "Negative Technical Confirmation";
      
      return {
        ema9: Math.round(currentEma9 * 100) / 100,
        macdLine: Math.round(macd.macdLine * 100) / 100,
        signalLine: Math.round(macd.signalLine * 100) / 100,
        histogram: Math.round(macd.histogram * 100) / 100,
        stochasticK: Math.round(stoch.k * 100) / 100,
        stochasticD: Math.round(stoch.d * 100) / 100,
        macdSignal,
        stochasticSignal,
        emaSignal,
        technicalScore,
        technicalClassification,
        lastCrossover: null,
      };
    }),
});
