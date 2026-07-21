import type { AnalysisResult } from "@/lib/analysis/types";
import { analyze } from "@/lib/analysis/service";

import {
  getStockResearch as getMarketResearch,
} from "@/lib/market/research";

import type {
  StockChart,
  StockFundamentals,
  StockQuote,
} from "@/lib/market/types";

import { evaluateRisk } from "./risk";
import { evaluateTrend } from "./trend";

import type {
  ResearchConfidence,
  ResearchConfidenceLevel,
  ResearchReason,
  ResearchScore,
  ResearchSignal,
  ResearchSignalAdjustment,
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

type UnknownRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function clampScore(
  value: number
): number {
  return Math.max(
    0,
    Math.min(
      100,
      Math.round(value)
    )
  );
}

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function isPositiveNumber(
  value: unknown
): value is number {
  return (
    isFiniteNumber(value) &&
    value > 0
  );
}

function getLatestValue(
  values:
    | IndicatorValue[]
    | undefined
): number | null {
  if (
    !values ||
    values.length === 0
  ) {
    return null;
  }

  const latest =
    values[values.length - 1];

  if (
    !latest ||
    !isFiniteNumber(latest.value)
  ) {
    return null;
  }

  return latest.value;
}

function hasLatestValue(
  values:
    | IndicatorValue[]
    | undefined
): boolean {
  return (
    getLatestValue(values) !== null
  );
}

function evaluateMomentum(
  analysis: AnalysisResult
): ScoreEvaluation {
  let score = 50;

  const reasons: ResearchReason[] =
    [];

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

    if (
      rsi >= 45 &&
      rsi <= 65
    ) {
      score += 15;

      reasons.push({
        category: "momentum",
        message:
          "RSI is in a healthy momentum range.",
        impact: "positive",
      });
    } else if (
      rsi > 65 &&
      rsi < 75
    ) {
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

  if (
    macd !== null &&
    signal !== null
  ) {
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
  fundamentals:
    | StockFundamentals
    | null
): ScoreEvaluation {
  let score = 50;

  const reasons: ResearchReason[] =
    [];

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

  const peRatio =
    fundamentals.peRatio;

  if (isPositiveNumber(peRatio)) {
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

  const pbRatio =
    fundamentals.pbRatio;

  if (isPositiveNumber(pbRatio)) {
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
    isFiniteNumber(dividendYield) &&
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
    } else if (
      dividendYield >= 1
    ) {
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

  if (isFiniteNumber(roe)) {
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

function evaluateQuoteConfidence(
  quote: StockQuote | null
): {
  score: number;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!quote) {
    return {
      score: 0,
      warnings: [
        "Current quote data is unavailable.",
      ],
    };
  }

  let score = 0;

  if (
    isPositiveNumber(quote.price)
  ) {
    score += 70;
  } else {
    warnings.push(
      "The current market price is unavailable."
    );
  }

  if (
    typeof quote.symbol ===
      "string" &&
    quote.symbol.trim().length > 0
  ) {
    score += 10;
  }

  if (
    typeof quote.currency ===
      "string" &&
    quote.currency.trim().length >
      0
  ) {
    score += 10;
  } else {
    warnings.push(
      "Quote currency information is unavailable."
    );
  }

  if (
    typeof quote.metadata
      ?.updatedAt === "string" &&
    quote.metadata.updatedAt.trim()
      .length > 0
  ) {
    score += 10;
  } else {
    warnings.push(
      "Quote update time is unavailable."
    );
  }

  return {
    score: clampScore(score),
    warnings,
  };
}

function evaluateChartConfidence(
  chart: StockChart
): {
  score: number;
  warnings: string[];
} {
  const warnings: string[] = [];

  const candles = Array.isArray(
    chart.candles
  )
    ? chart.candles
    : [];

  if (candles.length === 0) {
    return {
      score: 0,
      warnings: [
        "Historical chart data is unavailable.",
      ],
    };
  }

  const validCandles =
    candles.filter((candle) => {
      return (
        isPositiveNumber(
          candle.open
        ) &&
        isPositiveNumber(
          candle.high
        ) &&
        isPositiveNumber(
          candle.low
        ) &&
        isPositiveNumber(
          candle.close
        ) &&
        candle.high >= candle.low
      );
    });

  let baseScore: number;

  if (validCandles.length >= 250) {
    baseScore = 100;
  } else if (
    validCandles.length >= 200
  ) {
    baseScore = 95;
  } else if (
    validCandles.length >= 120
  ) {
    baseScore = 80;
  } else if (
    validCandles.length >= 60
  ) {
    baseScore = 60;
  } else if (
    validCandles.length >= 20
  ) {
    baseScore = 40;
  } else {
    baseScore = 20;
  }

  const validRatio =
    validCandles.length /
    candles.length;

  const score = clampScore(
    baseScore * validRatio
  );

  if (validCandles.length < 200) {
    warnings.push(
      "Historical data contains fewer than 200 valid candles, so MA200 reliability is limited."
    );
  }

  if (validRatio < 0.95) {
    warnings.push(
      "Some historical candles contain incomplete OHLC data."
    );
  }

  return {
    score,
    warnings,
  };
}

function evaluateTechnicalConfidence(
  analysis: AnalysisResult
): {
  score: number;
  warnings: string[];
} {
  const checks = [
    {
      name: "MA25",
      available: hasLatestValue(
        analysis.ma?.[25]?.values
      ),
    },
    {
      name: "MA75",
      available: hasLatestValue(
        analysis.ma?.[75]?.values
      ),
    },
    {
      name: "MA200",
      available: hasLatestValue(
        analysis.ma?.[200]?.values
      ),
    },
    {
      name: "RSI",
      available: hasLatestValue(
        analysis.rsi?.values
      ),
    },
    {
      name: "MACD",
      available: hasLatestValue(
        analysis.macd?.macd.values
      ),
    },
    {
      name: "MACD Signal",
      available: hasLatestValue(
        analysis.macd?.signal.values
      ),
    },
    {
      name: "MACD Histogram",
      available: hasLatestValue(
        analysis.macd?.histogram.values
      ),
    },
    {
      name: "ATR",
      available: hasLatestValue(
        analysis.atr?.values
      ),
    },
  ];

  const availableCount =
    checks.filter(
      (check) => check.available
    ).length;

  const missingIndicators =
    checks
      .filter(
        (check) =>
          !check.available
      )
      .map(
        (check) => check.name
      );

  const warnings: string[] = [];

  if (
    missingIndicators.length > 0
  ) {
    warnings.push(
      `Missing technical indicators: ${missingIndicators.join(
        ", "
      )}.`
    );
  }

  return {
    score: clampScore(
      (
        availableCount /
        checks.length
      ) * 100
    ),
    warnings,
  };
}

function evaluateFundamentalConfidence(
  fundamentals:
    | StockFundamentals
    | null
): {
  score: number;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!fundamentals) {
    return {
      score: 0,
      warnings: [
        "Fundamental data is unavailable.",
      ],
    };
  }

  const metrics = [
    isPositiveNumber(
      fundamentals.marketCap
    ),
    isPositiveNumber(
      fundamentals.peRatio
    ),
    isPositiveNumber(
      fundamentals.pbRatio
    ),
    isFiniteNumber(
      fundamentals.dividendYield
    ) &&
      fundamentals.dividendYield >=
        0,
    isFiniteNumber(
      fundamentals.eps
    ),
    isFiniteNumber(
      fundamentals.roe
    ),
  ];

  const availableCount =
    metrics.filter(Boolean).length;

  if (
    availableCount <
    metrics.length
  ) {
    warnings.push(
      `Fundamental data coverage is ${availableCount}/${metrics.length}.`
    );
  }

  return {
    score: clampScore(
      (
        availableCount /
        metrics.length
      ) * 100
    ),
    warnings,
  };
}

function getMarketWarningMessage(
  warning: unknown
): string | null {
  if (
    typeof warning === "string" &&
    warning.trim().length > 0
  ) {
    return warning.trim();
  }

  if (
    isRecord(warning) &&
    typeof warning.message ===
      "string" &&
    warning.message.trim().length >
      0
  ) {
    return warning.message.trim();
  }

  return null;
}

function getConfidenceLevel(
  score: number
): ResearchConfidenceLevel {
  if (score >= 85) {
    return "high";
  }

  if (score >= 60) {
    return "medium";
  }

  return "low";
}

function evaluateConfidence(
  quote: StockQuote | null,
  chart: StockChart,
  analysis: AnalysisResult,
  fundamentals:
    | StockFundamentals
    | null,
  marketWarnings: unknown
): ResearchConfidence {
  const quoteEvaluation =
    evaluateQuoteConfidence(quote);

  const chartEvaluation =
    evaluateChartConfidence(chart);

  const technicalEvaluation =
    evaluateTechnicalConfidence(
      analysis
    );

  const fundamentalEvaluation =
    evaluateFundamentalConfidence(
      fundamentals
    );

  let score = clampScore(
    quoteEvaluation.score * 0.2 +
      chartEvaluation.score * 0.3 +
      technicalEvaluation.score *
        0.3 +
      fundamentalEvaluation.score *
        0.2
  );

  if (
    quoteEvaluation.score === 0 ||
    chartEvaluation.score === 0
  ) {
    score = Math.min(score, 40);
  }

  const externalWarnings =
    Array.isArray(marketWarnings)
      ? marketWarnings
          .map(
            getMarketWarningMessage
          )
          .filter(
            (
              warning
            ): warning is string =>
              warning !== null
          )
      : [];

  const warnings = Array.from(
    new Set([
      ...quoteEvaluation.warnings,
      ...chartEvaluation.warnings,
      ...technicalEvaluation.warnings,
      ...fundamentalEvaluation.warnings,
      ...externalWarnings,
    ])
  );

  return {
    score,

    level:
      getConfidenceLevel(score),

    breakdown: {
      quote:
        quoteEvaluation.score,

      chart:
        chartEvaluation.score,

      technical:
        technicalEvaluation.score,

      fundamentals:
        fundamentalEvaluation.score,
    },

    warnings,
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

function createSignalAdjustment(
  originalSignal: ResearchSignal,
  confidence: ResearchConfidence
): ResearchSignalAdjustment {
  if (
    confidence.score < 60 &&
    (
      originalSignal ===
        "strong_buy" ||
      originalSignal === "buy"
    )
  ) {
    return {
      applied: true,
      originalSignal,
      finalSignal: "hold",
      reason: "low_confidence",
      message:
        "Overall data confidence is below 60, so the final signal was limited to Hold.",
    };
  }

  if (
    confidence.breakdown
      .fundamentals < 50 &&
    originalSignal ===
      "strong_buy"
  ) {
    return {
      applied: true,
      originalSignal,
      finalSignal: "buy",
      reason:
        "insufficient_fundamentals",
      message:
        "Fundamental data coverage is below 50, so Strong Buy was limited to Buy.",
    };
  }

  return {
    applied: false,
    originalSignal,
    finalSignal: originalSignal,
    reason: null,
    message: null,
  };
}

export async function generateStockResearch(
  symbol: string,
  range = "1y",
  interval = "1d"
): Promise<StockResearchResult> {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error(
      "Stock symbol is required."
    );
  }

  const market =
    await getMarketResearch(
      normalizedSymbol,
      range,
      interval
    );

  const analysis = analyze(
    market.chart.candles
  );

  const currentPrice =
    market.quote?.price ?? null;

  const trendEvaluation =
    evaluateTrend(
      analysis,
      currentPrice
    );

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
    trend:
      trendEvaluation.score,

    momentum:
      momentumEvaluation.score,

    volatility:
      riskEvaluation.score,

    valuation:
      valuationEvaluation.score,

    total: calculateTotalScore(
      trendEvaluation.score,
      momentumEvaluation.score,
      riskEvaluation.score,
      valuationEvaluation.score
    ),
  };

  const reasons: ResearchReason[] =
    [
      ...trendEvaluation.reasons,
      ...momentumEvaluation.reasons,
      ...riskEvaluation.reasons,
      ...valuationEvaluation.reasons,
    ];

  const marketWarnings: unknown[] =
    Array.isArray(market.warnings)
      ? market.warnings
      : [];

  for (
    const warning of marketWarnings
  ) {
    const message =
      getMarketWarningMessage(
        warning
      );

    if (message) {
      reasons.push({
        category: "data",
        message,
        impact: "neutral",
      });
    }
  }

  const confidence =
    evaluateConfidence(
      market.quote,
      market.chart,
      analysis,
      market.fundamentals,
      market.warnings
    );

  const rawSignal =
    getSignal(score.total);

  const signalAdjustment =
    createSignalAdjustment(
      rawSignal,
      confidence
    );

  return {
    symbol: market.symbol,

    quote: market.quote,

    fundamentals:
      market.fundamentals,

    chart: market.chart,

    analysis,

    score,

    trend:
      trendEvaluation.trend,

    risk:
      riskEvaluation.risk,

    signal:
      signalAdjustment.finalSignal,

    reasons,

    confidence,

    signalAdjustment,

    generatedAt:
      new Date().toISOString(),
  };
}
