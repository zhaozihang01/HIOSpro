import type {
  StockCandle,
  StockChart,
} from "@/lib/market/types";

import type {
  StockResearchResult,
} from "@/lib/research";

import type {
  DailyPickScoreBreakdown,
  InvestmentAssetType,
  InvestmentMarket,
  InvestmentUniverseItem,
  LiquidityAssessment,
  RejectedCandidateReason,
} from "@/lib/screener/types";

const LIQUIDITY_LOOKBACK_DAYS = 20;

const MINIMUM_LIQUIDITY_CANDLES = 10;

const MAXIMUM_DIVERSIFICATION_PENALTY =
  30;

const SCORE_WEIGHTS = {
  trend: 0.25,
  momentum: 0.15,
  volatility: 0.15,
  valuation: 0.15,
  liquidity: 0.1,
  confidence: 0.1,
  marketFit: 0.1,
} as const;

type AssetScreeningThresholds = {
  minimumResearchScore: number;
  minimumConfidenceScore: number;
  minimumValidCandles: number;
  minimumAverageTurnover20: number;
};

type CandidateScoreInput = {
  research: StockResearchResult;
  liquidity: LiquidityAssessment;
  marketFitScore?: number;
  diversificationPenalty?: number;
};

export type CoreEligibilityResult = {
  passed: boolean;
  reasons: RejectedCandidateReason[];
  thresholds: AssetScreeningThresholds;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number
): number {
  return Math.max(
    minimum,
    Math.min(maximum, value)
  );
}

