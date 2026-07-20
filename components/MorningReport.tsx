"use client";

import { useEffect, useState } from "react";
import {
  getMarketSnapshot,
  type MarketSnapshot,
} from "@/lib/marketService";
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
const summary = !market
  ? "正在读取市场数据..."
  : [
      market.nikkei >= 1
        ? "日本股市表现强劲，市场风险偏好明显上升。"
        : market.nikkei <= -1
          ? "日本股市出现明显回调，短线应注意控制仓位。"
          : "日本股市整体波动有限，市场情绪暂时保持中性。",

      market.topix >= 1
        ? "TOPIX同步走强，金融和大型价值板块表现较好。"
        : market.topix <= -1
          ? "TOPIX走弱，市场整体承压。"
          : "TOPIX表现相对平稳。",

      market.usdJpy >= 150
        ? "美元兑日元处于高位，日元偏弱，出口企业可能相对受益。"
        : market.usdJpy <= 140
          ? "日元相对偏强，出口板块盈利预期可能受到一定压力。"
          : "美元兑日元处于中间区间，汇率影响暂时有限。",
    ].join(" ");
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
        {summary}
      </div>
    </section>
  );
}
