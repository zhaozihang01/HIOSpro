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
  | "confidence"
  | "signalAdjustment"
>;

type ConfidenceData = NonNullable<
  StockResearchResult["confidence"]
>;

type SignalAdjustmentData =
  NonNullable<
    StockResearchResult["signalAdjustment"]
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

type ConfidenceWarningItem = {
  key: string;
  text: string;
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

function getConfidenceLabel(
  level: ConfidenceData["level"]
): string {
  switch (level) {
    case "high":
      return "高";

    case "medium":
      return "中";

    case "low":
    default:
      return "低";
  }
}

function getConfidenceColor(
  level: ConfidenceData["level"]
): string {
  switch (level) {
    case "high":
      return "#11845b";

    case "medium":
      return "#bd8400";

    case "low":
    default:
      return "#c94343";
  }
}

function getSignalAdjustmentText(
  adjustment:
    | SignalAdjustmentData
    | undefined
): string | null {
  if (
    !adjustment ||
    !adjustment.applied
  ) {
    return null;
  }

  const originalSignal =
    getSignalLabel(
      adjustment.originalSignal
    );

  const finalSignal =
    getSignalLabel(
      adjustment.finalSignal
    );

  switch (adjustment.reason) {
    case "low_confidence":
      return (
        `原始模型信号为${originalSignal}，` +
        `但整体数据可信度低于安全标准，` +
        `最终信号已限制为${finalSignal}。`
      );

    case "insufficient_fundamentals":
      return (
        `原始模型信号为${originalSignal}，` +
        `但基本面数据完整度不足，` +
        `最终信号已限制为${finalSignal}。`
      );

    default:
      return (
        `原始模型信号为${originalSignal}，` +
        `由于研究数据存在限制，` +
        `最终信号已调整为${finalSignal}。`
      );
  }
}

function getConfidenceWarningItem(
  warning: string
): ConfidenceWarningItem {
  const message =
    warning.toLowerCase();

  if (
    message.includes(
      "current quote data is unavailable"
    )
  ) {
    return {
      key: "quote-unavailable",
      text: "当前行情数据不可用",
    };
  }

  if (
    message.includes(
      "current market price is unavailable"
    )
  ) {
    return {
      key: "price-unavailable",
      text: "当前市场价格不可用",
    };
  }

  if (
    message.includes(
      "quote currency information is unavailable"
    )
  ) {
    return {
      key: "currency-unavailable",
      text: "行情货币信息不可用",
    };
  }

  if (
    message.includes(
      "quote update time is unavailable"
    )
  ) {
    return {
      key: "quote-time-unavailable",
      text: "行情更新时间不可用",
    };
  }

  if (
    message.includes(
      "historical chart data is unavailable"
    )
  ) {
    return {
      key: "chart-unavailable",
      text: "历史K线数据不可用",
    };
  }

  if (
    message.includes(
      "fewer than 200 valid candles"
    )
  ) {
    return {
      key: "chart-less-than-200",
      text:
        "有效K线少于200根，MA200的可靠性有限",
    };
  }

  if (
    message.includes(
      "incomplete ohlc data"
    )
  ) {
    return {
      key: "chart-incomplete-ohlc",
      text:
        "部分历史K线的开盘、最高、最低或收盘数据不完整",
    };
  }

  if (
    message.includes(
      "missing technical indicators"
    )
  ) {
    const separatorIndex =
      warning.indexOf(":");

    const indicators =
      separatorIndex >= 0
        ? warning
            .slice(
              separatorIndex + 1
            )
            .replace(/\.$/, "")
            .trim()
        : "";

    return {
      key: "technical-missing",
      text: indicators
        ? `缺少技术指标：${indicators}`
        : "部分技术指标不可用",
    };
  }

  if (
    message.includes(
      "fundamental data is unavailable"
    ) ||
    message.includes(
      "fundamentals are unavailable"
    ) ||
    message.includes(
      "fundamental information is unavailable"
    ) ||
    message.includes(
      "no fundamental data"
    ) ||
    (
      message.includes(
        "fundamental"
      ) &&
      message.includes(
        "unavailable"
      )
    )
  ) {
    return {
      key: "fundamentals-unavailable",
      text: "基本面数据不可用",
    };
  }

  if (
    message.includes(
      "fundamental data coverage is"
    )
  ) {
    const coverage =
      warning.match(
        /\d+\s*\/\s*\d+/
      )?.[0];

    return {
      key: "fundamentals-coverage",
      text: coverage
        ? `基本面数据完整度为 ${coverage}`
        : "部分基本面指标缺失",
    };
  }

  if (
    message.includes(
      "finnhub_api_key is not configured"
    )
  ) {
    return {
      key: "finnhub-not-configured",
      text: "Finnhub数据源暂未配置",
    };
  }

  return {
    key: `other-${message.trim()}`,
    text: warning,
  };
}

function getUniqueConfidenceWarnings(
  warnings: string[]
): string[] {
  const warningMap =
    new Map<string, string>();

  for (const warning of warnings) {
    const item =
      getConfidenceWarningItem(
        warning
      );

    if (
      !warningMap.has(item.key)
    ) {
      warningMap.set(
        item.key,
        item.text
      );
    }
  }

  /*
   * 如果已经明确显示“基本面数据不可用”，
   * 就不再同时显示基本面覆盖率提示，
   * 避免表达重复。
   */
  if (
    warningMap.has(
      "fundamentals-unavailable"
    )
  ) {
    warningMap.delete(
      "fundamentals-coverage"
    );
  }

  return Array.from(
    warningMap.values()
  );
}

function translateReason(
  reason: ResearchReason
): string {
  const message =
    reason.message.toLowerCase();

  if (
    message.includes(
      "ma25 is above ma75"
    )
  ) {
    return "MA25位于MA75上方，中期趋势保持向上";
  }

  if (
    message.includes(
      "ma25 is below ma75"
    )
  ) {
    return "MA25位于MA75下方，中期趋势相对偏弱";
  }

  if (
    message.includes(
      "ma25 and ma75 are close"
    )
  ) {
    return "MA25与MA75较为接近，中期趋势方向暂不明确";
  }

  if (
    message.includes(
      "ma75 is above ma200"
    )
  ) {
    return "MA75位于MA200上方，长期市场结构保持积极";
  }

  if (
    message.includes(
      "ma75 is below ma200"
    )
  ) {
    return "MA75位于MA200下方，长期市场结构相对偏弱";
  }

  if (
    message.includes(
      "ma75 and ma200 are close"
    )
  ) {
    return "MA75与MA200较为接近，长期趋势仍处于方向选择阶段";
  }

  if (
    message.includes(
      "current price is above ma25"
    )
  ) {
    return "当前股价位于MA25上方，短期价格位置偏强";
  }

  if (
    message.includes(
      "current price is below ma25"
    )
  ) {
    return "当前股价位于MA25下方，短期价格位置偏弱";
  }

  if (
    message.includes(
      "current price is above ma75"
    )
  ) {
    return "当前股价位于MA75上方，中期价格结构保持积极";
  }

  if (
    message.includes(
      "current price is below ma75"
    )
  ) {
    return "当前股价位于MA75下方，中期价格结构相对偏弱";
  }

  if (
    message.includes(
      "current price is above ma200"
    )
  ) {
    return "当前股价位于MA200上方，长期价格结构保持积极";
  }

  if (
    message.includes(
      "current price is below ma200"
    )
  ) {
    return "当前股价位于MA200下方，长期价格结构相对偏弱";
  }

  if (
    message.includes(
      "ma25 or ma75 data is unavailable"
    )
  ) {
    return "MA25或MA75数据暂时不足，中期趋势无法完整判断";
  }

  if (
    message.includes(
      "ma200 data is unavailable"
    )
  ) {
    return "MA200数据暂时不足，长期趋势无法完整判断";
  }

  if (
    message.includes(
      "current price data was not provided"
    )
  ) {
    return "当前价格数据暂时不可用，无法判断股价与均线的位置关系";
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
    message.includes(
      "healthy momentum range"
    )
  ) {
    return "RSI处于相对健康的动量区间";
  }

  if (
    message.includes(
      "approaching an overbought level"
    )
  ) {
    return "RSI显示动量较强，但正在接近超买区域";
  }

  if (
    message.includes(
      "overbought"
    )
  ) {
    return "RSI进入超买区域，短线存在回调风险";
  }

  if (
    message.includes(
      "oversold"
    )
  ) {
    return "RSI进入超卖区域，当前动量仍然偏弱";
  }

  if (
    message.includes(
      "relatively weak momentum"
    )
  ) {
    return "RSI显示当前市场动量相对偏弱";
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
    return "当前估值略高，需要结合增长能力进一步判断";
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
      "acceptable capital efficiency"
    )
  ) {
    return "ROE显示公司的资本使用效率处于合理水平";
  }

  if (
    message.includes(
      "negative roe"
    )
  ) {
    return "ROE为负，公司的盈利能力需要进一步观察";
  }

  if (
    message.includes(
      "meaningful shareholder income"
    )
  ) {
    return "股息率能够提供一定的股东回报";
  }

  if (
    message.includes(
      "moderate dividend yield"
    )
  ) {
    return "公司提供相对适中的股息回报";
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
      4
    );

  const negativeReasons =
    getReasonTexts(
      research.reasons,
      "negative",
      3
    );

  const neutralReasons =
    getReasonTexts(
      research.reasons,
      "neutral",
      2
    );

  const trendLabel =
    getTrendLabel(
      research.trend
    );

  const riskLabel =
    getRiskLabel(
      research.risk
    );

  const signalLabel =
    getSignalLabel(
      research.signal
    );

  const summary =
    `HIOS Research Engine综合评分为` +
    `${research.score.total}分，` +
    `趋势判断为${trendLabel}。` +
    `趋势分为${research.score.trend}分，` +
    `动量分为${research.score.momentum}分，` +
    `估值分为${research.score.valuation}分。` +
    joinReasons(
      positiveReasons
    );

  const riskReason =
    negativeReasons.length > 0
      ? joinReasons(
          negativeReasons
        )
      : joinReasons(
          neutralReasons
        );

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
      `${strategy}当前综合信号为${signalLabel}。`,
  };
}

