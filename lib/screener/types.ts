import type {
  ResearchRisk,
  ResearchSignal,
  StockResearchResult,
} from "@/lib/research";

export type InvestmentAssetType =
  | "stock"
  | "etf"
  | "reit"
  | "infrastructure_fund"
  | "insurance_stock";

export type InvestmentMarket =
  | "japan"
  | "united_states";

export type InvestmentCurrency =
  | "JPY"
  | "USD";

export type InvestmentUniverseItem = {
  symbol: string;
  name: string;
  market: InvestmentMarket;
  exchange: string;
  currency: InvestmentCurrency;
  assetType: InvestmentAssetType;

  sector?: string;
  theme?: string;

  enabled: boolean;
};

export type DailyPickStance =
  | "positive"
  | "neutral"
  | "cautious";

export type DailyPickHorizon =
  | "short_term"
  | "medium_term"
  | "long_term";

export type DailyPickReasonCode =
  | "strong_trend"
  | "healthy_momentum"
  | "controlled_volatility"
  | "reasonable_valuation"
  | "high_liquidity"
  | "high_data_confidence"
  | "market_environment_match"
  | "diversification_value";

export type DailyPickRiskCode =
  | "overbought"
  | "trend_reversal"
  | "high_volatility"
  | "valuation_risk"
  | "low_liquidity"
  | "market_risk"
  | "currency_risk"
  | "fundamental_data_missing"
  | "sector_concentration";

export type DailyPickInvalidationCode =
  | "price_below_ma25"
  | "price_below_ma75"
  | "price_below_ma200"
  | "macd_bearish_cross"
  | "rsi_momentum_failure"
  | "confidence_below_threshold"
  | "risk_upgraded_to_very_high"
  | "liquidity_below_threshold";

export type LiquidityAssessment = {
  averageVolume20: number | null;
  averageTurnover20: number | null;
  score: number;
  passed: boolean;
};

export type DailyPickScoreBreakdown = {
  trend: number;
  momentum: number;
  volatility: number;
  valuation: number;
  liquidity: number;
  confidence: number;
  marketFit: number;

  diversificationPenalty: number;

  total: number;
};

export type DailyPickAdvice = {
  stance: DailyPickStance;
  horizon: DailyPickHorizon;

  reasons: DailyPickReasonCode[];
  risks: DailyPickRiskCode[];
  invalidationConditions:
    DailyPickInvalidationCode[];
};

export type DailyInvestmentPick = {
  rank: number;

  asset: InvestmentUniverseItem;

  research: StockResearchResult;

  liquidity: LiquidityAssessment;

  score: DailyPickScoreBreakdown;

  advice: DailyPickAdvice;
};

export type RejectedCandidateReason =
  | "disabled"
  | "research_failed"
  | "quote_unavailable"
  | "insufficient_chart_data"
  | "confidence_too_low"
  | "risk_too_high"
  | "liquidity_too_low"
  | "signal_too_weak"
  | "score_too_low"
  | "duplicate_sector"
  | "duplicate_asset_type";

export type RejectedCandidate = {
  symbol: string;
  name: string;
  reason: RejectedCandidateReason;
  detail?: string;
};

export type DailyScreenerRules = {
  maximumPicks: number;

  minimumResearchScore: number;
  minimumConfidenceScore: number;
  minimumValidCandles: number;
  minimumAverageTurnover20: number;

  allowedSignals: ResearchSignal[];
  excludedRisks: ResearchRisk[];

  maximumPerSector: number;
  maximumPerAssetType: number;
};

export type DailyPicksReport = {
  reportDate: string;
  generatedAt: string;

  selectionVersion: string;

  marketScope: InvestmentMarket[];

  rules: DailyScreenerRules;

  candidatesScanned: number;
  qualifiedCandidates: number;

  picks: DailyInvestmentPick[];

  rejected: RejectedCandidate[];

  warnings: string[];
};
