import type { AnalysisResult } from "@/lib/analysis/types";
import type {
  StockChart,
  StockFundamentals,
  StockQuote,
} from "@/lib/market/types";

export type ResearchTrend =
  | "strong_bullish"
  | "bullish"
  | "neutral"
  | "bearish"
  | "strong_bearish";

export type ResearchRisk =
  | "low"
  | "medium"
  | "high"
  | "very_high";

export type ResearchSignal =
  | "strong_buy"
  | "buy"
  | "hold"
  | "sell"
  | "strong_sell";

export interface ResearchScore {
  total: number;
  trend: number;
  momentum: number;
  volatility: number;
  valuation: number;
}

export interface ResearchReason {
  category:
    | "trend"
    | "momentum"
    | "volatility"
    | "valuation"
    | "data";
  message: string;
  impact: "positive" | "neutral" | "negative";
}

export interface StockResearchResult {
  symbol: string;
  quote: StockQuote | null;
  fundamentals: StockFundamentals | null;
  chart: StockChart;
  analysis: AnalysisResult;
  score: ResearchScore;
  trend: ResearchTrend;
  risk: ResearchRisk;
  signal: ResearchSignal;
  reasons: ResearchReason[];
  generatedAt: string;
}
