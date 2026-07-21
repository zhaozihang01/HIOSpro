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

  const latest =
    values[values.length - 1];

  if (
    !latest ||
    typeof latest.value !== "number" ||
    !Number.isFinite(latest.value)
  ) {
    return null;
  }

  return latest.value;
}

function clampScore(
  score: number
): number {
  return Math.max(
    0,
    Math.min(100, Math.round(score))
  );
}

export function evaluateTrend(
  analysis: AnalysisResult
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

  /*
   * MA25 与 MA75：
   * 判断中短期趋势方向。
   */
  if (
    ma25 !== null &&
    ma75 !== null
  ) {
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
   * 判断中长期牛熊结构。
   */
  if (
    ma75 !== null &&
    ma200 !== null
  ) {
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
   * MA25 与 MA200：
   * 判断中短期趋势是否与长期结构一致。
   */
  if (
    ma25 !== null &&
    ma200 !== null
  ) {
    if (ma25 > ma200) {
      score += 10;

      reasons.push({
        category: "trend",
        message:
          "MA25 is above MA200, showing that the current trend remains above the long-term average.",
        impact: "positive",
      });
    } else if (ma25 < ma200) {
      score -= 10;

      reasons.push({
        category: "trend",
        message:
          "MA25 is below MA200, showing that the current trend remains below the long-term average.",
        impact: "negative",
      });
    }
  }

  /*
   * MACD：
   * 判断趋势动量方向。
   */
  if (
    macd !== null &&
    signal !== null
  ) {
    if (macd > signal) {
      score += 10;

      reasons.push({
        category: "momentum",
        message:
          "MACD is above the signal line.",
        impact: "positive",
      });
    } else if (macd < signal) {
      score -= 10;

      reasons.push({
        category: "momentum",
        message:
          "MACD is below the signal line.",
        impact: "negative",
      });
    }
  }

  if (histogram !== null) {
    if (histogram > 0) {
      score += 5;

      reasons.push({
        category: "momentum",
        message:
          "MACD histogram is positive.",
        impact: "positive",
      });
    } else if (histogram < 0) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message:
          "MACD histogram is negative.",
        impact: "negative",
      });
    }
  }

  /*
   * RSI：
   * 判断当前动量是否健康或过热。
   */
  if (rsi !== null) {
    if (
      rsi >= 45 &&
      rsi < 65
    ) {
      score += 5;

      reasons.push({
        category: "momentum",
        message:
          "RSI is in a healthy momentum range.",
        impact: "positive",
      });
    } else if (
      rsi >= 65 &&
      rsi < 75
    ) {
      reasons.push({
        category: "momentum",
        message:
          "RSI indicates strong momentum but is approaching an overbought level.",
        impact: "neutral",
      });
    } else if (rsi >= 75) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates an overbought condition.",
        impact: "negative",
      });
    } else if (rsi < 30) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates weak momentum and an oversold condition.",
        impact: "negative",
      });
    }
  }

  const normalizedScore =
    clampScore(score);

  let trend: ResearchTrend;

  if (normalizedScore >= 80) {
    trend = "strong_bullish";
  } else if (
    normalizedScore >= 60
  ) {
    trend = "bullish";
  } else if (
    normalizedScore >= 40
  ) {
    trend = "neutral";
  } else if (
    normalizedScore >= 20
  ) {
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
