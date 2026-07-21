"use client";

import { useEffect, useState } from "react";
import {
  getMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/marketService";
import { generateMarketAnalysis } from "@/lib/analysis";

type MarketAnalysis = ReturnType<
  typeof generateMarketAnalysis
>;

function formatPercent(value: unknown): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "数据不可用";
  }

  const sign = value >= 0 ? "+" : "";

  return `${sign}${value.toFixed(2)}%`;
}

function formatNumber(value: unknown): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "数据不可用";
  }

  return value.toFixed(2);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "发生未知错误";
}

export default function MorningReport() {
  const [japanTime, setJapanTime] =
    useState("");

  const [market, setMarket] =
    useState<MarketSnapshot | null>(null);

  const [analysis, setAnalysis] =
    useState<MarketAnalysis | null>(null);

  const [error, setError] =
    useState("");

  useEffect(() => {
    function updateJapanTime() {
      try {
        const now = new Date();

        const formatted =
          new Intl.DateTimeFormat("zh-CN", {
            timeZone: "Asia/Tokyo",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          }).format(now);

        setJapanTime(`${formatted} JST`);
      } catch (timeError) {
        console.error(
          "日本时间读取失败：",
          timeError
        );

        setJapanTime("日本时间读取失败");
      }
    }

    updateJapanTime();

    const timer = window.setInterval(
      updateJapanTime,
      1000
    );

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadMorningReport() {
      try {
        setError("");

        const snapshot =
          await getMarketSnapshot();

        if (cancelled) {
          return;
        }

        setMarket(snapshot);

        try {
          const generatedAnalysis =
            generateMarketAnalysis(snapshot);

          if (!cancelled) {
            setAnalysis(generatedAnalysis);
          }
        } catch (analysisError) {
          console.error(
            "市场分析生成失败：",
            analysisError
          );

          if (!cancelled) {
            setAnalysis(null);
            setError(
              `AI分析暂时无法生成：${getErrorMessage(
                analysisError
              )}`
            );
          }
        }
      } catch (marketError) {
        console.error(
          "市场数据读取失败：",
          marketError
        );

        if (!cancelled) {
          setMarket(null);
          setAnalysis(null);
          setError(
            `市场数据读取失败：${getErrorMessage(
              marketError
            )}`
          );
        }
      }
    }

    void loadMorningReport();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          margin: "0 0 12px 0",
          color: "#0b2a4a",
        }}
      >
        🌅 HIOS Morning Report
      </h2>

      <div
        style={{
          color: "#666",
          marginBottom: 16,
        }}
      >
        {japanTime || "正在读取日本时间…"}
      </div>

      {error && (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            borderRadius: 10,
            background: "#fff5f5",
            border: "1px solid #f1c2c2",
            color: "#c94343",
            lineHeight: 1.6,
          }}
        >
          {error}
        </div>
      )}

      <div style={{ lineHeight: 1.8 }}>
        <div>
          📈 Nikkei225　
          {market
            ? formatPercent(market.nikkei)
            : "..."}
        </div>

        <div>
          📈 TOPIX　　　
          {market
            ? formatPercent(market.topix)
            : "..."}
        </div>

        <div>
          💵 USDJPY　　
          {market
            ? formatNumber(market.usdJpy)
            : "..."}
        </div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div
        style={{
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        AI Summary
      </div>

      <div
        style={{
          color: "#333",
          lineHeight: 1.8,
        }}
      >
        {analysis?.summary ??
          "AI分析正在生成或暂时不可用。"}
      </div>

      {analysis?.risk && (
        <>
          <br />

          <div
            style={{
              color: "#333",
              lineHeight: 1.8,
            }}
          >
            {analysis.risk}
          </div>
        </>
      )}

      {analysis?.strategy && (
        <>
          <br />

          <div
            style={{
              color: "#333",
              lineHeight: 1.8,
            }}
          >
            {analysis.strategy}
          </div>
        </>
      )}
    </section>
  );
}
