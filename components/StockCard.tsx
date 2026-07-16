type StockCardProps = {
  name: string;
  ticker: string;
  market: string;
  price: string;
  change: string;
  decision: "BUY" | "WAIT" | "AVOID";
  summary: string;
};

const decisionColor = {
  BUY: "#11845b",
  WAIT: "#bd8400",
  AVOID: "#c94343",
};

export default function StockCard({
  name,
  ticker,
  market,
  price,
  change,
  decision,
  summary,
}: StockCardProps) {
  const isPositive = !change.startsWith("-");

  return (
    <article
      style={{
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 24px rgba(20, 48, 72, 0.08)",
      }}
    >
      <div
        style={{
          background: "#08131d",
          color: "#ffffff",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: "20px",
            }}
          >
            {name}
          </h2>

          <p
            style={{
              margin: "5px 0 0",
              color: "#a8bfd1",
              fontSize: "13px",
            }}
          >
            {ticker} · {market}
          </p>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <strong
            style={{
              fontSize: "18px",
            }}
          >
            {price}
          </strong>

          <div
            style={{
              marginTop: "5px",
              color: isPositive ? "#29c386" : "#f16b6b",
              fontWeight: 700,
            }}
          >
            {change}
          </div>
        </div>
      </div>

      <div
        style={{
          padding: "18px",
        }}
      >
        <div
          style={{
            height: "190px",
            borderRadius: "12px",
            background:
              "linear-gradient(180deg, #f7fafc 0%, #edf3f8 100%)",
            border: "1px solid #dce6ee",
            display: "grid",
            placeItems: "center",
            color: "#62788c",
            fontWeight: 700,
          }}
        >
          真实K线图区域
        </div>

        <p
          style={{
            color: "#52697d",
            lineHeight: 1.65,
            fontSize: "14px",
          }}
        >
          {summary}
        </p>

        <div
          style={{
            background: decisionColor[decision],
            color: "#ffffff",
            borderRadius: "10px",
            padding: "11px",
            textAlign: "center",
            fontWeight: 900,
          }}
        >
          {decision}
        </div>
      </div>
    </article>
  );
}
