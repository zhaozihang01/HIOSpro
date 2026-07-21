"use client";

import { useEffect, useState } from "react";
import StockCard from "@/components/StockCard";
import StockSearch from "@/components/StockSearch";
import {
  StockItem,
  defaultWatchlist,
} from "@/data/watchlist";
import MorningReport from "@/components/MorningReport";
import Watchlist from "@/components/Watchlist";

const STORAGE_KEY = "hios-watchlist";

function isValidStockItem(value: unknown): value is StockItem {
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

function normalizeStockItem(stock: StockItem): StockItem {
  return {
    ...stock,
    name: stock.name.trim(),
    ticker: stock.ticker.trim().toUpperCase(),
    market: stock.market.trim(),
    decision: stock.decision,
    summary: stock.summary.trim(),
  };
}

export default function HomeClient() {
  const [stocks, setStocks] =
    useState<StockItem[]>(defaultWatchlist);

  const [storageLoaded, setStorageLoaded] =
    useState(false);

  function handleRemove(ticker: string) {
    const normalizedTicker =
      ticker.trim().toUpperCase();

    setStocks((current) =>
      current.filter(
        (stock) =>
          stock.ticker.trim().toUpperCase() !==
          normalizedTicker
      )
    );
  }

  useEffect(() => {
    try {
      const saved =
        window.localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        setStorageLoaded(true);
        return;
      }

      const parsed: unknown = JSON.parse(saved);

      if (!Array.isArray(parsed)) {
        window.localStorage.removeItem(STORAGE_KEY);
        setStorageLoaded(true);
        return;
      }

      const validStocks = parsed
        .filter(isValidStockItem)
        .map(normalizeStockItem);

      if (validStocks.length > 0) {
        setStocks(validStocks);
      } else {
        window.localStorage.removeItem(STORAGE_KEY);
        setStocks(defaultWatchlist);
      }
    } catch (error) {
      console.error(
        "Watchlist 读取失败，已恢复默认数据。",
        error
      );

      window.localStorage.removeItem(STORAGE_KEY);
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

  function handleSearch(symbol: string) {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      return;
    }

    const exists = stocks.some(
      (stock) =>
        stock.ticker.trim().toUpperCase() ===
        normalizedSymbol
    );

    if (exists) {
      setStocks((current) => {
        const target = current.find(
          (stock) =>
            stock.ticker.trim().toUpperCase() ===
            normalizedSymbol
        );

        const rest = current.filter(
          (stock) =>
            stock.ticker.trim().toUpperCase() !==
            normalizedSymbol
        );

        return target
          ? [target, ...rest]
          : current;
      });

      return;
    }

    const newStock: StockItem = {
      name: normalizedSymbol,
      ticker: normalizedSymbol,
      market: normalizedSymbol.endsWith(".T")
        ? "TSE"
        : "US",
      decision: "WAIT",
      summary:
        "这是通过搜索添加的股票。当前先显示真实行情，后续会自动生成中日双语AI分析和HIOS评分。",
    };

    setStocks((current) => [
      newStock,
      ...current,
    ]);
  }

  return (
    <>
      <MorningReport />

      <Watchlist
        items={stocks}
        onSelect={(ticker) => {
          window.location.href =
            `/stocks/${encodeURIComponent(ticker)}`;
        }}
        onRemove={handleRemove}
      />

      <StockSearch
        onSearch={(ticker) => {
          const normalizedTicker =
            ticker.trim().toUpperCase();

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
        {stocks.map((stock) => (
          <StockCard
            key={stock.ticker}
            name={stock.name}
            ticker={stock.ticker}
            market={stock.market}
            decision={stock.decision}
            summary={stock.summary}
          />
        ))}
      </div>
    </>
  );
}
