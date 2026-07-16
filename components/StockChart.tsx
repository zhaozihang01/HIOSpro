"use client";

type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

type Props = {
  candles: Candle[];
  ma5: (number | null)[];
  ma25: (number | null)[];
  ma75: (number | null)[];
};

export default function StockChart({
  candles,
  ma5,
  ma25,
  ma75,
}: Props) {
  return (
    <div
      style={{
        height: 320,
        background: "#f7fafc",
        border: "1px solid #d6e1ea",
        borderRadius: 12,
        padding: 16,
        overflow: "auto",
      }}
    >
      <h3
        style={{
          marginTop: 0,
        }}
      >
        HIOS Real Chart
      </h3>

      <div>蜡烛数量：{candles.length}</div>

      <div>MA5：{ma5.filter(Boolean).length} 个数据</div>

      <div>MA25：{ma25.filter(Boolean).length} 个数据</div>

      <div>MA75：{ma75.filter(Boolean).length} 个数据</div>

      <hr />

      <div
        style={{
          fontFamily: "monospace",
          fontSize: 12,
        }}
      >
        {candles.slice(-5).map((c) => (
          <div key={c.time}>
            O:{c.open}
            {"  "}
            H:{c.high}
            {"  "}
            L:{c.low}
            {"  "}
            C:{c.close}
          </div>
        ))}
      </div>
    </div>
  );
}
