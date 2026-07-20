import type { AnalysisResult } from "@/lib/analysis/types";
import type { ResearchReason, ResearchTrend } from "./types";

export interface TrendEvaluation {
  trend: ResearchTrend;
  score: number;
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

export function evaluateTrend(
  analysis: AnalysisResult
): TrendEvaluation {
  let score = 50;

  const reasons: ResearchReason[] = [];

  const ma20 = getLatestValue(
    analysis.ma?.[20]?.values
  );

  const ma60 = getLatestValue(
    analysis.ma?.[60]?.values
  );

  const macd = getLatestValue(
    analysis.macd?.macd.values
  );

  const signal = getLatestValue(
    analysis.macd?.signal.values
  );

  const histogram = getLatestValue(
    analysis.macd?.histogram.values
  );

  const rsi = getLatestValue(
    analysis.rsi?.values
  );

  if (ma20 !== null && ma60 !== null) {
    if (ma20 > ma60) {
      score += 20;

      reasons.push({
        category: "trend",
        message: "MA20 is above MA60, indicating an upward trend.",
        impact: "positive",
      });
    } else if (ma20 < ma60) {
      score -= 20;

      reasons.push({
        category: "trend",
        message: "MA20 is below MA60, indicating a downward trend.",
        impact: "negative",
      });
    }
  }

  if (macd !== null && signal !== null) {
    if (macd > signal) {
      score += 15;

      reasons.push({
        category: "momentum",
        message: "MACD is above the signal line.",
        impact: "positive",
      });
    } else if (macd < signal) {
      score -= 15;

      reasons.push({
        category: "momentum",
        message: "MACD is below the signal line.",
        impact: "negative",
      });
    }
  }

  if (histogram !== null) {
    if (histogram > 0) {
      score += 5;

      reasons.push({
        category: "momentum",
        message: "MACD histogram is positive.",
        impact: "positive",
      });
    } else if (histogram < 0) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message: "MACD histogram is negative.",
        impact: "negative",
      });
    }
  }

  if (rsi !== null) {
    if (rsi >= 50 && rsi < 70) {
      score += 10;

      reasons.push({
        category: "momentum",
        message: "RSI shows healthy bullish momentum.",
        impact: "positive",
      });
    } else if (rsi >= 70) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message: "RSI indicates an overbought condition.",
        impact: "negative",
      });
    } else if (rsi < 30) {
      score -= 10;

      reasons.push({
        category: "momentum",
        message: "RSI indicates weak momentum and an oversold condition.",
        impact: "negative",
      });
    }
  }

  const normalizedScore = Math.max(
    0,
    Math.min(100, score)
  );

  let trend: ResearchTrend;

  if (normalizedScore >= 80) {
    trend = "strong_bullish";
  } else if (normalizedScore >= 60) {
    trend = "bullish";
  } else if (normalizedScore >= 40) {
    trend = "neutral";
  } else if (normalizedScore >= 20) {
    trend = "bearish";
  } else {
    trend = "strong_bearish";
  }

  return {
    trend,
    score: normalizedScore,
    reasons,
  };
}
