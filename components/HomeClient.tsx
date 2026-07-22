"use client";

import {
  useEffect,
  useState,
} from "react";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";
import MorningReport from "@/components/MorningReport";
import StockCard from "@/components/StockCard";
import StockSearch from "@/components/StockSearch";
import Watchlist from "@/components/Watchlist";

import { defaultWatchlist } from "@/data/watchlist";

import type {
  Locale,
  TranslationMessages,
  TranslationParams,
} from "@/lib/i18n";

import type {
  ResearchRisk,
  ResearchSignal,
  ResearchTrend,
  StockResearchResult,
} from "@/lib/research";

const STORAGE_KEY =
  "hios-watchlist";

type WatchlistStock = {
  name: string;
  ticker: string;
  market: string;
};

type ResearchMap = Record<
  string,
  StockResearchResult
>;

type ResearchErrorMap = Record<
  string,
  string
>;

type TranslateFunction = (
  key: keyof TranslationMessages,
  params?: TranslationParams
) => string;

function normalizeTicker(
  ticker: string
): string {
  return ticker
    .trim()
    .toUpperCase();
}

function getErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim().length > 0
  ) {
    return error.message;
  }

  return "Unknown error";
}

function isValidWatchlistStock(
  value: unknown
): value is WatchlistStock {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const stock =
    value as Partial<WatchlistStock>;

  return (
    typeof stock.name === "string" &&
    stock.name.trim().length > 0 &&
    typeof stock.ticker === "string" &&
    stock.ticker.trim().length > 0 &&
    typeof stock.market === "string" &&
    stock.market.trim().length > 0
  );
}

function normalizeWatchlistStock(
  stock: WatchlistStock
): WatchlistStock {
  return {
    name: stock.name.trim(),

    ticker:
      normalizeTicker(
        stock.ticker
      ),

    market:
      stock.market.trim(),
  };
}

function getTrendText(
  trend: ResearchTrend,
  t: TranslateFunction
): string {
  switch (trend) {
    case "strong_bullish":
      return t(
        "trendStrongBullish"
      );

    case "bullish":
      return t(
        "trendBullish"
      );

    case "bearish":
      return t(
        "trendBearish"
      );

    case "strong_bearish":
      return t(
        "trendStrongBearish"
      );

    case "neutral":
    default:
      return t(
        "trendNeutral"
      );
  }
}

function getRiskText(
  risk: ResearchRisk,
  t: TranslateFunction
): string {
  switch (risk) {
    case "low":
      return t("riskLow");

    case "high":
      return t("riskHigh");

    case "very_high":
      return t(
        "riskVeryHigh"
      );

    case "medium":
    default:
      return t(
        "riskMedium"
      );
  }
}