function SignalAdjustmentNotice({
  adjustment,
}: {
  adjustment:
    SignalAdjustmentData;
}) {
  const text =
    getSignalAdjustmentText(
      adjustment
    );

  if (!text) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: 20,
        padding: 14,
        borderRadius: 10,
        background: "#fff8e8",
        border:
          "1px solid #ead49b",
        color: "#735313",
        lineHeight: 1.7,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        信号调整说明
      </div>

      <div>{text}</div>
    </div>
  );
}

function ConfidenceSection({
  confidence,
}: {
  confidence: ConfidenceData;
}) {
  const breakdownItems = [
    {
      label: "实时行情",
      value:
        confidence.breakdown.quote,
    },
    {
      label: "历史K线",
      value:
        confidence.breakdown.chart,
    },
    {
      label: "技术指标",
      value:
        confidence.breakdown.technical,
    },
    {
      label: "基本面",
      value:
        confidence.breakdown.fundamentals,
    },
  ];

  const translatedWarnings =
    getUniqueConfidenceWarnings(
      confidence.warnings
    );

  return (
    <>
      <hr
        style={{
          margin: "20px 0",
          border: 0,
          borderTop:
            "1px solid #d6e1ea",
        }}
      />

      <div>
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 800,
                color: "#0b2a4a",
              }}
            >
              Data Confidence
            </div>

            <div
              style={{
                marginTop: 4,
                color: "#60758a",
                fontSize: 13,
              }}
            >
              数据完整度与研究结果可信度
            </div>
          </div>

          <div
            style={{
              color:
                getConfidenceColor(
                  confidence.level
                ),
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            {confidence.score} / 100
            {" ・ "}
            {getConfidenceLabel(
              confidence.level
            )}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {breakdownItems.map(
            (item) => (
              <div
                key={item.label}
                style={{
                  padding: 12,
                  borderRadius: 10,
                  background:
                    "#f5f8fb",
                  border:
                    "1px solid #d6e1ea",
                }}
              >
                <div
                  style={{
                    color:
                      "#60758a",
                    fontSize: 12,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color:
                      "#0b2a4a",
                    fontSize: 18,
                    fontWeight: 800,
                  }}
                >
                  {item.value} / 100
                </div>
              </div>
            )
          )}
        </div>

        {translatedWarnings.length >
          0 && (
          <div
            style={{
              marginTop: 14,
              padding: 12,
              borderRadius: 10,
              background:
                "#fff8e8",
              border:
                "1px solid #ead49b",
              color: "#735313",
              lineHeight: 1.7,
            }}
          >
            <div
              style={{
                fontWeight: 800,
                marginBottom: 6,
              }}
            >
              数据提示
            </div>

            {translatedWarnings.map(
              (warning) => (
                <div key={warning}>
                  ・{warning}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </>
  );
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
      ? generateResearchText(
          research
        )
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
        border:
          "1px solid #d6e1ea",
        borderRadius: 16,
      }}
    >
      <h2
        style={{
          margin:
            "0 0 16px 0",
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

      {research
        ?.signalAdjustment
        ?.applied && (
        <SignalAdjustmentNotice
          adjustment={
            research.signalAdjustment
          }
        />
      )}

      {research?.confidence && (
        <ConfidenceSection
          confidence={
            research.confidence
          }
        />
      )}
    </section>
  );
}
