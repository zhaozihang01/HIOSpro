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

export type ResearchConfidenceLevel =
  | "high"
  | "medium"
  | "low";

export type SignalAdjustmentReason =
  | "low_confidence"
  | "insufficient_fundamentals";

export interface ResearchScore {
  total: number;
  trend: number;
  momentum: number;
  volatility: number;
  valuation: number;
}

export interface ResearchConfidenceBreakdown {
  quote: number;
  chart: number;
  technical: number;
  fundamentals: number;
}

export interface ResearchConfidence {
  score: number;
  level: ResearchConfidenceLevel;
  breakdown: ResearchConfidenceBreakdown;
  warnings: string[];
}

export interface ResearchSignalAdjustment {
  applied: boolean;
  originalSignal: ResearchSignal;
  finalSignal: ResearchSignal;
  reason: SignalAdjustmentReason | null;
  message: string | null;
}

export interface ResearchReason {
  category:
    | "trend"
    | "momentum"
    | "volatility"
    | "valuation"
    | "data";

  message: string;

  impact:
    | "positive"
    | "neutral"
    | "negative";
}

export interface StockResearchResult {
  symbol: string;

  quote: StockQuote | null;

  fundamentals:
    | StockFundamentals
    | null;

  chart: StockChart;

  analysis: AnalysisResult;

  score: ResearchScore;

  trend: ResearchTrend;

  risk: ResearchRisk;

  signal: ResearchSignal;

  reasons: ResearchReason[];

  confidence?: ResearchConfidence;

  /**
   * 记录最终信号是否受到数据可信度保护。
   * 下一步由 service.ts 正式生成。
   */
  signalAdjustment?: ResearchSignalAdjustment;

  generatedAt: string;
}
