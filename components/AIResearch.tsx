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
          当前技术趋势保持稳定，短期价格正在关键均线附近运行。
          HIOS 将继续观察价格、趋势和风险变化。
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
          若价格跌破中期均线，短期波动风险可能上升。
          投资时应注意仓位管理。
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
          建议结合趋势、成交量和个人风险承受能力，
          采用分批观察或分批建仓策略。
        </div>
      </div>
    </section>
  );
}
