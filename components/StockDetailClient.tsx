"use client";

import {
  useEffect,
  useState,
} from "react";

import AIResearch from "@/components/AIResearch";
import MarketStats from "@/components/MarketStats";
import ResearchDisclaimer from "@/components/ResearchDisclaimer";
import StockCard from "@/components/StockCard";

import {
  getStockData,
  type StockData,
} from "@/lib/stockService";

import type {
  DataMetadata,
} from "@/lib/market/types";

import type {
  ResearchSignal,
  StockResearchResult,
} from "@/lib/research";

type Props = {
  name: string;
  ticker: string;
};

type DisplayLabel =
  | "Strong Buy"
  | "Buy"
  | "Watch"
  | "Avoid";

type MetadataCardData = {
  title: string;
  source: string;
  status: string;
  statusColor: string;
  fetchedAt: string;
};

const REQUEST_TIMEOUT_MS = 15_000;

function formatVolume(
  volume: number
): string {
  if (
    typeof volume !== "number" ||
    !Number.isFinite(volume)
  ) {
    return "--";
  }

  if (
    volume >=
    1_000_000_000_000
  ) {
    return `${(
      volume /
      1_000_000_000_000
    ).toFixed(2)}T`;
  }

  if (
    volume >=
    1_000_000_000
  ) {
    return `${(
      volume /
      1_000_000_000
    ).toFixed(2)}B`;
  }

  if (volume >= 1_000_000) {
    return `${(
      volume / 1_000_000
    ).toFixed(2)}M`;
  }

  if (volume >= 1_000) {
    return `${(
      volume / 1_000
    ).toFixed(2)}K`;
  }

  return volume.toString();
}

function formatDateTime(
  value:
    | string
    | null
    | undefined
): string {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "--";
  }

  const formatted =
    new Intl.DateTimeFormat(
      "zh-CN",
      {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }
    ).format(date);

  return `${formatted} JST`;
}

function getSourceLabel(
  source: DataMetadata["source"]
): string {
  switch (source) {
    case "yahoo":
      return "Yahoo Finance";

    case "finnhub":
      return "Finnhub";

    case "jpx":
      return "JPX";

    case "sec":
      return "SEC";

    case "edinet":
      return "EDINET";

    case "manual":
    default:
      return "Manual";
  }
}

function getStatusLabel(
  status: DataMetadata["status"]
): string {
  switch (status) {
    case "fresh":
      return "最新";

    case "delayed":
      return "延迟";

    case "stale":
      return "已过期";

    case "missing":
      return "缺失";

    case "unavailable":
    default:
      return "不可用";
  }
}

function getStatusColor(
  status: DataMetadata["status"]
): string {
  switch (status) {
    case "fresh":
      return "#11845b";

    case "delayed":
      return "#bd8400";

    case "stale":
      return "#d46b08";

    case "missing":
    case "unavailable":
    default:
      return "#c94343";
  }
}

function createMetadataCard(
  title: string,
  metadata:
    | DataMetadata
    | null
    | undefined
): MetadataCardData {
  if (!metadata) {
    return {
      title,
      source: "--",
      status: "不可用",
      statusColor: "#c94343",
      fetchedAt: "--",
    };
  }

  return {
    title,

    source:
      getSourceLabel(
        metadata.source
      ),

    status:
      getStatusLabel(
        metadata.status
      ),

    statusColor:
      getStatusColor(
        metadata.status
      ),

    /*
     * metadata.updatedAt 当前表示
     * 本次从数据源取得数据的时间。
     */
    fetchedAt:
      formatDateTime(
        metadata.updatedAt
      ),
  };
}

