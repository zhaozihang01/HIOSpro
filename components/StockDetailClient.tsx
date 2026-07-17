"use client";

import { useEffect, useState } from "react";
import StockCard from "@/components/StockCard";
import AIResearch from "@/components/AIResearch";
import MarketStats from "@/components/MarketStats";
import {
  getStockData,
  type StockData,
} from "@/lib/stockService";

type Props = {
  name: string;
  ticker: string;
};

function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`;
  }

  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`;
  }

  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(2)}K`;
  }

  return volume.toString();
}

export default function StockDetailClient({
  name,
  ticker,
}: Props) {
  const [stock, setStock] = useState<StockData | null>(null);

  useEffect(() => {
    getStockData(ticker)
      .then(setStock)
      .catch((error) => {
        console.error("股票详情读取失败：", error);
      });
  }, [ticker]);

  return (
    <>
      <StockCard
        name={name}
        ticker={ticker}
        market={ticker.endsWith(".T") ? "TSE" : "US"}
        decision="WAIT"
        summary="正在分析该股票的行情、技术趋势与 HIOS 评分。"
      />

      <AIResearch
        name={name}
        ticker={ticker}
        score={88}
        label="BUY"
      />

      {stock && (
        <MarketStats
          open={stock.open}
          high={stock.high}
          low={stock.low}
          volume={formatVolume(stock.volume)}
          pe={0}
          marketCap="--"
        />
      )}
    </>
  );
}
