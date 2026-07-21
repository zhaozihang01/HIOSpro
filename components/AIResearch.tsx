import { generateAnalysis } from "@/lib/analysis";

import type {
  ResearchReason,
  ResearchRisk,
  ResearchSignal,
  ResearchTrend,
  StockResearchResult,
} from "@/lib/research";

type ResearchData = Pick<
  StockResearchResult,
  | "score"
  | "trend"
  | "risk"
  | "signal"
  | "reasons"
>;

type Props = {
  name: string;
  ticker: string;
  score: number;
  label: string;

  breakdown: {
    technical: number;
    trend: number;
    risk: number;
    ai: number;
  };

  research?: ResearchData;
};

type ResearchText = {
  summary: string;
  risk: string;
  strategy: string;
};

function getTrendLabel(
  trend: ResearchTrend
): string {
  switch (trend) {
    case "strong_bullish":
      return "强势上涨";

    case "bullish":
      return "偏多";

    case "bearish":
      return "偏空";

    case "strong_bearish":
      return "强势下跌";

    case "neutral":
    default:
      return "中性";
  }
}

function getRiskLabel(
  risk: ResearchRisk
): string {
  switch (risk) {
    case "low":
      return "较低";

    case "high":
      return "较高";

    case "very_high":
      return "很高";

    case "medium":
    default:
      return "中等";
  }
}

function getSignalLabel(
  signal: ResearchSignal
): string {
  switch (signal) {
    case "strong_buy":
      return "强烈买入";

    case "buy":
      return "买入";

    case "sell":
      return "卖出";

    case "strong_sell":
      return "强烈卖出";

    case "hold":
    default:
      return "持有观察";
  }
}

function translateReason(
  reason: ResearchReason
): string {
  const message =
    reason.message.toLowerCase();

  if (
    message.includes("ma20 is above ma60")
  ) {
    return "MA20位于MA60上方，中期价格趋势保持向上";
  }

  if (
    message.includes("ma20 is below ma60")
  ) {
    return "MA20位于MA60下方，中期价格趋势偏弱";
  }

  if (
    message.includes(
      "macd is above the signal line"
    )
  ) {
    return "MACD位于信号线上方，市场动量偏多";
  }

  if (
    message.includes(
      "macd is below the signal line"
    )
  ) {
    return "MACD位于信号线下方，短期动量偏弱";
  }

  if (
    message.includes(
      "macd histogram is positive"
    ) ||
    message.includes(
      "macd histogram is positive"
    )
  ) {
    return "MACD柱状图为正，买方动能占优";
  }

  if (
    message.includes(
      "macd histogram is negative"
    )
  ) {
    return "MACD柱状图为负，卖方压力有所增加";
  }

  if (
    message.includes("healthy bullish momentum") ||
    message.includes(
      "healthy momentum range"
    )
  ) {
    return "RSI处于相对健康的动量区间";
  }

  if (message.includes("overbought")) {
    return "RSI进入超买区域，短线存在回调风险";
  }

  if (message.includes("oversold")) {
    return "RSI进入超卖区域，当前动量仍然偏弱";
  }

  if (
    message.includes(
      "limited volatility"
    )
  ) {
    return "ATR相对较低，近期价格波动较为有限";
  }

  if (
    message.includes(
      "moderate price volatility"
    )
  ) {
    return "ATR显示当前价格波动处于中等水平";
  }

  if (
    message.includes(
      "very high price volatility"
    )
  ) {
    return "ATR显示当前价格波动很高";
  }

  if (
    message.includes(
      "atr is elevated"
    )
  ) {
    return "ATR相对较高，需要注意短线波动风险";
  }

  if (
    message.includes(
      "attractive valuation"
    )
  ) {
    return "当前估值处于相对有吸引力的区间";
  }

  if (
    message.includes(
      "reasonable range"
    )
  ) {
    return "当前估值处于相对合理的区间";
  }

  if (
    message.includes(
      "moderately expensive"
    )
  ) {
    return "当前估值略高，需要结合增长能力判断";
  }

  if (
    message.includes(
      "high valuation"
    )
  ) {
    return "当前估值较高，需要警惕估值回落风险";
  }

  if (
    message.includes(
      "strong capital efficiency"
    )
  ) {
    return "ROE显示公司的资本使用效率较高";
  }

  if (
    message.includes(
      "meaningful shareholder income"
    )
  ) {
    return "股息率能够提供一定的股东回报";
  }

  if (
    reason.category === "data"
  ) {
    return "部分市场或基本面数据暂时不可用";
  }

  return reason.message;
}