function getDecision(
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

function getDisplayLabel(
  signal: ResearchSignal
): DisplayLabel {
  switch (signal) {
    case "strong_buy":
      return "Strong Buy";

    case "buy":
      return "Buy";

    case "sell":
    case "strong_sell":
      return "Avoid";

    case "hold":
    default:
      return "Watch";
  }
}

function getTrendText(
  trend:
    StockResearchResult["trend"]
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

function getRiskText(
  risk:
    StockResearchResult["risk"]
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

function getResponseErrorMessage(
  status: number,
  fallback: string
): string {
  switch (status) {
    case 400:
      return "股票代码或请求参数不正确。";

    case 404:
      return "没有找到该股票代码，请确认代码是否正确。";

    case 429:
      return "行情数据请求过于频繁，请稍等片刻后重新尝试。";

    case 500:
      return "Research Engine 暂时发生内部错误，请稍后重试。";

    case 502:
    case 503:
    case 504:
      return "外部行情数据服务暂时不可用，请稍后重试。";

    default:
      return fallback;
  }
}

async function getResearchData(
  ticker: string
): Promise<StockResearchResult> {
  const controller =
    new AbortController();

  const timeoutId =
    window.setTimeout(() => {
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `/api/market/${encodeURIComponent(
        ticker
      )}`,
      {
        cache: "no-store",
        signal:
          controller.signal,
      }
    );

    if (!response.ok) {
      let message =
        getResponseErrorMessage(
          response.status,
          "Research Engine 数据读取失败。"
        );

      try {
        const body: unknown =
          await response.json();

        if (
          typeof body === "object" &&
          body !== null &&
          "error" in body &&
          typeof body.error ===
            "string" &&
          body.error.trim().length >
            0
        ) {
          message =
            getResponseErrorMessage(
              response.status,
              body.error
            );
        }
      } catch {
        // 保留状态码对应提示
      }

      throw new Error(message);
    }

    return response.json() as Promise<StockResearchResult>;
  } catch (error) {
    if (
      error instanceof DOMException &&
      error.name === "AbortError"
    ) {
      throw new Error(
        "行情数据请求超时，请检查网络后重新尝试。"
      );
    }

    if (
      error instanceof TypeError
    ) {
      throw new Error(
        "暂时无法连接行情数据服务，请检查网络后重试。"
      );
    }

    throw error;
  } finally {
    window.clearTimeout(
      timeoutId
    );
  }
}

function MetadataCard({
  item,
}: {
  item: MetadataCardData;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 12,
        border:
          "1px solid #d6e1ea",
        background: "#f5f8fb",
      }}
    >
      <div
        style={{
          color: "#0b2a4a",
          fontWeight: 800,
          marginBottom: 10,
        }}
      >
        {item.title}
      </div>

      <div
        style={{
          display: "grid",
          gap: 8,
          fontSize: 13,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              color: "#60758a",
            }}
          >
            数据来源
          </span>

          <span
            style={{
              color: "#0b2a4a",
              fontWeight: 700,
              textAlign: "right",
            }}
          >
            {item.source}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              color: "#60758a",
            }}
          >
            数据状态
          </span>

          <span
            style={{
              color:
                item.statusColor,
              fontWeight: 800,
              textAlign: "right",
            }}
          >
            {item.status}
          </span>
        </div>

        <div>
          <div
            style={{
              color: "#60758a",
              marginBottom: 4,
            }}
          >
            获取时间
          </div>

          <div
            style={{
              color: "#0b2a4a",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {item.fetchedAt}
          </div>
        </div>
      </div>
    </div>
  );
}

function DataSourcesSection({
  research,
}: {
  research:
    StockResearchResult;
}) {
  const cards: MetadataCardData[] = [
    createMetadataCard(
      "实时行情",
      research.quote?.metadata
    ),

    createMetadataCard(
      "历史K线",
      research.chart.metadata
    ),

    createMetadataCard(
      "基本面",
      research.fundamentals
        ?.metadata
    ),

    {
      title: "研究报告",
      source:
        "HIOS Research Engine",
      status: "已生成",
      statusColor: "#11845b",
      fetchedAt:
        formatDateTime(
          research.generatedAt
        ),
    },
  ];

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
      <div
        style={{
          marginBottom: 16,
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#0b2a4a",
          }}
        >
          Data Sources & Updates
        </h2>

        <div
          style={{
            marginTop: 6,
            color: "#60758a",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          数据来源、可用状态及本次获取时间
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 12,
        }}
      >
        {cards.map((item) => (
          <MetadataCard
            key={item.title}
            item={item}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 12,
          borderRadius: 10,
          background: "#f5f8fb",
          color: "#52697d",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        上述时间表示本次从数据源取得数据或生成研究报告的时间，不一定代表交易所、公司或数据提供方最后更新数据的准确时间。行情可能存在延迟。
      </div>
    </section>
  );
}

function ErrorSection({
  ticker,
  message,
  onRetry,
}: {
  ticker: string;
  message: string;
  onRetry: () => void;
}) {
  return (
    <section
      style={{
        padding: 24,
        borderRadius: 16,
        border:
          "1px solid #efc0c0",
        background: "#fff5f5",
      }}
    >
      <div
        style={{
          color: "#c94343",
          fontSize: 18,
          fontWeight: 800,
        }}
      >
        暂时无法读取 {ticker}
      </div>

      <div
        style={{
          marginTop: 10,
          color: "#7f3c3c",
          lineHeight: 1.7,
        }}
      >
        {message}
      </div>

      <div
        style={{
          marginTop: 8,
          color: "#7a6666",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        这通常是网络波动、数据源限流或外部服务暂时不可用造成的，不会影响已部署的评分逻辑。
      </div>

      <button
        type="button"
        onClick={onRetry}
        style={{
          marginTop: 18,
          minWidth: 140,
          padding: "11px 18px",
          border: 0,
          borderRadius: 10,
          background: "#0b2a4a",
          color: "#ffffff",
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        重新读取
      </button>
    </section>
  );
}

export default function StockDetailClient({
  name,
  ticker,
}: Props) {
  const [stock, setStock] =
    useState<StockData | null>(
      null
    );

  const [research, setResearch] =
    useState<StockResearchResult | null>(
      null
    );

  const [error, setError] =
    useState("");

  const [reloadKey, setReloadKey] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    setStock(null);
    setResearch(null);
    setError("");

    async function loadStockDetail() {
      try {
        const [
          stockData,
          researchData,
        ] = await Promise.all([
          getStockData(ticker),
          getResearchData(ticker),
        ]);

        if (cancelled) {
          return;
        }

        setStock(stockData);
        setResearch(
          researchData
        );
      } catch (loadError) {
        console.error(
          "股票详情读取失败：",
          loadError
        );

        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "股票详情读取失败，请稍后重试。"
          );
        }
      }
    }

    void loadStockDetail();

    return () => {
      cancelled = true;
    };
  }, [
    ticker,
    reloadKey,
  ]);

  function handleRetry() {
    setReloadKey(
      (current) =>
        current + 1
    );
  }

  if (error) {
    return (
      <ErrorSection
        ticker={ticker}
        message={error}
        onRetry={handleRetry}
      />
    );
  }

  if (!stock || !research) {
    return (
      <section
        style={{
          padding: 24,
          borderRadius: 16,
          border:
            "1px solid #d6e1ea",
          background: "#ffffff",
          color: "#52697d",
        }}
      >
        {reloadKey > 0
          ? `正在重新读取 ${ticker} 的行情与 Research Engine 分析……`
          : `正在读取 ${ticker} 的行情与 Research Engine 分析……`}
      </section>
    );
  }

  const displayName =
    research.quote?.name ||
    stock.name ||
    name;

  const stockDecision =
    getDecision(
      research.signal
    );

  const displayLabel =
    getDisplayLabel(
      research.signal
    );

  const summary =
    `Research Engine 综合评分为 ` +
    `${research.score.total} 分。` +
    `当前趋势为${getTrendText(
      research.trend
    )}，风险等级为${getRiskText(
      research.risk
    )}。`;

  const aiBreakdown = {
    technical: Math.round(
      research.score.momentum *
        0.3
    ),

    trend: Math.round(
      research.score.trend *
        0.2
    ),

    risk: Math.round(
      research.score.volatility *
        0.2
    ),

    ai: Math.round(
      research.score.valuation *
        0.3
    ),
  };

  const peRatio =
    typeof research.fundamentals
      ?.peRatio === "number" &&
    Number.isFinite(
      research.fundamentals
        .peRatio
    ) &&
    research.fundamentals
      .peRatio > 0
      ? Number(
          research.fundamentals.peRatio.toFixed(
            2
          )
        )
      : 0;

  const marketCap =
    typeof research.fundamentals
      ?.marketCap === "number" &&
    Number.isFinite(
      research.fundamentals
        .marketCap
    ) &&
    research.fundamentals
      .marketCap > 0
      ? formatVolume(
          research.fundamentals
            .marketCap
        )
      : "--";

  return (
    <>
      <StockCard
        name={displayName}
        ticker={ticker}
        market={
          ticker.endsWith(".T")
            ? "TSE"
            : "US"
        }
        decision={
          stockDecision
        }
        summary={summary}
        stockData={stock}
        researchScore={
          research.score
        }
        researchSignal={
          research.signal
        }
      />

      <AIResearch
        name={displayName}
        ticker={ticker}
        score={
          research.score.total
        }
        label={displayLabel}
        breakdown={aiBreakdown}
        research={research}
      />

      <DataSourcesSection
        research={research}
      />

      <MarketStats
        open={stock.open}
        high={stock.high}
        low={stock.low}
        volume={formatVolume(
          stock.volume
        )}
        pe={peRatio}
        marketCap={marketCap}
      />

      <ResearchDisclaimer
        version="1.0 Beta"
      />
    </>
  );
}
