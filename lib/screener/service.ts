import {
  investmentUniverse,
} from "@/data/investment-universe";

import {
  generateStockResearch,
} from "@/lib/research/service";

import type {
  ResearchSignal,
  StockResearchResult,
} from "@/lib/research";

import {
  assessLiquidity,
  calculateDailyPickScore,
  compareDailyPickScores,
  evaluateCoreEligibility,
  getValidCandleCount,
} from "@/lib/screener/scoring";

import type {
  DailyInvestmentPick,
  DailyPickAdvice,
  DailyPickHorizon,
  DailyPickReasonCode,
  DailyPickRiskCode,
  DailyPickScoreBreakdown,
  DailyPickStance,
  DailyPicksReport,
  DailyScreenerRules,
  InvestmentUniverseItem,
  RejectedCandidate,
  RejectedCandidateReason,
} from "@/lib/screener/types";

const DEFAULT_MAXIMUM_CONCURRENCY = 4;

const DEFAULT_MARKET_FIT_SCORE = 50;

export const DAILY_SELECTION_VERSION =
  "1.0.0";

export const DEFAULT_DAILY_SCREENER_RULES:
  DailyScreenerRules = {
  maximumPicks: 3,

  /*
   * 这里使用的是全局最低门槛。
   * 股票、ETF、REIT的详细差异化门槛，
   * 仍由scoring.ts负责。
   */
  minimumResearchScore: 60,
  minimumConfidenceScore: 75,
  minimumValidCandles: 200,
  minimumAverageTurnover20:
    5_000_000,

  allowedSignals: [
    "strong_buy",
    "buy",
    "hold",
  ],

  excludedRisks: [
    "very_high",
  ],

  maximumPerSector: 1,
  maximumPerAssetType: 2,
};

type MarketFitResolver = (
  asset: InvestmentUniverseItem,
  research: StockResearchResult
) => number;

export type GenerateDailyPicksOptions = {
  universe?: InvestmentUniverseItem[];

  rules?: Partial<DailyScreenerRules>;

  maximumConcurrency?: number;

  defaultMarketFitScore?: number;

  marketFitResolver?: MarketFitResolver;

  signal?: AbortSignal;
};

type QualifiedCandidate =
  Omit<
    DailyInvestmentPick,
    "rank"
  >;

type CandidateOutcome =
  | {
      status: "qualified";
      candidate: QualifiedCandidate;
    }
  | {
      status: "rejected";
      rejected: RejectedCandidate;
    };

type NormalizedUniverseResult = {
  items: InvestmentUniverseItem[];
  duplicateSymbols: string[];
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
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.round(
    clamp(value, 0, 100)
  );
}

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message.trim();
  }

  if (
    typeof error === "string" &&
    error.trim().length > 0
  ) {
    return error.trim();
  }

  return "Unknown screening error.";
}

function throwIfAborted(
  signal?: AbortSignal
): void {
  if (signal?.aborted) {
    throw new Error(
      "Daily screener was aborted."
    );
  }
}

function normalizeRules(
  overrides:
    | Partial<DailyScreenerRules>
    | undefined
): DailyScreenerRules {
  return {
    ...DEFAULT_DAILY_SCREENER_RULES,
    ...overrides,

    allowedSignals:
      overrides?.allowedSignals
        ? [
            ...overrides.allowedSignals,
          ]
        : [
            ...DEFAULT_DAILY_SCREENER_RULES.allowedSignals,
          ],

    excludedRisks:
      overrides?.excludedRisks
        ? [
            ...overrides.excludedRisks,
          ]
        : [
            ...DEFAULT_DAILY_SCREENER_RULES.excludedRisks,
          ],
  };
}

function normalizeUniverse(
  universe: InvestmentUniverseItem[]
): NormalizedUniverseResult {
  const items:
    InvestmentUniverseItem[] =
    [];

  const seen =
    new Set<string>();

  const duplicates =
    new Set<string>();

  for (const asset of universe) {
    const normalizedSymbol =
      asset.symbol
        .trim()
        .toUpperCase();

    if (!normalizedSymbol) {
      continue;
    }

    if (
      seen.has(normalizedSymbol)
    ) {
      duplicates.add(
        normalizedSymbol
      );

      continue;
    }

    seen.add(normalizedSymbol);

    items.push({
      ...asset,
      symbol: normalizedSymbol,
      name: asset.name.trim(),
      exchange:
        asset.exchange.trim(),

      sector:
        asset.sector?.trim() ||
        undefined,

      theme:
        asset.theme?.trim() ||
        undefined,
    });
  }

  return {
    items,

    duplicateSymbols:
      Array.from(
        duplicates
      ).sort(),
  };
}

