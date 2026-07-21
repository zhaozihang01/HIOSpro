import type { AnalysisResult } from "@/lib/analysis/types";
import type { StockQuote } from "@/lib/market/types";
import type {
  ResearchReason,
  ResearchRisk,
} from "./types";

export interface RiskEvaluation {
  risk: ResearchRisk;
  score: number;
  atrPercent: number | null;
  reasons: ResearchReason[];
}

function getLatestValue(
  values:
    | Array<{
        time: number;
        value: number;
      }>
    | undefined
): number | null {
  if (!values || values.length === 0) {
    return null;
  }

  return values[values.length - 1].value;
}

export function evaluateRisk(
  analysis: AnalysisResult,
  quote: StockQuote | null
): RiskEvaluation {
  const reasons: ResearchReason[] = [];

  const atr = getLatestValue(
    analysis.atr?.values
  );

  if (
    atr === null ||
    !quote ||
    quote.price <= 0
  ) {
    reasons.push({
      category: "data",
      message:
        "ATR or current price data is unavailable, so risk cannot be fully evaluated.",
      impact: "neutral",
    });

    return {
      risk: "medium",
      score: 50,
      atrPercent: null,
      reasons,
    };
  }

  const atrPercent =
    (atr / quote.price) * 100;

  let risk: ResearchRisk;
  let score: number;

  if (atrPercent < 1.5) {
    risk = "low";
    score = 85;

    reasons.push({
      category: "volatility",
      message:
        "ATR is low relative to the current price, indicating limited volatility.",
      impact: "positive",
    });
  } else if (atrPercent < 3) {
    risk = "medium";
    score = 65;

    reasons.push({
      category: "volatility",
      message:
        "ATR indicates moderate price volatility.",
      impact: "neutral",
    });
  } else if (atrPercent < 5) {
    risk = "high";
    score = 40;

    reasons.push({
      category: "volatility",
      message:
        "ATR is elevated relative to the current price.",
      impact: "negative",
    });
  } else {
    risk = "very_high";
    score = 20;

    reasons.push({
      category: "volatility",
      message:
        "ATR indicates very high price volatility.",
      impact: "negative",
    });
  }

  return {
    risk,
    score,
    atrPercent,
    reasons,
  };
}
