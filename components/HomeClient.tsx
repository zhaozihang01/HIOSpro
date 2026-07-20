"use client";

import { useEffect, useState } from "react";
import StockCard from "@/components/StockCard";
import StockSearch from "@/components/StockSearch";
import { StockItem, defaultWatchlist } from "@/data/watchlist";
import MorningReport from "@/components/MorningReport";
import Watchlist from "@/components/Watchlist";


export default function HomeClient() {
  const [stocks, setStocks] = useState<StockItem[]>(defaultWatchlist);
  function handleRemove(ticker: string) {
  setStocks((current) =>
    current.filter((stock) => stock.ticker !== ticker)
  );
}
useEffect(() => {
  const saved = window.localStorage.getItem("hios-watchlist");

  if (!saved) {
    return;
  }

  try {
    const parsed = JSON.parse(saved) as StockItem[];

    if (Array.isArray(parsed) && parsed.length > 0) {
      setStocks(parsed);
    }
  } catch {
    console.error("Watchlist 读取失败");
  }
}, []);

useEffect(() => {
  window.localStorage.setItem(
    "hios-watchlist",
    JSON.stringify(stocks)
  );
}, [stocks]);
  function handleSearch(symbol: string) {
    const exists = stocks.some(
      (stock) => stock.ticker.toUpperCase() === symbol.toUpperCase()
    );

    if (exists) {
      setStocks((current) => {
        const target = current.find(
          (stock) =>
            stock.ticker.toUpperCase() === symbol.toUpperCase()
        );

        const rest = current.filter(
          (stock) =>
            stock.ticker.toUpperCase() !== symbol.toUpperCase()
        );

        return target ? [target, ...rest] : current;
      });

      return;
    }

    const newStock: StockItem = {
      name: symbol,
      ticker: symbol,
      market: symbol.endsWith(".T") ? "TSE" : "US",
      decision: "WAIT",
      summary:
        "这是通过搜索添加的股票。当前先显示真实行情，后续会自动生成中日双语AI分析和HIOS评分。",
    };

    setStocks((current) => [newStock, ...current]);
  }

  return (
    <>
  <MorningReport />

  <Watchlist
  items={stocks}
  onSelect={(ticker) => {
    window.location.href = "/stocks/" + ticker;
  }}
  onRemove={handleRemove}
/>

  <StockSearch
  onSearch={(ticker) => {
    window.location.href = "/stocks/" + ticker;
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
            
          />
        ))}
      </div>
    </>
  );
}
