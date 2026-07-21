import type { AnalysisResult } from "@/lib/analysis/types";
import { analyze } from "@/lib/analysis/service";
import {
  getStockResearch as getMarketResearch,
} from "@/lib/market/research";
import type {
  StockFundamentals,
} from "@/lib/market/types";

import { evaluateRisk } from "./risk";
import { evaluateTrend } from "./trend";

import type {
  ResearchReason,
  ResearchScore,
  ResearchSignal,
  StockResearchResult,
} from "./types";

type ScoreEvaluation = {
  score: number;
  reasons: ResearchReason[];
};

type IndicatorValue = {
  time: number;
  value: number;
};

function clampScore(value: number): number {
  return Math.max(
    0,
    Math.min(100, Math.round(value))
  );
}

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

function evaluateMomentum(
  analysis: AnalysisResult
): ScoreEvaluation {
  let score = 50;

  const reasons: ResearchReason[] = [];

  const rsi = getLatestValue(
    analysis.rsi?.values
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

  let availableIndicators = 0;

  if (rsi !== null) {
    availableIndicators += 1;

    if (rsi >= 45 && rsi <= 65) {
      score += 15;

      reasons.push({
        category: "momentum",
        message:
          "RSI is in a healthy momentum range.",
        impact: "positive",
      });
    } else if (rsi > 65 && rsi < 75) {
      score += 5;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates strong momentum, although the stock is approaching an overbought level.",
        impact: "neutral",
      });
    } else if (rsi >= 75) {
      score -= 15;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates an overbought condition.",
        impact: "negative",
      });
    } else if (rsi >= 30) {
      score -= 5;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates relatively weak momentum.",
        impact: "neutral",
      });
    } else {
      score -= 10;

      reasons.push({
        category: "momentum",
        message:
          "RSI indicates weak momentum and an oversold condition.",
        impact: "negative",
      });
    }
  }

  if (macd !== null && signal !== null) {
    availableIndicators += 1;

    if (macd > signal) {
      score += 20;

      reasons.push({
        category: "momentum",
        message:
          "MACD is above the signal line, indicating positive momentum.",
        impact: "positive",
      });
    } else if (macd < signal) {
      score -= 20;

      reasons.push({
        category: "momentum",
        message:
          "MACD is below the signal line, indicating negative momentum.",
        impact: "negative",
      });
    }
  }

  if (histogram !== null) {
    availableIndicators += 1;

    if (histogram > 0) {
      score += 10;

      reasons.push({
        category: "momentum",
        message:
          "The MACD histogram is positive.",
        impact: "positive",
      });
    } else if (histogram < 0) {
      score -= 10;

      reasons.push({
        category: "momentum",
        message:
          "The MACD histogram is negative.",
        impact: "negative",
      });
    }
  }

  if (availableIndicators === 0) {
    reasons.push({
      category: "data",
      message:
        "Momentum indicators are unavailable.",
      impact: "neutral",
    });

    return {
      score: 50,
      reasons,
    };
  }

  return {
    score: clampScore(score),
    reasons,
  };
}

