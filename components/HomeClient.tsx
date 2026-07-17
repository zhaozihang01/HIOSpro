"use client";

import { useState } from "react";
import StockCard from "@/components/StockCard";
import StockSearch from "@/components/StockSearch";

type StockItem = {
  name: string;
  ticker: string;
  market: string;
  decision: "BUY" | "WAIT" | "AVOID";
  summary: string;
};

const initialStocks: StockItem[] = [
  {
    name: "东京海上HD",
    ticker: "8766.T",
    market: "TSE",
    decision: "BUY",
    summary:
      "保险行业龙头，长期趋势保持向上，目前位于75日均线上方，属于重点观察对象。",
  },
  {
    name: "Microsoft",
    ticker: "MSFT",
    market: "NASDAQ",
    decision: "WAIT",
    summary:
      "AI与云业务继续推动业绩增长，但短线涨幅较大，建议等待更好的买入位置。",
  },
  {
    name: "Broadcom",
    ticker: "AVGO",
    market: "NASDAQ",
    decision: "BUY",
    summary:
      "AI基础设施需求依旧强劲，中长期逻辑没有改变，可持续关注。",
  },
];

export default function HomeClient() {
  const [stocks, setStocks] = useState<StockItem[]>(initialStocks);

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
      <StockSearch onSearch={handleSearch} />

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
