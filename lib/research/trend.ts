import type { AnalysisResult } from "@/lib/analysis/types";

import type {
  ResearchReason,
  ResearchTrend,
} from "./types";

export interface TrendEvaluation {
  trend: ResearchTrend;
  score: number;
  reasons: ResearchReason[];
}

type IndicatorValue = {
  time: number;
  value: number;
};

function getLatestValue(
  values: IndicatorValue[] | undefined
): number | null {
  if (!values || values.length === 0) {
    return null;
  }

  const latest = values[values.length - 1];

  if (
    !latest ||
    typeof latest.value !== "number" ||
    !Number.isFinite(latest.value)
  ) {
    return null;
  }

  return latest.value;
}

function clampScore(score: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

function isValidPrice(
  value: number | null | undefined
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value > 0
  );
}

export function evaluateTrend(
  analysis: AnalysisResult,
  currentPrice?: number | null
): TrendEvaluation {
  let score = 50;

  const reasons: ResearchReason[] = [];

  const ma25 = getLatestValue(
    analysis.ma?.[25]?.values
  );

  const ma75 = getLatestValue(
    analysis.ma?.[75]?.values
  );

  const ma200 = getLatestValue(
    analysis.ma?.[200]?.values
  );

  /*
   * MA25 与 MA75：
   * 判断中期趋势方向。
   */
  if (ma25 !== null && ma75 !== null) {
    if (ma25 > ma75) {
      score += 15;

      reasons.push({
        category: "trend",
        message:
          "MA25 is above MA75, indicating a positive medium-term trend.",
        impact: "positive",
      });
    } else if (ma25 < ma75) {
      score -= 15;

      reasons.push({
        category: "trend",
        message:
          "MA25 is below MA75, indicating a weak medium-term trend.",
        impact: "negative",
      });
    } else {
      reasons.push({
        category: "trend",
        message:
          "MA25 and MA75 are close, indicating an unclear medium-term trend.",
        impact: "neutral",
      });
    }
  } else {
    reasons.push({
      category: "data",
      message:
        "MA25 or MA75 data is unavailable.",
      impact: "neutral",
    });
  }

  /*
   * MA75 与 MA200：
   * 判断长期趋势结构。
   */
  if (ma75 !== null && ma200 !== null) {
    if (ma75 > ma200) {
      score += 15;

      reasons.push({
        category: "trend",
        message:
          "MA75 is above MA200, indicating a positive long-term market structure.",
        impact: "positive",
      });
    } else if (ma75 < ma200) {
      score -= 15;

      reasons.push({
        category: "trend",
        message:
          "MA75 is below MA200, indicating a weak long-term market structure.",
        impact: "negative",
      });
    } else {
      reasons.push({
        category: "trend",
        message:
          "MA75 and MA200 are close, indicating an unclear long-term structure.",
        impact: "neutral",
      });
    }
  } else {
    reasons.push({
      category: "data",
      message:
        "MA200 data is unavailable, so the long-term trend cannot be fully evaluated.",
      impact: "neutral",
    });
  }

  /*
   * 当前价格与 MA25：
   * 判断短期价格位置。
   */
  if (
    isValidPrice(currentPrice) &&
    ma25 !== null
  ) {
    if (currentPrice > ma25) {
      score += 5;

      reasons.push({
        category: "trend",
        message:
          "The current price is above MA25, indicating positive short-term price positioning.",
        impact: "positive",
      });
    } else if (currentPrice < ma25) {
      score -= 5;

      reasons.push({
        category: "trend",
        message:
          "The current price is below MA25, indicating weak short-term price positioning.",
        impact: "negative",
      });
    }
  }

  /*
   * 当前价格与 MA75：
   * 判断中期价格位置。
   */
  if (
    isValidPrice(currentPrice) &&
    ma75 !== null
  ) {
    if (currentPrice > ma75) {
      score += 10;

      reasons.push({
        category: "trend",
        message:
          "The current price is above MA75, confirming a positive medium-term price structure.",
        impact: "positive",
      });
    } else if (currentPrice < ma75) {
      score -= 10;

      reasons.push({
        category: "trend",
        message:
          "The current price is below MA75, indicating medium-term price weakness.",
        impact: "negative",
      });
    }
  }

  /*
   * 当前价格与 MA200：
   * 判断长期价格位置。
   */
  if (
    isValidPrice(currentPrice) &&
    ma200 !== null
  ) {
    if (currentPrice > ma200) {
      score += 10;

      reasons.push({
        category: "trend",
        message:
          "The current price is above MA200, indicating that the stock remains in a positive long-term structure.",
        impact: "positive",
      });
    } else if (currentPrice < ma200) {
      score -= 10;

      reasons.push({
        category: "trend",
        message:
          "The current price is below MA200, indicating a weak long-term price structure.",
        impact: "negative",
      });
    }
  }

  if (!isValidPrice(currentPrice)) {
    reasons.push({
      category: "data",
      message:
        "Current price data was not provided to the trend evaluator.",
      impact: "neutral",
    });
  }

  const normalizedScore =
    clampScore(score);

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
