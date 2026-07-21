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

function addPricePositionReasons(
  reasons: ResearchReason[],
  currentPrice: number,
  ma25: number | null,
  ma75: number | null,
  ma200: number | null
): void {
  if (ma25 !== null) {
    reasons.push({
      category: "trend",
      message:
        currentPrice >= ma25
          ? "The current price is above MA25, indicating positive short-term price positioning."
          : "The current price is below MA25, indicating weak short-term price positioning.",
      impact:
        currentPrice >= ma25
          ? "positive"
          : "negative",
    });
  }

  if (ma75 !== null) {
    reasons.push({
      category: "trend",
      message:
        currentPrice >= ma75
          ? "The current price is above MA75, confirming a positive medium-term price structure."
          : "The current price is below MA75, indicating medium-term price weakness.",
      impact:
        currentPrice >= ma75
          ? "positive"
          : "negative",
    });
  }

  if (ma200 !== null) {
    reasons.push({
      category: "trend",
      message:
        currentPrice >= ma200
          ? "The current price is above MA200, indicating that the stock remains in a positive long-term structure."
          : "The current price is below MA200, indicating a weak long-term price structure.",
      impact:
        currentPrice >= ma200
          ? "positive"
          : "negative",
    });
  }
}

function evaluatePricePosition(
  currentPrice: number,
  ma25: number | null,
  ma75: number | null,
  ma200: number | null
): number {
  const hasMa25 = ma25 !== null;
  const hasMa75 = ma75 !== null;
  const hasMa200 = ma200 !== null;

  if (
    hasMa25 &&
    hasMa75 &&
    hasMa200
  ) {
    const aboveMa25 =
      currentPrice >= ma25;

    const aboveMa75 =
      currentPrice >= ma75;

    const aboveMa200 =
      currentPrice >= ma200;

    /*
     * 三条均线上方：
     * 短、中、长期结构全部积极。
     */
    if (
      aboveMa25 &&
      aboveMa75 &&
      aboveMa200
    ) {
      return 20;
    }

    /*
     * MA25上方，但仍在MA75或MA200下方：
     * 视为短期修复，不直接判定为全面转强。
     */
    if (
      aboveMa25 &&
      (!aboveMa75 || !aboveMa200)
    ) {
      return 5;
    }

    /*
     * MA25下方，但中长期均线仍有支撑：
     * 视为上涨结构中的短期回调。
     */
    if (
      !aboveMa25 &&
      (aboveMa75 || aboveMa200)
    ) {
      return -5;
    }

    /*
     * 三条均线全部下方：
     * 确认价格结构全面偏弱。
     */
    return -20;
  }

  const availableMAs = [
    ma25,
    ma75,
    ma200,
  ].filter(
    (value): value is number =>
      value !== null
  );

  if (availableMAs.length === 0) {
    return 0;
  }

  const aboveCount =
    availableMAs.filter(
      (average) =>
        currentPrice >= average
    ).length;

  if (
    aboveCount ===
    availableMAs.length
  ) {
    return 10;
  }

  if (aboveCount === 0) {
    return -10;
  }

  return 0;
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
   * 中期均线结构
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
   * 长期均线结构
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
   * 股价与均线位置只进行一次综合计分，
   * 避免分别低于MA75、MA200时连续重复扣分。
   */
  if (isValidPrice(currentPrice)) {
    score += evaluatePricePosition(
      currentPrice,
      ma25,
      ma75,
      ma200
    );

    addPricePositionReasons(
      reasons,
      currentPrice,
      ma25,
      ma75,
      ma200
    );
  } else {
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