function getSignalText(
  signal: ResearchSignal,
  t: TranslateFunction
): string {
  switch (signal) {
    case "strong_buy":
      return t(
        "signalStrongBuy"
      );

    case "buy":
      return t("signalBuy");

    case "sell":
      return t(
        "signalSell"
      );

    case "strong_sell":
      return t(
        "signalStrongSell"
      );

    case "hold":
    default:
      return t(
        "signalHold"
      );
  }
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

function createResearchSummary(
  research: StockResearchResult,
  locale: Locale,
  t: TranslateFunction
): string {
  const trend =
    getTrendText(
      research.trend,
      t
    );

  const risk =
    getRiskText(
      research.risk,
      t
    );

  const signal =
    getSignalText(
      research.signal,
      t
    );

  if (locale === "ja") {
    return (
      `Research Engine の総合スコアは` +
      `${research.score.total}点です。` +
      `現在のトレンドは「${trend}」、` +
      `リスク水準は「${risk}」、` +
      `総合シグナルは「${signal}」です。`
    );
  }

  return (
    `Research Engine 综合评分为` +
    `${research.score.total}分。` +
    `当前趋势为${trend}，` +
    `风险等级为${risk}，` +
    `综合信号为${signal}。`
  );
}

function getLoadingSummary(
  locale: Locale
): string {
  if (locale === "ja") {
    return (
      "Research Engine が、" +
      "この銘柄のトレンド、モメンタム、" +
      "価格変動、バリュエーションを分析しています……"
    );
  }

  return (
    "Research Engine " +
    "正在分析该股票的趋势、" +
    "动量、波动与估值数据……"
  );
}

function getFailedSummary(
  error: string,
  locale: Locale,
  t: TranslateFunction
): string {
  const normalizedError =
    error.trim();

  const detail =
    normalizedError ===
      "Unknown error" ||
    normalizedError ===
      "Research Engine data request failed."
      ? t(
          "errorResearchFailed"
        )
      : normalizedError;

  if (locale === "ja") {
    return (
      "Research Engine の分析を" +
      `一時的に完了できません：${detail}`
    );
  }

  return (
    "Research Engine " +
    `暂时无法完成分析：${detail}`
  );
}

async function getResearch(
  ticker: string
): Promise<StockResearchResult> {
  const response = await fetch(
    `/api/market/${encodeURIComponent(
      ticker
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message =
      "Research Engine data request failed.";

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
          body.error;
      }
    } catch {
      // 返回内容不是JSON时保留默认错误信息
    }

    throw new Error(message);
  }

  return response.json() as Promise<StockResearchResult>;
}

export default function HomeClient() {
  const {
    locale,
    t,
  } = useLanguage();

  const [stocks, setStocks] =
    useState<WatchlistStock[]>(
      defaultWatchlist.map(
        normalizeWatchlistStock
      )
    );

  const [
    researchMap,
    setResearchMap,
  ] = useState<ResearchMap>({});

  const [
    researchErrorMap,
    setResearchErrorMap,
  ] = useState<ResearchErrorMap>(
    {}
  );

  const [
    storageLoaded,
    setStorageLoaded,
  ] = useState(false);

  function handleRemove(
    ticker: string
  ) {
    const normalizedTicker =
      normalizeTicker(ticker);

    setStocks((current) =>
      current.filter(
        (stock) =>
          normalizeTicker(
            stock.ticker
          ) !== normalizedTicker
      )
    );

    setResearchMap(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          normalizedTicker
        ];

        return next;
      }
    );

    setResearchErrorMap(
      (current) => {
        const next = {
          ...current,
        };

        delete next[
          normalizedTicker
        ];

        return next;
      }
    );
  }

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(
          STORAGE_KEY
        );

      if (!saved) {
        return;
      }

      const parsed: unknown =
        JSON.parse(saved);

      if (
        !Array.isArray(parsed)
      ) {
        window.localStorage.removeItem(
          STORAGE_KEY
        );

        return;
      }

      const validStocks =
        parsed
          .filter(
            isValidWatchlistStock
          )
          .map(
            normalizeWatchlistStock
          );

      if (
        validStocks.length > 0
      ) {
        setStocks(
          validStocks
        );
      } else {
        window.localStorage.removeItem(
          STORAGE_KEY
        );

        setStocks(
          defaultWatchlist.map(
            normalizeWatchlistStock
          )
        );
      }
    } catch (error) {
      console.error(
        "Watchlist 读取失败，已恢复默认数据。",
        error
      );

      window.localStorage.removeItem(
        STORAGE_KEY
      );

      setStocks(
        defaultWatchlist.map(
          normalizeWatchlistStock
        )
      );
    } finally {
      setStorageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!storageLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(stocks)
      );
    } catch (error) {
      console.error(
        "Watchlist 保存失败。",
        error
      );
    }
  }, [
    stocks,
    storageLoaded,
  ]);

  useEffect(() => {
    let cancelled = false;

    const tickers =
      Array.from(
        new Set(
          stocks
            .map((stock) =>
              normalizeTicker(
                stock.ticker
              )
            )
            .filter(
              (ticker) =>
                ticker.length >
                0
            )
        )
      );

    async function loadResearch() {
      setResearchErrorMap(
        (current) => {
          const next = {
            ...current,
          };

          for (
            const ticker of tickers
          ) {
            delete next[ticker];
          }

          return next;
        }
      );

      const results =
        await Promise.allSettled(
          tickers.map(
            async (ticker) => {
              const research =
                await getResearch(
                  ticker
                );

              return {
                ticker,
                research,
              };
            }
          )
        );

      if (cancelled) {
        return;
      }

      const successfulResearch:
        ResearchMap = {};

      const failedResearch:
        ResearchErrorMap = {};

      results.forEach(
        (result, index) => {
          const ticker =
            tickers[index];

          if (
            result.status ===
            "fulfilled"
          ) {
            successfulResearch[
              ticker
            ] =
              result.value.research;
          } else {
            const message =
              getErrorMessage(
                result.reason
              );

            failedResearch[
              ticker
            ] = message;

            console.error(
              `${ticker} 首页 Research Engine 数据读取失败：`,
              result.reason
            );
          }
        }
      );

      setResearchMap(
        (current) => ({
          ...current,
          ...successfulResearch,
        })
      );

      setResearchErrorMap(
        (current) => ({
          ...current,
          ...failedResearch,
        })
      );
    }

    void loadResearch();

    return () => {
      cancelled = true;
    };
  }, [stocks]);

  const watchlistItems =
    stocks.map((stock) => {
      const ticker =
        normalizeTicker(
          stock.ticker
        );

      const research =
        researchMap[ticker];

      return {
        name:
          research?.quote?.name ||
          stock.name,

        ticker,
      };
    });

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent:
            "flex-end",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <LanguageSwitcher />
      </div>

      <MorningReport />

      <Watchlist
        items={watchlistItems}
        onSelect={(ticker) => {
          window.location.href =
            `/stocks/${encodeURIComponent(
              normalizeTicker(
                ticker
              )
            )}`;
        }}
        onRemove={
          handleRemove
        }
      />

      <StockSearch
        onSearch={(ticker) => {
          const normalizedTicker =
            normalizeTicker(
              ticker
            );

          if (
            !normalizedTicker
          ) {
            return;
          }

          window.location.href =
            `/stocks/${encodeURIComponent(
              normalizedTicker
            )}`;
        }}
      />

      <div
        style={{
          display: "grid",
          gap: "24px",
        }}
      >
        {stocks.map(
          (stock) => {
            const normalizedTicker =
              normalizeTicker(
                stock.ticker
              );

            const research =
              researchMap[
                normalizedTicker
              ];

            const researchError =
              researchErrorMap[
                normalizedTicker
              ];

            const displayName =
              research
                ?.quote
                ?.name ||
              stock.name;

            const displaySummary =
              research
                ? createResearchSummary(
                    research,
                    locale,
                    t
                  )
                : researchError
                  ? getFailedSummary(
                      researchError,
                      locale,
                      t
                    )
                  : getLoadingSummary(
                      locale
                    );

            const displayDecision =
              research
                ? getDecision(
                    research.signal
                  )
                : "WAIT";

            return (
              <StockCard
                key={
                  normalizedTicker
                }
                name={
                  displayName
                }
                ticker={
                  normalizedTicker
                }
                market={
                  stock.market
                }
                decision={
                  displayDecision
                }
                summary={
                  displaySummary
                }
                researchScore={
                  research?.score
                }
                researchSignal={
                  research?.signal
                }
              />
            );
          }
        )}
      </div>
    </>
  );
}