function getReasonTexts(
  reasons: ResearchReason[],
  impact: ResearchReason["impact"],
  limit: number
): string[] {
  return reasons
    .filter(
      (reason) =>
        reason.impact === impact
    )
    .slice(0, limit)
    .map(translateReason);
}

function joinReasons(
  reasons: string[]
): string {
  if (reasons.length === 0) {
    return "";
  }

  return `${reasons.join("；")}。`;
}

function generateResearchText(
  research: ResearchData
): ResearchText {
  const positiveReasons =
    getReasonTexts(
      research.reasons,
      "positive",
      2
    );

  const negativeReasons =
    getReasonTexts(
      research.reasons,
      "negative",
      2
    );

  const neutralReasons =
    getReasonTexts(
      research.reasons,
      "neutral",
      1
    );

  const trendLabel =
    getTrendLabel(research.trend);

  const riskLabel =
    getRiskLabel(research.risk);

  const signalLabel =
    getSignalLabel(research.signal);

  const summaryParts = [
    `HIOS Research Engine综合评分为${research.score.total}分`,
    `趋势判断为${trendLabel}`,
    `趋势分为${research.score.trend}分`,
    `动量分为${research.score.momentum}分`,
    `估值分为${research.score.valuation}分`,
  ];

  const summary =
    `${summaryParts.join("，")}。` +
    joinReasons(positiveReasons);

  const riskReason =
    negativeReasons.length > 0
      ? joinReasons(negativeReasons)
      : joinReasons(neutralReasons);

  const risk =
    `当前风险等级为${riskLabel}，` +
    `波动安全分为${research.score.volatility}分。` +
    (
      riskReason ||
      "现阶段没有发现特别突出的波动风险。"
    );

  let strategy: string;

  switch (research.signal) {
    case "strong_buy":
      strategy =
        "模型信号为强烈买入。价格趋势和综合评分表现较强，但仍建议分批建仓，并设置明确的止损位置。";
      break;

    case "buy":
      strategy =
        "模型信号为买入。可以继续关注趋势延续，并结合成交量、回调位置和个人风险承受能力分批布局。";
      break;

    case "sell":
      strategy =
        "模型信号为卖出。建议降低仓位，等待趋势和动量指标重新改善后再进行评估。";
      break;

    case "strong_sell":
      strategy =
        "模型信号为强烈卖出。当前风险与趋势结构较弱，应优先控制损失并避免盲目补仓。";
      break;

    case "hold":
    default:
      strategy =
        "模型信号为持有观察。当前条件尚不足以支持激进操作，建议等待趋势、动量或估值出现更明确的变化。";
      break;
  }

  return {
    summary,
    risk,
    strategy:
      `${strategy} 当前综合信号为${signalLabel}。`,
  };
}

export default function AIResearch({
  name,
  ticker,
  score,
  label,
  breakdown,
  research,
}: Props) {
  const analysis: ResearchText =
    research
      ? generateResearchText(research)
      : generateAnalysis(
          score,
          breakdown
        );

  return (
    <section
      style={{
        marginTop: 24,
        padding: 24,
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          color: "#0b2a4a",
        }}
      >
        AI Research
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <div
            style={{
              color: "#60758a",
              fontSize: 13,
            }}
          >
            Rating
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 800,
              color: "#11845b",
            }}
          >
            {score} / 100 ・ {label}
          </div>
        </div>

        <div>
          <div
            style={{
              color: "#60758a",
              fontSize: 13,
            }}
          >
            Symbol
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 18,
              fontWeight: 800,
              color: "#0b2a4a",
            }}
          >
            {name} ・ {ticker}
          </div>
        </div>
      </div>

      <hr
        style={{
          margin: "20px 0",
          border: 0,
          borderTop:
            "1px solid #d6e1ea",
        }}
      />

      <div
        style={{
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Summary
        </div>

        <div
          style={{
            lineHeight: 1.8,
            color: "#33495f",
          }}
        >
          {analysis.summary}
        </div>
      </div>

      <div
        style={{
          marginBottom: 18,
        }}
      >
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Risk
        </div>

        <div
          style={{
            lineHeight: 1.8,
            color: "#33495f",
          }}
        >
          {analysis.risk}
        </div>
      </div>

      <div>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Strategy
        </div>

        <div
          style={{
            lineHeight: 1.8,
            color: "#33495f",
          }}
        >
          {analysis.strategy}
        </div>
      </div>
    </section>
  );
}
