"use client";

import { useEffect, useState } from "react";
import {
  getMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/marketService";
import { generateMarketAnalysis } from "@/lib/analysis";
export default function MorningReport() {
  const [japanTime, setJapanTime] = useState("");
const [market, setMarket] = useState<MarketSnapshot | null>(null);
  useEffect(() => {
    function updateJapanTime() {
      const now = new Date();

      const formatted = new Intl.DateTimeFormat("zh-CN", {
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
    }

    updateJapanTime();
getMarketSnapshot().then(setMarket);
    const timer = window.setInterval(updateJapanTime, 1000);

    return () => window.clearInterval(timer);
  }, []);
const analysis = market
  ? generateMarketAnalysis(market)
  : null;
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

      <div style={{ color: "#666", marginBottom: 16 }}>
        {japanTime || "正在读取日本时间…"}
      </div>

      <div style={{ lineHeight: 1.8 }}>
        <div>
  📈 Nikkei225　{market ? `+${market.nikkei.toFixed(2)}%` : "..."}
</div>

<div>
  📈 TOPIX　　　{market ? `+${market.topix.toFixed(2)}%` : "..."}
</div>

<div>
  💵 USDJPY　　{market ? market.usdJpy.toFixed(2) : "..."}
</div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        AI Summary
      </div>

      <div style={{ color: "#333", lineHeight: 1.8 }}>
  {analysis ? analysis.summary : "Loading..."}
</div>

<br />

<div style={{ color: "#333", lineHeight: 1.8 }}>
  {analysis ? analysis.risk : ""}
</div>

<br />

<div style={{ color: "#333", lineHeight: 1.8 }}>
  {analysis ? analysis.strategy : ""}
</div>
    </section>
  );
}