function getJapanReportDate(
  date = new Date()
): string {
  try {
    const parts =
      new Intl.DateTimeFormat(
        "en-CA",
        {
          timeZone:
            "Asia/Tokyo",

          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }
      ).formatToParts(date);

    const year =
      parts.find(
        (part) =>
          part.type === "year"
      )?.value;

    const month =
      parts.find(
        (part) =>
          part.type === "month"
      )?.value;

    const day =
      parts.find(
        (part) =>
          part.type === "day"
      )?.value;

    if (
      year &&
      month &&
      day
    ) {
      return `${year}-${month}-${day}`;
    }
  } catch {
    // 下方使用UTC日期作为后备值
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function getLatestIndicatorValue(
  values:
    | Array<{
        time: number;
        value: number;
      }>
    | undefined
): number | null {
  if (
    !values ||
    values.length === 0
  ) {
    return null;
  }

  const latest =
    values[
      values.length - 1
    ];

  if (
    !latest ||
    typeof latest.value !==
      "number" ||
    !Number.isFinite(
      latest.value
    )
  ) {
    return null;
  }

  return latest.value;
}

function createAdviceReasons(
  asset: InvestmentUniverseItem,
  score: DailyPickScoreBreakdown
): DailyPickReasonCode[] {
  const reasons:
    DailyPickReasonCode[] = [];

  if (score.trend >= 70) {
    reasons.push(
      "strong_trend"
    );
  }

  if (score.momentum >= 65) {
    reasons.push(
      "healthy_momentum"
    );
  }

  if (score.volatility >= 65) {
    reasons.push(
      "controlled_volatility"
    );
  }

  if (score.valuation >= 65) {
    reasons.push(
      "reasonable_valuation"
    );
  }

  if (score.liquidity >= 70) {
    reasons.push(
      "high_liquidity"
    );
  }

  if (score.confidence >= 85) {
    reasons.push(
      "high_data_confidence"
    );
  }

  if (score.marketFit >= 65) {
    reasons.push(
      "market_environment_match"
    );
  }

  if (
    asset.assetType === "etf" ||
    asset.assetType === "reit" ||
    asset.assetType ===
      "infrastructure_fund"
  ) {
    reasons.push(
      "diversification_value"
    );
  }

  /*
   * 合格候选至少显示一个入选原因。
   */
  if (reasons.length === 0) {
    reasons.push(
      "high_liquidity"
    );
  }

  return Array.from(
    new Set(reasons)
  );
}

function createAdviceRisks(
  asset: InvestmentUniverseItem,
  research: StockResearchResult,
  score: DailyPickScoreBreakdown
): DailyPickRiskCode[] {
  const risks:
    DailyPickRiskCode[] = [];

  const latestRsi =
    getLatestIndicatorValue(
      research.analysis.rsi?.values
    );

  if (
    latestRsi !== null &&
    latestRsi >= 70
  ) {
    risks.push(
      "overbought"
    );
  }

  if (score.trend < 60) {
    risks.push(
      "trend_reversal"
    );
  }

  if (score.volatility < 60) {
    risks.push(
      "high_volatility"
    );
  }

  if (score.valuation < 45) {
    risks.push(
      "valuation_risk"
    );
  }

  if (score.liquidity < 80) {
    risks.push(
      "low_liquidity"
    );
  }

  if (
    asset.currency === "USD"
  ) {
    risks.push(
      "currency_risk"
    );
  }

  const fundamentalConfidence =
    research.confidence
      ?.breakdown
      .fundamentals ?? 0;

  if (
    fundamentalConfidence < 50
  ) {
    risks.push(
      "fundamental_data_missing"
    );
  }

  if (risks.length === 0) {
    risks.push(
      "market_risk"
    );
  }

  return Array.from(
    new Set(risks)
  );
}

function getAdviceStance(
  research: StockResearchResult,
  score: DailyPickScoreBreakdown
): DailyPickStance {
  if (
    (
      research.signal ===
        "strong_buy" ||
      research.signal === "buy"
    ) &&
    score.total >= 70 &&
    research.risk !== "high"
  ) {
    return "positive";
  }

  if (
    research.risk === "high" ||
    score.total < 65
  ) {
    return "cautious";
  }

  return "neutral";
}

function getAdviceHorizon(
  asset: InvestmentUniverseItem,
  research: StockResearchResult,
  score: DailyPickScoreBreakdown
): DailyPickHorizon {
  if (
    research.risk === "high" ||
    score.volatility < 55
  ) {
    return "short_term";
  }

  if (
    (
      asset.assetType === "etf" ||
      asset.assetType === "reit" ||
      asset.assetType ===
        "infrastructure_fund"
    ) &&
    research.risk === "low"
  ) {
    return "long_term";
  }

  return "medium_term";
}

function createInvalidationConditions(
  research: StockResearchResult,
  score: DailyPickScoreBreakdown
): DailyPickAdvice["invalidationConditions"] {
  const conditions:
    DailyPickAdvice["invalidationConditions"] =
    [];

  if (score.trend >= 60) {
    conditions.push(
      "price_below_ma75"
    );
  } else {
    conditions.push(
      "price_below_ma25"
    );
  }

  if (score.momentum >= 60) {
    conditions.push(
      "macd_bearish_cross"
    );
  } else {
    conditions.push(
      "rsi_momentum_failure"
    );
  }

  conditions.push(
    "confidence_below_threshold"
  );

  conditions.push(
    "risk_upgraded_to_very_high"
  );

  if (score.liquidity < 80) {
    conditions.push(
      "liquidity_below_threshold"
    );
  }

  /*
   * 强烈买入的候选额外使用MA200作为
   * 中长期趋势失效条件。
   */
  if (
    research.signal ===
      "strong_buy"
  ) {
    conditions.push(
      "price_below_ma200"
    );
  }

  return Array.from(
    new Set(conditions)
  );
}

function createAdvice(
  asset: InvestmentUniverseItem,
  research: StockResearchResult,
  score: DailyPickScoreBreakdown
): DailyPickAdvice {
  return {
    stance:
      getAdviceStance(
        research,
        score
      ),

    horizon:
      getAdviceHorizon(
        asset,
        research,
        score
      ),

    reasons:
      createAdviceReasons(
        asset,
        score
      ),

    risks:
      createAdviceRisks(
        asset,
        research,
        score
      ),

    invalidationConditions:
      createInvalidationConditions(
        research,
        score
      ),
  };
}

function resolveMarketFitScore(
  asset: InvestmentUniverseItem,
  research: StockResearchResult,
  options: GenerateDailyPicksOptions
): number {
  if (options.marketFitResolver) {
    try {
      return clampScore(
        options.marketFitResolver(
          asset,
          research
        )
      );
    } catch (error) {
      console.error(
        `${asset.symbol} 市场环境评分计算失败：`,
        error
      );
    }
  }

  return clampScore(
    options.defaultMarketFitScore ??
      DEFAULT_MARKET_FIT_SCORE
  );
}

function getAdditionalRuleRejections(
  research: StockResearchResult,
  rules: DailyScreenerRules
): RejectedCandidateReason[] {
  const reasons:
    RejectedCandidateReason[] =
    [];

  if (
    !rules.allowedSignals.includes(
      research.signal
    )
  ) {
    reasons.push(
      "signal_too_weak"
    );
  }

  if (
    rules.excludedRisks.includes(
      research.risk
    )
  ) {
    reasons.push(
      "risk_too_high"
    );
  }

  if (
    research.score.total <
    rules.minimumResearchScore
  ) {
    reasons.push(
      "score_too_low"
    );
  }

  const confidenceScore =
    research.confidence?.score ??
    0;

  if (
    confidenceScore <
    rules.minimumConfidenceScore
  ) {
    reasons.push(
      "confidence_too_low"
    );
  }

  const validCandleCount =
    getValidCandleCount(
      research.chart
    );

  if (
    validCandleCount <
    rules.minimumValidCandles
  ) {
    reasons.push(
      "insufficient_chart_data"
    );
  }

  return reasons;
}

function getPrimaryRejectionReason(
  reasons: RejectedCandidateReason[]
): RejectedCandidateReason {
  const priority:
    RejectedCandidateReason[] = [
    "disabled",
    "research_failed",
    "quote_unavailable",
    "insufficient_chart_data",
    "confidence_too_low",
    "risk_too_high",
    "liquidity_too_low",
    "signal_too_weak",
    "score_too_low",
    "duplicate_sector",
    "duplicate_asset_type",
  ];

  for (const reason of priority) {
    if (reasons.includes(reason)) {
      return reason;
    }
  }

  return (
    reasons[0] ??
    "research_failed"
  );
}

async function evaluateAsset(
  asset: InvestmentUniverseItem,
  rules: DailyScreenerRules,
  options: GenerateDailyPicksOptions
): Promise<CandidateOutcome> {
  throwIfAborted(
    options.signal
  );

  if (!asset.enabled) {
    return {
      status: "rejected",

      rejected: {
        symbol: asset.symbol,
        name: asset.name,
        reason: "disabled",
      },
    };
  }

  let research:
    StockResearchResult;

  try {
    research =
      await generateStockResearch(
        asset.symbol,
        "1y",
        "1d"
      );
  } catch (error) {
    throwIfAborted(
      options.signal
    );

    return {
      status: "rejected",

      rejected: {
        symbol: asset.symbol,
        name: asset.name,
        reason:
          "research_failed",

        detail:
          getErrorMessage(error),
      },
    };
  }

  throwIfAborted(
    options.signal
  );

  const liquidity =
    assessLiquidity(
      asset,
      research.chart
    );

  const coreEligibility =
    evaluateCoreEligibility(
      asset,
      research,
      liquidity
    );

  const additionalReasons =
    getAdditionalRuleRejections(
      research,
      rules
    );

  if (
    liquidity.averageTurnover20 ===
      null ||
    liquidity.averageTurnover20 <
      rules.minimumAverageTurnover20
  ) {
    additionalReasons.push(
      "liquidity_too_low"
    );
  }

  const rejectionReasons =
    Array.from(
      new Set([
        ...coreEligibility.reasons,
        ...additionalReasons,
      ])
    );

  if (
    rejectionReasons.length > 0
  ) {
    return {
      status: "rejected",

      rejected: {
        symbol: asset.symbol,
        name: asset.name,

        reason:
          getPrimaryRejectionReason(
            rejectionReasons
          ),

        detail:
          rejectionReasons.join(
            ", "
          ),
      },
    };
  }

  const marketFitScore =
    resolveMarketFitScore(
      asset,
      research,
      options
    );

  const score =
    calculateDailyPickScore({
      research,
      liquidity,
      marketFitScore,
      diversificationPenalty: 0,
    });

  const advice =
    createAdvice(
      asset,
      research,
      score
    );

  return {
    status: "qualified",

    candidate: {
      asset,
      research,
      liquidity,
      score,
      advice,
    },
  };
}

async function mapWithConcurrency<
  Input,
  Output
>(
  items: Input[],
  maximumConcurrency: number,
  worker: (
    item: Input,
    index: number
  ) => Promise<Output>,
  signal?: AbortSignal
): Promise<Output[]> {
  if (items.length === 0) {
    return [];
  }

  const concurrency =
    clamp(
      Math.floor(
        maximumConcurrency
      ),
      1,
      items.length
    );

  const results =
    new Array<Output>(
      items.length
    );

  let nextIndex = 0;

  async function runWorker(): Promise<void> {
    while (true) {
      throwIfAborted(signal);

      const currentIndex =
        nextIndex;

      nextIndex += 1;

      if (
        currentIndex >=
        items.length
      ) {
        return;
      }

      results[currentIndex] =
        await worker(
          items[currentIndex],
          currentIndex
        );
    }
  }

  await Promise.all(
    Array.from(
      {
        length: concurrency,
      },
      () => runWorker()
    )
  );

  return results;
}

function compareCandidates(
  first: QualifiedCandidate,
  second: QualifiedCandidate
): number {
  const scoreComparison =
    compareDailyPickScores(
      first.score,
      second.score
    );

  if (scoreComparison !== 0) {
    return scoreComparison;
  }

  return first.asset.symbol.localeCompare(
    second.asset.symbol
  );
}

function getSectorKey(
  asset: InvestmentUniverseItem
): string | null {
  const sector =
    asset.sector
      ?.trim()
      .toLowerCase();

  return sector &&
    sector.length > 0
    ? sector
    : null;
}

function selectDiversifiedPicks(
  candidates: QualifiedCandidate[],
  rules: DailyScreenerRules,
  rejected: RejectedCandidate[]
): DailyInvestmentPick[] {
  const selected:
    QualifiedCandidate[] = [];

  const sectorCounts =
    new Map<string, number>();

  const assetTypeCounts =
    new Map<string, number>();

  const sortedCandidates =
    [...candidates].sort(
      compareCandidates
    );

  for (
    const candidate of sortedCandidates
  ) {
    if (
      selected.length >=
      rules.maximumPicks
    ) {
      break;
    }

    const sectorKey =
      getSectorKey(
        candidate.asset
      );

    const existingSectorCount =
      sectorKey
        ? sectorCounts.get(
            sectorKey
          ) ?? 0
        : 0;

    if (
      sectorKey &&
      existingSectorCount >=
        rules.maximumPerSector
    ) {
      rejected.push({
        symbol:
          candidate.asset.symbol,

        name:
          candidate.asset.name,

        reason:
          "duplicate_sector",

        detail:
          candidate.asset.sector,
      });

      continue;
    }

    const assetTypeKey =
      candidate.asset.assetType;

    const existingAssetTypeCount =
      assetTypeCounts.get(
        assetTypeKey
      ) ?? 0;

    if (
      existingAssetTypeCount >=
      rules.maximumPerAssetType
    ) {
      rejected.push({
        symbol:
          candidate.asset.symbol,

        name:
          candidate.asset.name,

        reason:
          "duplicate_asset_type",

        detail:
          candidate.asset.assetType,
      });

      continue;
    }

    selected.push(candidate);

    if (sectorKey) {
      sectorCounts.set(
        sectorKey,
        existingSectorCount + 1
      );
    }

    assetTypeCounts.set(
      assetTypeKey,
      existingAssetTypeCount + 1
    );
  }

  return selected.map(
    (candidate, index) => ({
      rank: index + 1,
      ...candidate,
    })
  );
}

function createWarnings(
  report: {
    maximumPicks: number;
    picksCount: number;
    duplicateSymbols: string[];
    researchFailureCount: number;
    usesNeutralMarketFit: boolean;
  }
): string[] {
  const warnings:
    string[] = [];

  if (
    report.duplicateSymbols.length >
    0
  ) {
    warnings.push(
      `Duplicate universe symbols were skipped: ${report.duplicateSymbols.join(
        ", "
      )}.`
    );
  }

  if (
    report.researchFailureCount > 0
  ) {
    warnings.push(
      `${report.researchFailureCount} candidates could not be analyzed because market data or external services were unavailable.`
    );
  }

  if (
    report.picksCount === 0
  ) {
    warnings.push(
      "No candidate met today's screening and safety requirements."
    );
  } else if (
    report.picksCount <
    report.maximumPicks
  ) {
    warnings.push(
      `Only ${report.picksCount} candidates met today's screening and diversification requirements.`
    );
  }

  if (
    report.usesNeutralMarketFit
  ) {
    warnings.push(
      "Market-environment fit is currently treated as neutral until the market-regime module is connected."
    );
  }

  return warnings;
}

export async function generateDailyPicks(
  options: GenerateDailyPicksOptions = {}
): Promise<DailyPicksReport> {
  throwIfAborted(
    options.signal
  );

  const rules =
    normalizeRules(
      options.rules
    );

  const normalizedUniverse =
    normalizeUniverse(
      options.universe ??
        investmentUniverse
    );

  const maximumConcurrency =
    clamp(
      Math.floor(
        options.maximumConcurrency ??
          DEFAULT_MAXIMUM_CONCURRENCY
      ),
      1,
      10
    );

  const outcomes =
    await mapWithConcurrency(
      normalizedUniverse.items,
      maximumConcurrency,
      (asset) =>
        evaluateAsset(
          asset,
          rules,
          options
        ),
      options.signal
    );

  throwIfAborted(
    options.signal
  );

  const qualifiedCandidates:
    QualifiedCandidate[] = [];

  const rejected:
    RejectedCandidate[] = [];

  for (const outcome of outcomes) {
    if (
      outcome.status ===
      "qualified"
    ) {
      qualifiedCandidates.push(
        outcome.candidate
      );
    } else {
      rejected.push(
        outcome.rejected
      );
    }
  }

  const picks =
    selectDiversifiedPicks(
      qualifiedCandidates,
      rules,
      rejected
    );

  const researchFailureCount =
    rejected.filter(
      (item) =>
        item.reason ===
        "research_failed"
    ).length;

  const warnings =
    createWarnings({
      maximumPicks:
        rules.maximumPicks,

      picksCount:
        picks.length,

      duplicateSymbols:
        normalizedUniverse
          .duplicateSymbols,

      researchFailureCount,

      usesNeutralMarketFit:
        !options.marketFitResolver,
    });

  return {
    reportDate:
      getJapanReportDate(),

    generatedAt:
      new Date().toISOString(),

    selectionVersion:
      DAILY_SELECTION_VERSION,

    marketScope: [
      "japan",
      "united_states",
    ],

    rules,

    candidatesScanned:
      normalizedUniverse
        .items.length,

    qualifiedCandidates:
      qualifiedCandidates.length,

    picks,

    rejected,

    warnings,
  };
}