function evaluateValuation(
  fundamentals: StockFundamentals | null
): ScoreEvaluation {
  let score = 50;

  const reasons: ResearchReason[] = [];

  if (!fundamentals) {
    reasons.push({
      category: "data",
      message:
        "Fundamental data is unavailable, so valuation is treated as neutral.",
      impact: "neutral",
    });

    return {
      score,
      reasons,
    };
  }

  let availableMetrics = 0;

  const peRatio = fundamentals.peRatio;

  if (
    typeof peRatio === "number" &&
    Number.isFinite(peRatio) &&
    peRatio > 0
  ) {
    availableMetrics += 1;

    if (peRatio <= 15) {
      score += 20;

      reasons.push({
        category: "valuation",
        message:
          "The P/E ratio indicates a relatively attractive valuation.",
        impact: "positive",
      });
    } else if (peRatio <= 25) {
      score += 10;

      reasons.push({
        category: "valuation",
        message:
          "The P/E ratio is within a reasonable range.",
        impact: "positive",
      });
    } else if (peRatio <= 40) {
      score -= 5;

      reasons.push({
        category: "valuation",
        message:
          "The P/E ratio indicates a moderately expensive valuation.",
        impact: "neutral",
      });
    } else {
      score -= 15;

      reasons.push({
        category: "valuation",
        message:
          "The P/E ratio indicates a high valuation.",
        impact: "negative",
      });
    }
  }

  const pbRatio = fundamentals.pbRatio;

  if (
    typeof pbRatio === "number" &&
    Number.isFinite(pbRatio) &&
    pbRatio > 0
  ) {
    availableMetrics += 1;

    if (pbRatio <= 1.5) {
      score += 10;

      reasons.push({
        category: "valuation",
        message:
          "The P/B ratio indicates an attractive book-value valuation.",
        impact: "positive",
      });
    } else if (pbRatio <= 3) {
      score += 5;

      reasons.push({
        category: "valuation",
        message:
          "The P/B ratio is within a reasonable range.",
        impact: "neutral",
      });
    } else if (pbRatio > 6) {
      score -= 10;

      reasons.push({
        category: "valuation",
        message:
          "The P/B ratio indicates a high valuation.",
        impact: "negative",
      });
    }
  }

  const dividendYield =
    fundamentals.dividendYield;

  if (
    typeof dividendYield === "number" &&
    Number.isFinite(dividendYield) &&
    dividendYield >= 0
  ) {
    availableMetrics += 1;

    if (dividendYield >= 3) {
      score += 10;

      reasons.push({
        category: "valuation",
        message:
          "The dividend yield provides meaningful shareholder income.",
        impact: "positive",
      });
    } else if (dividendYield >= 1) {
      score += 5;

      reasons.push({
        category: "valuation",
        message:
          "The stock provides a moderate dividend yield.",
        impact: "positive",
      });
    }
  }

  const roe = fundamentals.roe;

  if (
    typeof roe === "number" &&
    Number.isFinite(roe)
  ) {
    availableMetrics += 1;

    if (roe >= 15) {
      score += 10;

      reasons.push({
        category: "valuation",
        message:
          "ROE indicates strong capital efficiency.",
        impact: "positive",
      });
    } else if (roe >= 8) {
      score += 5;

      reasons.push({
        category: "valuation",
        message:
          "ROE indicates acceptable capital efficiency.",
        impact: "neutral",
      });
    } else if (roe < 0) {
      score -= 10;

      reasons.push({
        category: "valuation",
        message:
          "Negative ROE indicates weak profitability.",
        impact: "negative",
      });
    }
  }

  if (availableMetrics === 0) {
    reasons.push({
      category: "data",
      message:
        "Usable valuation indicators are unavailable, so valuation is treated as neutral.",
      impact: "neutral",
    });

    return {
      score: 50,
      reasons,
    };
  }

  return {
    score: clampScore(score),
    reasons,
  };
}

function calculateTotalScore(
  trend: number,
  momentum: number,
  volatility: number,
  valuation: number
): number {
  return clampScore(
    trend * 0.35 +
      momentum * 0.25 +
      volatility * 0.2 +
      valuation * 0.2
  );
}

function getSignal(
  totalScore: number
): ResearchSignal {
  if (totalScore >= 80) {
    return "strong_buy";
  }

  if (totalScore >= 65) {
    return "buy";
  }

  if (totalScore >= 45) {
    return "hold";
  }

  if (totalScore >= 30) {
    return "sell";
  }

  return "strong_sell";
}

export async function generateStockResearch(
  symbol: string,
  range = "6mo",
  interval = "1d"
): Promise<StockResearchResult> {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error("Stock symbol is required.");
  }

  const market = await getMarketResearch(
    normalizedSymbol,
    range,
    interval
  );

  const analysis = analyze(
    market.chart.candles
  );

  const trendEvaluation =
    evaluateTrend(analysis);

  const riskEvaluation =
    evaluateRisk(
      analysis,
      market.quote
    );

  const momentumEvaluation =
    evaluateMomentum(analysis);

  const valuationEvaluation =
    evaluateValuation(
      market.fundamentals
    );

  const score: ResearchScore = {
    trend: trendEvaluation.score,
    momentum: momentumEvaluation.score,
    volatility: riskEvaluation.score,
    valuation: valuationEvaluation.score,
    total: calculateTotalScore(
      trendEvaluation.score,
      momentumEvaluation.score,
      riskEvaluation.score,
      valuationEvaluation.score
    ),
  };

  const reasons: ResearchReason[] = [
    ...trendEvaluation.reasons,
    ...momentumEvaluation.reasons,
    ...riskEvaluation.reasons,
    ...valuationEvaluation.reasons,
  ];

  const marketWarnings: unknown[] =
  Array.isArray(market.warnings)
    ? market.warnings
    : [];

for (const warning of marketWarnings) {
  if (
    typeof warning === "string" &&
    warning.trim().length > 0
  ) {
    reasons.push({
      category: "data",
      message: warning.trim(),
      impact: "neutral",
    });
  }
}

  return {
    symbol: market.symbol,
    quote: market.quote,
    fundamentals: market.fundamentals,
    chart: market.chart,
    analysis,
    score,
    trend: trendEvaluation.trend,
    risk: riskEvaluation.risk,
    signal: getSignal(score.total),
    reasons,
    generatedAt: new Date().toISOString(),
  };
}
