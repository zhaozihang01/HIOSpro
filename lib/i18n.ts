export const SUPPORTED_LOCALES = [
  "zh",
  "ja",
] as const;

export type Locale =
  (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale =
  "zh";

export type TranslationParams =
  Record<
    string,
    string | number
  >;

export interface TranslationMessages {
  languageChinese: string;
  languageJapanese: string;
  languageSwitcherLabel: string;

  commonLoading: string;
  commonRetry: string;
  commonDelete: string;
  commonUnavailable: string;
  commonMissing: string;
  commonLatest: string;
  commonDelayed: string;
  commonStale: string;
  commonGenerated: string;
  commonScore: string;
  commonHigh: string;
  commonMedium: string;
  commonLow: string;

  homeTitle: string;
  homeSubtitle: string;
  morningReportTitle: string;
  morningReportSummaryTitle: string;
  morningReportMarketWeak: string;
  morningReportMarketStrong: string;
  morningReportMarketMixed: string;
  morningReportYenWeak: string;
  morningReportYenStrong: string;
  morningReportVolatilityHigh: string;
  morningReportStrategy: string;
  watchlistTitle: string;

  stockDetailBreadcrumbHome: string;
  stockDetailBreadcrumbDetail: string;
  stockDetailLoading: string;
  stockDetailReloading: string;
  stockDetailLoadFailed: string;
  stockDetailErrorHint: string;
  stockDetailRetry: string;

  decisionBuy: string;
  decisionWait: string;
  decisionAvoid: string;

  ratingStrongBuy: string;
  ratingBuy: string;
  ratingWatch: string;
  ratingAvoid: string;

  trendStrongBullish: string;
  trendBullish: string;
  trendNeutral: string;
  trendBearish: string;
  trendStrongBearish: string;

  riskLow: string;
  riskMedium: string;
  riskHigh: string;
  riskVeryHigh: string;

  signalStrongBuy: string;
  signalBuy: string;
  signalHold: string;
  signalSell: string;
  signalStrongSell: string;

  researchTitle: string;
  researchRating: string;
  researchSymbol: string;
  researchSummary: string;
  researchRisk: string;
  researchStrategy: string;
  researchSignalAdjustment: string;
  researchAdjustmentLowConfidence: string;
  researchAdjustmentFundamentals: string;
  researchAdjustmentGeneral: string;

  confidenceTitle: string;
  confidenceSubtitle: string;
  confidenceQuote: string;
  confidenceChart: string;
  confidenceTechnical: string;
  confidenceFundamentals: string;
  confidenceWarningTitle: string;
  confidenceFundamentalsUnavailable: string;
  confidenceChartInsufficient: string;
  confidenceChartIncomplete: string;
  confidenceQuoteUnavailable: string;
  confidencePriceUnavailable: string;
  confidenceCurrencyUnavailable: string;
  confidenceQuoteTimeUnavailable: string;
  confidenceTechnicalMissing: string;
  confidenceCoverage: string;

  dataSourcesTitle: string;
  dataSourcesSubtitle: string;
  dataSourceLabel: string;
  dataStatusLabel: string;
  dataFetchedAtLabel: string;
  dataQuoteTitle: string;
  dataChartTitle: string;
  dataFundamentalsTitle: string;
  dataResearchTitle: string;
  dataResearchSource: string;
  dataFetchDisclaimer: string;

  sourceYahoo: string;
  sourceFinnhub: string;
  sourceJpx: string;
  sourceSec: string;
  sourceEdinet: string;
  sourceManual: string;

  marketStatisticsTitle: string;
  marketOpen: string;
  marketHigh: string;
  marketLow: string;
  marketVolume: string;
  marketPe: string;
  marketCap: string;

  disclaimerTitle: string;
  disclaimerSubtitle: string;
  disclaimerVersion: string;
  disclaimerParagraphOne: string;
  disclaimerParagraphTwo: string;
  disclaimerParagraphThree: string;

  errorInvalidRequest: string;
  errorSymbolNotFound: string;
  errorRateLimited: string;
  errorInternal: string;
  errorExternalService: string;
  errorTimeout: string;
  errorNetwork: string;
  errorResearchFailed: string;
}

const zh: TranslationMessages = {
  languageChinese: "中文",
  languageJapanese: "日本語",
  languageSwitcherLabel: "语言",

  commonLoading: "正在读取",
  commonRetry: "重新读取",
  commonDelete: "删除",
  commonUnavailable: "不可用",
  commonMissing: "缺失",
  commonLatest: "最新",
  commonDelayed: "延迟",
  commonStale: "已过期",
  commonGenerated: "已生成",
  commonScore: "评分",
  commonHigh: "高",
  commonMedium: "中",
  commonLow: "低",

  homeTitle:
    "HIOS Morning Research",

  homeSubtitle:
    "专业投资研究平台",

  morningReportTitle:
    "HIOS 晨间报告",

  morningReportSummaryTitle:
    "AI 摘要",

  morningReportMarketWeak:
    "日本股市表现分化，市场方向仍需进一步确认。",

  morningReportMarketStrong:
    "日本股市整体表现较强，短期市场情绪保持积极。",

  morningReportMarketMixed:
    "主要指数走势不一，市场暂时缺少明确的统一方向。",

  morningReportYenWeak:
    "日元处于偏弱区间，出口企业可能相对受益。",

  morningReportYenStrong:
    "日元相对偏强，出口企业可能面临一定汇率压力。",

  morningReportVolatilityHigh:
    "指数波动较大，短线市场风险上升。",

  morningReportStrategy:
    "建议结合指数趋势、汇率变化和个人风险承受能力制定交易计划。",

  watchlistTitle:
    "我的自选股",

  stockDetailBreadcrumbHome:
    "首页",

  stockDetailBreadcrumbDetail:
    "股票详情",

  stockDetailLoading:
    "正在读取 {ticker} 的行情与 Research Engine 分析……",

  stockDetailReloading:
    "正在重新读取 {ticker} 的行情与 Research Engine 分析……",

  stockDetailLoadFailed:
    "暂时无法读取 {ticker}",

  stockDetailErrorHint:
    "这通常是网络波动、数据源限流或外部服务暂时不可用造成的，不会影响已部署的评分逻辑。",

  stockDetailRetry:
    "重新读取",

  decisionBuy: "买入",
  decisionWait: "等待",
  decisionAvoid: "回避",

  ratingStrongBuy:
    "强烈买入",

  ratingBuy: "买入",
  ratingWatch: "观察",
  ratingAvoid: "回避",

  trendStrongBullish:
    "强势上涨",

  trendBullish: "偏多",
  trendNeutral: "中性",
  trendBearish: "偏空",

  trendStrongBearish:
    "强势下跌",

  riskLow: "较低",
  riskMedium: "中等",
  riskHigh: "较高",
  riskVeryHigh: "很高",

  signalStrongBuy:
    "强烈买入",

  signalBuy: "买入",
  signalHold: "持有观察",
  signalSell: "卖出",

  signalStrongSell:
    "强烈卖出",

  researchTitle:
    "AI Research",

  researchRating:
    "评级",

  researchSymbol:
    "股票代码",

  researchSummary:
    "摘要",

  researchRisk:
    "风险",

  researchStrategy:
    "策略",

  researchSignalAdjustment:
    "信号调整说明",

  researchAdjustmentLowConfidence:
    "原始模型信号为{originalSignal}，但整体数据可信度低于安全标准，最终信号已限制为{finalSignal}。",

  researchAdjustmentFundamentals:
    "原始模型信号为{originalSignal}，但基本面数据完整度不足，最终信号已限制为{finalSignal}。",

  researchAdjustmentGeneral:
    "原始模型信号为{originalSignal}，由于研究数据存在限制，最终信号已调整为{finalSignal}。",

  confidenceTitle:
    "数据可信度",

  confidenceSubtitle:
    "数据完整度与研究结果可信度",

  confidenceQuote:
    "实时行情",

  confidenceChart:
    "历史K线",

  confidenceTechnical:
    "技术指标",

  confidenceFundamentals:
    "基本面",

  confidenceWarningTitle:
    "数据提示",

  confidenceFundamentalsUnavailable:
    "基本面数据不可用",

  confidenceChartInsufficient:
    "有效K线少于200根，MA200的可靠性有限",

  confidenceChartIncomplete:
    "部分历史K线的开盘、最高、最低或收盘数据不完整",

  confidenceQuoteUnavailable:
    "当前行情数据不可用",

  confidencePriceUnavailable:
    "当前市场价格不可用",

  confidenceCurrencyUnavailable:
    "行情货币信息不可用",

  confidenceQuoteTimeUnavailable:
    "行情获取时间不可用",

  confidenceTechnicalMissing:
    "缺少技术指标：{indicators}",

  confidenceCoverage:
    "基本面数据完整度为 {coverage}",

  dataSourcesTitle:
    "数据来源与获取时间",

  dataSourcesSubtitle:
    "数据来源、可用状态及本次获取时间",

  dataSourceLabel:
    "数据来源",

  dataStatusLabel:
    "数据状态",

  dataFetchedAtLabel:
    "获取时间",

  dataQuoteTitle:
    "实时行情",

  dataChartTitle:
    "历史K线",

  dataFundamentalsTitle:
    "基本面",

  dataResearchTitle:
    "研究报告",

  dataResearchSource:
    "HIOS Research Engine",

  dataFetchDisclaimer:
    "上述时间表示本次从数据源取得数据或生成研究报告的时间，不一定代表交易所、公司或数据提供方最后更新数据的准确时间。行情可能存在延迟。",

  sourceYahoo:
    "Yahoo Finance",

  sourceFinnhub:
    "Finnhub",

  sourceJpx: "JPX",
  sourceSec: "SEC",
  sourceEdinet: "EDINET",
  sourceManual: "手动数据",

  marketStatisticsTitle:
    "市场统计",

  marketOpen:
    "开盘价",

  marketHigh:
    "最高价",

  marketLow:
    "最低价",

  marketVolume:
    "成交量",

  marketPe:
    "市盈率",

  marketCap:
    "市值",

  disclaimerTitle:
    "研究免责声明",

  disclaimerSubtitle:
    "投资研究风险提示",

  disclaimerVersion:
    "引擎版本 {version}",

  disclaimerParagraphOne:
    "HIOS Research Engine 提供的评分、趋势判断、风险等级和交易信号，仅用于辅助整理公开市场数据和投资研究，不构成证券买卖建议、收益保证或个性化投资顾问服务。",

  disclaimerParagraphTwo:
    "行情、历史K线和基本面数据可能存在延迟、缺失、错误或数据源暂时不可用的情况。即使页面显示较高评分或买入信号，也不代表相关股票必然上涨。",

  disclaimerParagraphThree:
    "在作出真实投资决定前，请结合公司公告、财务报告、市场环境、持仓比例和个人风险承受能力进行独立判断。投资可能产生本金损失，最终决策和风险由使用者自行承担。",

  errorInvalidRequest:
    "股票代码或请求参数不正确。",

  errorSymbolNotFound:
    "没有找到该股票代码，请确认代码是否正确。",

  errorRateLimited:
    "行情数据请求过于频繁，请稍等片刻后重新尝试。",

  errorInternal:
    "Research Engine 暂时发生内部错误，请稍后重试。",

  errorExternalService:
    "外部行情数据服务暂时不可用，请稍后重试。",

  errorTimeout:
    "行情数据请求超时，请检查网络后重新尝试。",

  errorNetwork:
    "暂时无法连接行情数据服务，请检查网络后重试。",

  errorResearchFailed:
    "Research Engine 数据读取失败。",
};

const ja: TranslationMessages = {
  languageChinese: "中文",
  languageJapanese: "日本語",
  languageSwitcherLabel: "言語",

  commonLoading: "読み込み中",
  commonRetry: "再読み込み",
  commonDelete: "削除",
  commonUnavailable: "利用不可",
  commonMissing: "欠損",
  commonLatest: "最新",
  commonDelayed: "遅延",
  commonStale: "期限切れ",
  commonGenerated: "生成済み",
  commonScore: "スコア",
  commonHigh: "高",
  commonMedium: "中",
  commonLow: "低",

  homeTitle:
    "HIOS Morning Research",

  homeSubtitle:
    "プロフェッショナル投資リサーチプラットフォーム",

  morningReportTitle:
    "HIOS モーニングレポート",

  morningReportSummaryTitle:
    "AI サマリー",

  morningReportMarketWeak:
    "日本株市場はまちまちの動きとなっており、方向性を見極める必要があります。",

  morningReportMarketStrong:
    "日本株市場は全体的に堅調で、短期的な市場心理も良好です。",

  morningReportMarketMixed:
    "主要指数の動きが分かれており、市場全体の明確な方向性はまだ確認できません。",

  morningReportYenWeak:
    "円は弱含みで推移しており、輸出企業には相対的な追い風となる可能性があります。",

  morningReportYenStrong:
    "円は比較的強く、輸出企業には為替面で一定の負担となる可能性があります。",

  morningReportVolatilityHigh:
    "指数の変動が大きく、短期的な市場リスクが高まっています。",

  morningReportStrategy:
    "指数トレンド、為替動向、ご自身のリスク許容度を踏まえて取引計画を立てることを推奨します。",

  watchlistTitle:
    "ウォッチリスト",

  stockDetailBreadcrumbHome:
    "ホーム",

  stockDetailBreadcrumbDetail:
    "銘柄詳細",

  stockDetailLoading:
    "{ticker} の市場データと Research Engine 分析を読み込んでいます……",

  stockDetailReloading:
    "{ticker} の市場データと Research Engine 分析を再読み込みしています……",

  stockDetailLoadFailed:
    "{ticker} を一時的に読み込めません",

  stockDetailErrorHint:
    "ネットワークの変動、データソースのレート制限、または外部サービスの一時的な障害が原因である可能性があります。導入済みの評価ロジックには影響しません。",

  stockDetailRetry:
    "再読み込み",

  decisionBuy: "買い",
  decisionWait: "待機",
  decisionAvoid: "回避",

  ratingStrongBuy:
    "強い買い",

  ratingBuy: "買い",
  ratingWatch: "様子見",
  ratingAvoid: "回避",

  trendStrongBullish:
    "強い上昇",

  trendBullish: "強気",
  trendNeutral: "中立",
  trendBearish: "弱気",

  trendStrongBearish:
    "強い下落",

  riskLow: "低い",
  riskMedium: "中程度",
  riskHigh: "高い",
  riskVeryHigh: "非常に高い",

  signalStrongBuy:
    "強い買い",

  signalBuy: "買い",
  signalHold: "保有・様子見",
  signalSell: "売り",

  signalStrongSell:
    "強い売り",

  researchTitle:
    "AIリサーチ",

  researchRating:
    "評価",

  researchSymbol:
    "銘柄コード",

  researchSummary:
    "概要",

  researchRisk:
    "リスク",

  researchStrategy:
    "戦略",

  researchSignalAdjustment:
    "シグナル調整について",

  researchAdjustmentLowConfidence:
    "元のモデルシグナルは「{originalSignal}」でしたが、データ信頼度が安全基準を下回ったため、最終シグナルを「{finalSignal}」に制限しました。",

  researchAdjustmentFundamentals:
    "元のモデルシグナルは「{originalSignal}」でしたが、ファンダメンタルズデータの充足度が不足しているため、最終シグナルを「{finalSignal}」に制限しました。",

  researchAdjustmentGeneral:
    "元のモデルシグナルは「{originalSignal}」でしたが、調査データに制約があるため、最終シグナルを「{finalSignal}」に調整しました。",

  confidenceTitle:
    "データ信頼度",

  confidenceSubtitle:
    "データの充足度と分析結果の信頼性",

  confidenceQuote:
    "現在値",

  confidenceChart:
    "過去チャート",

  confidenceTechnical:
    "テクニカル指標",

  confidenceFundamentals:
    "ファンダメンタルズ",

  confidenceWarningTitle:
    "データに関する注意",

  confidenceFundamentalsUnavailable:
    "ファンダメンタルズデータを利用できません",

  confidenceChartInsufficient:
    "有効なローソク足が200本未満のため、MA200の信頼性は限定的です",

  confidenceChartIncomplete:
    "一部のローソク足で始値、高値、安値、終値のデータが欠けています",

  confidenceQuoteUnavailable:
    "現在の市場データを利用できません",

  confidencePriceUnavailable:
    "現在価格を利用できません",

  confidenceCurrencyUnavailable:
    "通貨情報を利用できません",

  confidenceQuoteTimeUnavailable:
    "データ取得時刻を利用できません",

  confidenceTechnicalMissing:
    "不足しているテクニカル指標：{indicators}",

  confidenceCoverage:
    "ファンダメンタルズデータ充足度：{coverage}",

  dataSourcesTitle:
    "データソースと取得時刻",

  dataSourcesSubtitle:
    "データソース、利用状況、今回の取得時刻",

  dataSourceLabel:
    "データソース",

  dataStatusLabel:
    "データ状態",

  dataFetchedAtLabel:
    "取得時刻",

  dataQuoteTitle:
    "現在値",

  dataChartTitle:
    "過去チャート",

  dataFundamentalsTitle:
    "ファンダメンタルズ",

  dataResearchTitle:
    "分析レポート",

  dataResearchSource:
    "HIOS Research Engine",

  dataFetchDisclaimer:
    "表示時刻は、今回データソースから情報を取得した時刻、または分析レポートを生成した時刻です。取引所、企業、データ提供元による正確な最終更新時刻を示すものではありません。市場データには遅延が生じる場合があります。",

  sourceYahoo:
    "Yahoo Finance",

  sourceFinnhub:
    "Finnhub",

  sourceJpx: "JPX",
  sourceSec: "SEC",
  sourceEdinet: "EDINET",
  sourceManual: "手動データ",

  marketStatisticsTitle:
    "市場統計",

  marketOpen:
    "始値",

  marketHigh:
    "高値",

  marketLow:
    "安値",

  marketVolume:
    "出来高",

  marketPe:
    "PER",

  marketCap:
    "時価総額",

  disclaimerTitle:
    "リサーチ免責事項",

  disclaimerSubtitle:
    "投資リサーチに関する注意事項",

  disclaimerVersion:
    "エンジン {version}",

  disclaimerParagraphOne:
    "HIOS Research Engine が提供するスコア、トレンド判断、リスク評価、売買シグナルは、公開市場データの整理と投資リサーチを補助するためのものであり、証券の売買推奨、収益保証、または個別の投資助言を目的とするものではありません。",

  disclaimerParagraphTwo:
    "市場データ、過去のローソク足、ファンダメンタルズデータには、遅延、欠損、誤り、またはデータソースの一時的な利用停止が生じる場合があります。高いスコアや買いシグナルが表示されても、対象銘柄の上昇を保証するものではありません。",

  disclaimerParagraphThree:
    "実際の投資判断を行う前に、企業の開示資料、財務報告、市場環境、保有比率、ご自身のリスク許容度を踏まえて独自に判断してください。投資では元本を失う可能性があり、最終的な判断と責任は利用者ご自身に帰属します。",

  errorInvalidRequest:
    "銘柄コードまたはリクエスト内容が正しくありません。",

  errorSymbolNotFound:
    "該当する銘柄が見つかりません。銘柄コードをご確認ください。",

  errorRateLimited:
    "市場データへのリクエストが集中しています。しばらく待ってから再度お試しください。",

  errorInternal:
    "Research Engine で一時的な内部エラーが発生しました。しばらくしてから再度お試しください。",

  errorExternalService:
    "外部の市場データサービスを一時的に利用できません。しばらくしてから再度お試しください。",

  errorTimeout:
    "市場データの取得がタイムアウトしました。ネットワーク接続を確認して再度お試しください。",

  errorNetwork:
    "市場データサービスに接続できません。ネットワーク接続を確認して再度お試しください。",

  errorResearchFailed:
    "Research Engine のデータ取得に失敗しました。",
};

export const translations: Record<
  Locale,
  TranslationMessages
> = {
  zh,
  ja,
};

export function isLocale(
  value: unknown
): value is Locale {
  return (
    typeof value === "string" &&
    SUPPORTED_LOCALES.includes(
      value as Locale
    )
  );
}

export function normalizeLocale(
  value: unknown
): Locale {
  if (isLocale(value)) {
    return value;
  }

  return DEFAULT_LOCALE;
}

export function detectLocaleFromLanguage(
  language:
    | string
    | null
    | undefined
): Locale {
  if (!language) {
    return DEFAULT_LOCALE;
  }

  const normalized =
    language.toLowerCase();

  if (
    normalized.startsWith("ja")
  ) {
    return "ja";
  }

  return "zh";
}

export function getTranslations(
  locale: Locale
): TranslationMessages {
  return translations[locale];
}

export function translate(
  locale: Locale,
  key: keyof TranslationMessages,
  params?: TranslationParams
): string {
  const template =
    translations[locale][key];

  if (!params) {
    return template;
  }

  return Object.entries(
    params
  ).reduce(
    (
      result,
      [paramKey, value]
    ) => {
      return result.replaceAll(
        `{${paramKey}}`,
        String(value)
      );
    },
    template
  );
}
