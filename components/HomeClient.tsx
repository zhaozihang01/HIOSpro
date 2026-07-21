"use client";

import { useEffect, useState } from "react";
import MorningReport from "@/components/MorningReport";
import StockCard from "@/components/StockCard";
import StockSearch from "@/components/StockSearch";
import Watchlist from "@/components/Watchlist";

import {
  StockItem,
  defaultWatchlist,
} from "@/data/watchlist";

import type {
  StockResearchResult,
} from "@/lib/research";

const STORAGE_KEY = "hios-watchlist";

type ResearchMap = Record<
  string,
  StockResearchResult
>;

function normalizeTicker(ticker: string): string {
  return ticker.trim().toUpperCase();
}

function isValidStockItem(
  value: unknown
): value is StockItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const stock = value as Partial<StockItem>;

  return (
    typeof stock.name === "string" &&
    stock.name.trim().length > 0 &&
    typeof stock.ticker === "string" &&
    stock.ticker.trim().length > 0 &&
    typeof stock.market === "string" &&
    (
      stock.decision === "BUY" ||
      stock.decision === "WAIT" ||
      stock.decision === "AVOID"
    ) &&
    typeof stock.summary === "string"
  );
}

function normalizeStockItem(
  stock: StockItem
): StockItem {
  return {
    ...stock,
    name: stock.name.trim(),
    ticker: normalizeTicker(stock.ticker),
    market: stock.market.trim(),
    decision: stock.decision,
    summary: stock.summary.trim(),
  };
}

async function getResearch(
  ticker: string
): Promise<StockResearchResult> {
  const response = await fetch(
    `/api/market/${encodeURIComponent(ticker)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message = `${ticker} Research Engine 数据读取失败`;

    try {
      const body: unknown =
        await response.json();

      if (
        typeof body === "object" &&
        body !== null &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // 保留默认错误信息
    }

    throw new Error(message);
  }

  return response.json() as Promise<StockResearchResult>;
}

export default function HomeClient() {
  const [stocks, setStocks] =
    useState<StockItem[]>(defaultWatchlist);

  const [researchMap, setResearchMap] =
    useState<ResearchMap>({});

  const [storageLoaded, setStorageLoaded] =
    useState(false);

  function handleRemove(ticker: string) {
    const normalizedTicker =
      normalizeTicker(ticker);

    setStocks((current) =>
      current.filter(
        (stock) =>
          normalizeTicker(stock.ticker) !==
          normalizedTicker
      )
    );

    setResearchMap((current) => {
      const next = { ...current };

      delete next[normalizedTicker];

      return next;
    });
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

      if (!Array.isArray(parsed)) {
        window.localStorage.removeItem(
          STORAGE_KEY
        );

        return;
      }

      const validStocks = parsed
        .filter(isValidStockItem)
        .map(normalizeStockItem);

      if (validStocks.length > 0) {
        setStocks(validStocks);
      } else {
        window.localStorage.removeItem(
          STORAGE_KEY
        );

        setStocks(defaultWatchlist);
      }
    } catch (error) {
      console.error(
        "Watchlist 读取失败，已恢复默认数据。",
        error
      );

      window.localStorage.removeItem(
        STORAGE_KEY
      );

      setStocks(defaultWatchlist);
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
  }, [stocks, storageLoaded]);

  useEffect(() => {
    let cancelled = false;

    const tickers = Array.from(
      new Set(
        stocks
          .map((stock) =>
            normalizeTicker(stock.ticker)
          )
          .filter(
            (ticker) =>
              ticker.length > 0
          )
      )
    );

    async function loadResearch() {
      const results =
        await Promise.allSettled(
          tickers.map(async (ticker) => {
            const research =
              await getResearch(ticker);

            return {
              ticker,
              research,
            };
          })
        );

      if (cancelled) {
        return;
      }

      setResearchMap((current) => {
        const next: ResearchMap = {
          ...current,
        };

        for (const result of results) {
          if (
            result.status === "fulfilled"
          ) {
            next[result.value.ticker] =
              result.value.research;
          } else {
            console.error(
              "首页 Research Engine 数据读取失败：",
              result.reason
            );
          }
        }

        return next;
      });
    }

    void loadResearch();

    return () => {
      cancelled = true;
    };
  }, [stocks]);

  return (
    <>
      <MorningReport />

      <Watchlist
        items={stocks}
        onSelect={(ticker) => {
          window.location.href =
            `/stocks/${encodeURIComponent(
              normalizeTicker(ticker)
            )}`;
        }}
        onRemove={handleRemove}
      />

      <StockSearch
        onSearch={(ticker) => {
          const normalizedTicker =
            normalizeTicker(ticker);

          if (!normalizedTicker) {
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
        {stocks.map((stock) => {
          const normalizedTicker =
            normalizeTicker(stock.ticker);

          const research =
            researchMap[normalizedTicker];

          return (
            <StockCard
              key={normalizedTicker}
              name={stock.name}
              ticker={normalizedTicker}
              market={stock.market}
              decision={stock.decision}
              summary={stock.summary}
              researchScore={
                research?.score
              }
              researchSignal={
                research?.signal
              }
            />
          );
        })}
      </div>
    </>
  );
}