function clampScore(
  value: number
): number {
  return Math.round(
    clamp(value, 0, 100)
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

function isValidLiquidityCandle(
  candle: StockCandle
): boolean {
  return (
    isPositiveNumber(candle.close) &&
    isFiniteNumber(candle.volume) &&
    candle.volume > 0
  );
}

function getRecentLiquidityCandles(
  chart: StockChart
): StockCandle[] {
  if (!Array.isArray(chart.candles)) {
    return [];
  }

  return chart.candles
    .filter(isValidLiquidityCandle)
    .slice(-LIQUIDITY_LOOKBACK_DAYS);
}

function calculateAverage(
  values: number[]
): number | null {
  if (values.length === 0) {
    return null;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return total / values.length;
}

function getMinimumTurnoverByMarket(
  market: InvestmentMarket,
  assetType: InvestmentAssetType
): number {
  if (market === "japan") {
    switch (assetType) {
      case "etf":
        return 50_000_000;

      case "reit":
      case "infrastructure_fund":
        return 30_000_000;

      case "insurance_stock":
      case "stock":
      default:
        return 100_000_000;
    }
  }

  switch (assetType) {
    case "etf":
      return 10_000_000;

    case "reit":
    case "infrastructure_fund":
        return 5_000_000;

    case "insurance_stock":
    case "stock":
    default:
      return 5_000_000;
  }
}

function getMinimumConfidenceByAssetType(
  assetType: InvestmentAssetType
): number {
  switch (assetType) {
    case "etf":
      /*
       * ETF通常没有企业级P/E、ROE等基本面数据。
       * 现有Research Confidence中基本面占20%，
       * 因此ETF最高分可能约为80。
       */
      return 75;

    case "reit":
    case "infrastructure_fund":
      return 80;

    case "insurance_stock":
    case "stock":
    default:
      return 85;
  }
}

function getMinimumResearchScoreByAssetType(
  assetType: InvestmentAssetType
): number {
  switch (assetType) {
    case "etf":
      return 60;

    case "reit":
    case "infrastructure_fund":
      return 62;

    case "insurance_stock":
    case "stock":
    default:
      return 65;
  }
}

function calculateLiquidityScore(
  averageTurnover20: number | null,
  minimumTurnover: number
): number {
  if (
    averageTurnover20 === null ||
    averageTurnover20 <= 0 ||
    minimumTurnover <= 0
  ) {
    return 0;
  }

  const ratio =
    averageTurnover20 /
    minimumTurnover;

  if (ratio >= 10) {
    return 100;
  }

  if (ratio >= 5) {
    return 95;
  }

  if (ratio >= 2) {
    return 85;
  }

  if (ratio >= 1) {
    return 70;
  }

  if (ratio >= 0.5) {
    return 50;
  }

  if (ratio >= 0.25) {
    return 30;
  }

  return 10;
}

function hasUsableQuote(
  research: StockResearchResult
): boolean {
  return isPositiveNumber(
    research.quote?.price
  );
}

function getConfidenceScore(
  research: StockResearchResult
): number {
  const score =
    research.confidence?.score;

  return isFiniteNumber(score)
    ? clampScore(score)
    : 0;
}

export function getAssetScreeningThresholds(
  asset: InvestmentUniverseItem
): AssetScreeningThresholds {
  return {
    minimumResearchScore:
      getMinimumResearchScoreByAssetType(
        asset.assetType
      ),

    minimumConfidenceScore:
      getMinimumConfidenceByAssetType(
        asset.assetType
      ),

    minimumValidCandles: 200,

    minimumAverageTurnover20:
      getMinimumTurnoverByMarket(
        asset.market,
        asset.assetType
      ),
  };
}

export function getValidCandleCount(
  chart: StockChart
): number {
  if (!Array.isArray(chart.candles)) {
    return 0;
  }

  return chart.candles.filter(
    (candle) =>
      isPositiveNumber(candle.open) &&
      isPositiveNumber(candle.high) &&
      isPositiveNumber(candle.low) &&
      isPositiveNumber(candle.close) &&
      candle.high >= candle.low
  ).length;
}

export function assessLiquidity(
  asset: InvestmentUniverseItem,
  chart: StockChart
): LiquidityAssessment {
  const candles =
    getRecentLiquidityCandles(chart);

  const averageVolume20 =
    calculateAverage(
      candles.map(
        (candle) => candle.volume
      )
    );

  const averageTurnover20 =
    calculateAverage(
      candles.map(
        (candle) =>
          candle.close *
          candle.volume
      )
    );

  const minimumTurnover =
    getMinimumTurnoverByMarket(
      asset.market,
      asset.assetType
    );

  const score =
    calculateLiquidityScore(
      averageTurnover20,
      minimumTurnover
    );

  const hasEnoughCandles =
    candles.length >=
    MINIMUM_LIQUIDITY_CANDLES;

  const passed =
    hasEnoughCandles &&
    averageTurnover20 !== null &&
    averageTurnover20 >=
      minimumTurnover;

  return {
    averageVolume20:
      averageVolume20 === null
        ? null
        : Math.round(
            averageVolume20
          ),

    averageTurnover20:
      averageTurnover20 === null
        ? null
        : Math.round(
            averageTurnover20
          ),

    score,
    passed,
  };
}

export function calculateDailyPickScore({
  research,
  liquidity,
  marketFitScore = 50,
  diversificationPenalty = 0,
}: CandidateScoreInput): DailyPickScoreBreakdown {
  const trend =
    clampScore(
      research.score.trend
    );

  const momentum =
    clampScore(
      research.score.momentum
    );

  const volatility =
    clampScore(
      research.score.volatility
    );

  const valuation =
    clampScore(
      research.score.valuation
    );

  const liquidityScore =
    clampScore(
      liquidity.score
    );

  const confidence =
    getConfidenceScore(
      research
    );

  const normalizedMarketFit =
    clampScore(
      marketFitScore
    );

  const normalizedPenalty =
    clamp(
      diversificationPenalty,
      0,
      MAXIMUM_DIVERSIFICATION_PENALTY
    );

  const weightedScore =
    trend *
      SCORE_WEIGHTS.trend +
    momentum *
      SCORE_WEIGHTS.momentum +
    volatility *
      SCORE_WEIGHTS.volatility +
    valuation *
      SCORE_WEIGHTS.valuation +
    liquidityScore *
      SCORE_WEIGHTS.liquidity +
    confidence *
      SCORE_WEIGHTS.confidence +
    normalizedMarketFit *
      SCORE_WEIGHTS.marketFit;

  const total =
    clampScore(
      weightedScore -
        normalizedPenalty
    );

  return {
    trend,
    momentum,
    volatility,
    valuation,

    liquidity:
      liquidityScore,

    confidence,

    marketFit:
      normalizedMarketFit,

    diversificationPenalty:
      Math.round(
        normalizedPenalty
      ),

    total,
  };
}

export function evaluateCoreEligibility(
  asset: InvestmentUniverseItem,
  research: StockResearchResult,
  liquidity: LiquidityAssessment
): CoreEligibilityResult {
  const thresholds =
    getAssetScreeningThresholds(
      asset
    );

  const reasons:
    RejectedCandidateReason[] =
    [];

  if (!asset.enabled) {
    reasons.push("disabled");
  }

  if (!hasUsableQuote(research)) {
    reasons.push(
      "quote_unavailable"
    );
  }

  const validCandleCount =
    getValidCandleCount(
      research.chart
    );

  if (
    validCandleCount <
    thresholds.minimumValidCandles
  ) {
    reasons.push(
      "insufficient_chart_data"
    );
  }

  const confidenceScore =
    getConfidenceScore(
      research
    );

  if (
    confidenceScore <
    thresholds.minimumConfidenceScore
  ) {
    reasons.push(
      "confidence_too_low"
    );
  }

  if (
    research.risk ===
    "very_high"
  ) {
    reasons.push(
      "risk_too_high"
    );
  }

  if (!liquidity.passed) {
    reasons.push(
      "liquidity_too_low"
    );
  }

  if (
    research.signal === "sell" ||
    research.signal ===
      "strong_sell"
  ) {
    reasons.push(
      "signal_too_weak"
    );
  }

  if (
    research.score.total <
    thresholds.minimumResearchScore
  ) {
    reasons.push(
      "score_too_low"
    );
  }

  return {
    passed:
      reasons.length === 0,

    reasons:
      Array.from(
        new Set(reasons)
      ),

    thresholds,
  };
}

export function compareDailyPickScores(
  first: DailyPickScoreBreakdown,
  second: DailyPickScoreBreakdown
): number {
  if (
    first.total !==
    second.total
  ) {
    return (
      second.total -
      first.total
    );
  }

  if (
    first.confidence !==
    second.confidence
  ) {
    return (
      second.confidence -
      first.confidence
    );
  }

  if (
    first.liquidity !==
    second.liquidity
  ) {
    return (
      second.liquidity -
      first.liquidity
    );
  }

  return (
    second.trend -
    first.trend
  );
}

export {
  SCORE_WEIGHTS,
  LIQUIDITY_LOOKBACK_DAYS,
};
