"use client";

import { useEffect, useState } from "react";

import StockChart from "@/components/StockChart";

import type {
  ResearchScore,
  ResearchSignal,
} from "@/lib/research";

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
  stockData?: StockData;
  researchScore?: ResearchScore;
  researchSignal?: ResearchSignal;
};

const decisionColor = {
  BUY: "#11845b",
  WAIT: "#bd8400",
  AVOID: "#c94343",
};

function getSignalLabel(
  signal: ResearchSignal
): string {
  switch (signal) {
    case "strong_buy":
      return "Strong Buy";

    case "buy":
      return "Buy";

    case "hold":
      return "Watch";

    case "sell":
      return "Sell";

    case "strong_sell":
      return "Strong Sell";

    default:
      return "Watch";
  }
}

function getDecisionFromSignal(
  signal: ResearchSignal
): "BUY" | "WAIT" | "AVOID" {
  if (
    signal === "strong_buy" ||
    signal === "buy"
  ) {
    return "BUY";
  }

  if (
    signal === "sell" ||
    signal === "strong_sell"
  ) {
    return "AVOID";
  }

  return "WAIT";
}

function getScoreStars(score: number): number {
  const stars = Math.round(score / 20);

  return Math.max(
    0,
    Math.min(5, stars)
  );
}

export default function StockCard({
  name,
  ticker,
  market,
  decision,
  summary,
  stockData,
  researchScore,
  researchSignal,
}: Props) {
  const [loadedStock, setLoadedStock] =
    useState<StockData | null>(
      stockData ?? null
    );

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (stockData) {
      setLoadedStock(stockData);
      setError("");
      return;
    }

    let cancelled = false;

    setLoadedStock(null);
    setError("");

    getStockData(ticker)
      .then((data) => {
        if (!cancelled) {
          setLoadedStock(data);
        }
      })
      .catch((loadError: unknown) => {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "行情数据读取失败"
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, [ticker, stockData]);

  const stock =
    stockData ?? loadedStock;

  const hasResearch =
    researchScore !== undefined &&
    researchSignal !== undefined;

  const displayScore =
    researchScore?.total ?? null;

  const displayLabel =
    researchSignal
      ? getSignalLabel(researchSignal)
      : "Analyzing";

  const displayStars =
    displayScore !== null
      ? getScoreStars(displayScore)
      : 0;

  const displayDecision =
    researchSignal
      ? getDecisionFromSignal(
          researchSignal
        )
      : decision;

  const breakdownItems =
    researchScore
      ? [
          {
            label: "Trend",
            value: researchScore.trend,
          },
          {
            label: "Momentum",
            value:
              researchScore.momentum,
          },
          {
            label: "Volatility",
            value:
              researchScore.volatility,
          },
          {
            label: "Valuation",
            value:
              researchScore.valuation,
          },
        ]
      : [];

  if (error) {
    return (
      <article
        style={{
          background: "#ffffff",
          borderRadius: 16,
          padding: 24,
          border:
            "1px solid #d6e1ea",
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
          border:
            "1px solid #d6e1ea",
        }}
      >
        正在读取 {ticker} 的真实行情……
      </article>
    );
  }

  const change =
    stock.marketPrice -
    stock.previousClose;

  const changeRate =
    stock.previousClose !== 0
      ? (
          change /
          stock.previousClose
        ) * 100
      : 0;

  return (
    <article
      style={{
        background: "#ffffff",
        borderRadius: 16,
        overflow: "hidden",
        border:
          "1px solid #d6e1ea",
      }}
    >
      <div
        style={{
          background: "#08131d",
          color: "#ffffff",
          padding: 18,
          display: "flex",
          justifyContent:
            "space-between",
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
              fontSize: 14,
              color: hasResearch
                ? "#4caf50"
                : "#a8bfd1",
              fontWeight: 700,
            }}
          >
            {hasResearch ? (
              <>
                {"★".repeat(
                  displayStars
                )}
                {"☆".repeat(
                  5 - displayStars
                )}
                {"  "}
                HIOS Score:{" "}
                {displayScore} / 100
                {" ・ "}
                {displayLabel}
              </>
            ) : (
              <>
                ☆☆☆☆☆{"  "}
                HIOS Score:
                Research Engine
                分析中……
              </>
            )}
          </div>

          {breakdownItems.length >
          0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(4, minmax(0, 1fr))",
                gap: 12,
                marginTop: 12,
              }}
            >
              {breakdownItems.map(
                (item) => (
                  <div
                    key={item.label}
                    style={{
                      fontSize: 12,
                      color: "#a8bfd1",
                    }}
                  >
                    {item.label}

                    <div
                      style={{
                        color:
                          "#ffffff",
                        fontWeight: 700,
                      }}
                    >
                      {item.value} / 100
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: "#a8bfd1",
              }}
            >
              正在计算趋势、动量、波动与估值评分……
            </div>
          )}

          <div
            style={{
              marginTop: 10,
              color: "#a8bfd1",
            }}
          >
            {ticker} ·{" "}
            {stock.exchange || market}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {stock.currency}{" "}
            {stock.marketPrice.toFixed(
              2
            )}
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
            （
            {changeRate.toFixed(2)}
            %）
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
            background:
              decisionColor[
                displayDecision
              ],
            color: "#ffffff",
            textAlign: "center",
            padding: 12,
            borderRadius: 10,
            fontWeight: 700,
          }}
        >
          {hasResearch
            ? displayDecision
            : "ANALYZING"}
        </div>
      </div>
    </article>
  );
}
