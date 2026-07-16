"use client";

import { useEffect, useState } from "react";
import StockChart from "@/components/StockChart";
import {
  getStockData,
  type StockData,
} from "@/lib/stockService";

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
  const [stock, setStock] = useState<StockData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setStock(null);
    setError("");

    getStockData(ticker)
      .then(setStock)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "行情数据读取失败"
        );
      });
  }, [ticker]);

  if (error) {
    return (
      <article
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #d6e1ea",
          color: "#c94343",
        }}
      >
        {ticker}：{error}
      </article>
    );
  }

  if (!stock) {
    return (
      <article
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          border: "1px solid #d6e1ea",
        }}
      >
        正在读取 {ticker} 的真实行情……
      </article>
    );
  }

  const change = stock.marketPrice - stock.previousClose;
  const changeRate =
    stock.previousClose !== 0
      ? (change / stock.previousClose) * 100
      : 0;

  return (
    <article
      style={{
        background: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid #d6e1ea",
      }}
    >
      <div
        style={{
          background: "#08131d",
          color: "#ffffff",
          padding: 18,
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>
            {name}
          </h2>

          <div
            style={{
              marginTop: 6,
              color: "#a8bfd1",
            }}
          >
            {ticker} · {stock.exchange || market}
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <h2 style={{ margin: 0 }}>
            {stock.currency}{" "}
            {stock.marketPrice.toFixed(2)}
          </h2>

          <div
            style={{
              marginTop: 6,
              color:
                change >= 0
                  ? "#29c386"
                  : "#f16b6b",
            }}
          >
            {change >= 0 ? "+" : ""}
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

        <p
          style={{
            color: "#52697d",
            lineHeight: 1.65,
          }}
        >
          {summary}
        </p>

        <div
          style={{
            marginTop: 18,
            background: decisionColor[decision],
            color: "#ffffff",
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
