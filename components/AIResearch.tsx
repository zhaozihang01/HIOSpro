type Props = {
  name: string;
  ticker: string;
  score: number;
  label: string;
};

export default function AIResearch({
  name,
  ticker,
  score,
  label,
}: Props) {
    const analysis =
    score >= 90
      ? {
          summary: `${name} 当前趋势强劲，HIOS 评分较高，价格结构保持多头状态。`,
          risk: "短期涨幅较大时可能出现回调，应注意追高风险。",
          strategy: "可继续重点关注，适合采用分批建仓或持有策略。",
        }
      : score >= 80
      ? {
          summary: `${name} 当前趋势较为稳定，技术指标整体偏强。`,
          risk: "若价格跌破中期均线，短期风险可能上升。",
          strategy: "建议等待合适位置分批布局，并控制仓位。",
        }
      : score >= 65
      ? {
          summary: `${name} 当前处于观察阶段，趋势方向尚未完全确认。`,
          risk: "价格波动较大，均线支撑仍需进一步确认。",
          strategy: "暂时保持观察，等待趋势和成交量出现更清晰信号。",
        }
      : {
          summary: `${name} 当前技术趋势偏弱，HIOS 评分较低。`,
          risk: "下行风险较高，价格可能继续承压。",
          strategy: "建议避免追入，优先控制风险并等待趋势改善。",
        };
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
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <div style={{ color: "#60758a", fontSize: 13 }}>
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
          <div style={{ color: "#60758a", fontSize: 13 }}>
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
          borderTop: "1px solid #d6e1ea",
        }}
      />

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Summary
        </div>

       <div style={{ lineHeight: 1.8, color: "#33495f" }}>
  {analysis.summary}
</div> 
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Risk
        </div>

       <div style={{ lineHeight: 1.8, color: "#33495f" }}>
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

        <div style={{ lineHeight: 1.8, color: "#33495f" }}>
  {analysis.strategy}
</div>
      </div>
    </section>
  );
}
