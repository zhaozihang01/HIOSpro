"use client";

import { useEffect, useState } from "react";

import StockChart from "@/components/StockChart";
import { getStockData } from "@/lib/stockService";

type Props = {
  name: string;
  ticker: string;
  market: string;
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
  decision,
  summary,
}: Props) {

  const [stock, setStock] = useState<any>();

  useEffect(() => {
    getStockData(ticker)
      .then(setStock)
      .catch(console.error);
  }, [ticker]);

  if (!stock) {
    return (
      <article
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #d6e1ea",
        }}
      >
        正在读取 {ticker} ...
      </article>
    );
  }

  const change =
    stock.marketPrice - stock.previousClose;

  const changeRate =
    (change / stock.previousClose) * 100;

  return (
    <article
      style={{
        background: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #d6e1ea",
      }}
    >
      <div
        style={{
          background: "#08131d",
          color: "#fff",
          padding: 18,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2>{name}</h2>

          <div>
            {ticker} · {market}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <h2>
            {stock.marketPrice.toFixed(2)}
          </h2>

          <div
            style={{
              color:
                change >= 0
                  ? "#29c386"
                  : "#f16b6b",
            }}
          >
            {change.toFixed(2)}
            （{changeRate.toFixed(2)}%）
          </div>
        </div>
      </div>

      <div style={{ padding: 18 }}>

        <StockChart
          candles={stock.candles}
          ma5={stock.ma5}
          ma25={stock.ma25}
          ma75={stock.ma75}
        />

        <p>{summary}</p>

        <div
          style={{
            marginTop: 18,
            background:
              decisionColor[decision],
            color: "#fff",
            textAlign: "center",
            padding: 12,
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          {decision}
        </div>

      </div>
    </article>
  );
}
