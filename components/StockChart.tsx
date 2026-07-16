"use client";

import {
  CandlestickSeries,
  ColorType,
  createChart,
  HistogramSeries,
  LineSeries,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import { useEffect, useRef } from "react";

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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || candles.length === 0) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 420,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#ffffff",
        },
        textColor: "#52697d",
      },
      grid: {
        vertLines: {
          color: "#e9eff4",
        },
        horzLines: {
          color: "#e9eff4",
        },
      },
      rightPriceScale: {
        borderColor: "#d6e1ea",
      },
      timeScale: {
        borderColor: "#d6e1ea",
        timeVisible: false,
        rightOffset: 3,
        barSpacing: 8,
      },
      crosshair: {
        vertLine: {
          color: "#8295a7",
          labelBackgroundColor: "#0b2a4a",
        },
        horzLine: {
          color: "#8295a7",
          labelBackgroundColor: "#0b2a4a",
        },
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#d64b47",
      downColor: "#3479b8",
      borderUpColor: "#d64b47",
      borderDownColor: "#3479b8",
      wickUpColor: "#d64b47",
      wickDownColor: "#3479b8",
    });

    const ma5Series = chart.addSeries(LineSeries, {
      color: "#dc9700",
      lineWidth: 2,
      title: "MA5",
    });

    const ma25Series = chart.addSeries(LineSeries, {
      color: "#2f9258",
      lineWidth: 2,
      title: "MA25",
    });

    const ma75Series = chart.addSeries(LineSeries, {
      color: "#8e42c4",
      lineWidth: 2,
      title: "MA75",
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "",
    });

    volumeSeries.priceScale().applyOptions({
      scaleMargins: {
        top: 0.78,
        bottom: 0,
      },
    });

    const candleData: CandlestickData<UTCTimestamp>[] =
      candles.map((item) => ({
        time: item.time as UTCTimestamp,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }));

    const ma5Data: LineData<UTCTimestamp>[] = candles
      .map((item, index) => ({
        time: item.time as UTCTimestamp,
        value: ma5[index],
      }))
      .filter(
        (
          item
        ): item is {
          time: UTCTimestamp;
          value: number;
        } => item.value !== null
      );

    const ma25Data: LineData<UTCTimestamp>[] = candles
      .map((item, index) => ({
        time: item.time as UTCTimestamp,
        value: ma25[index],
      }))
      .filter(
        (
          item
        ): item is {
          time: UTCTimestamp;
          value: number;
        } => item.value !== null
      );

    const ma75Data: LineData<UTCTimestamp>[] = candles
      .map((item, index) => ({
        time: item.time as UTCTimestamp,
        value: ma75[index],
      }))
      .filter(
        (
          item
        ): item is {
          time: UTCTimestamp;
          value: number;
        } => item.value !== null
      );

    const volumeData: HistogramData<UTCTimestamp>[] =
      candles.map((item) => ({
        time: item.time as UTCTimestamp,
        value: item.volume,
        color:
          item.close >= item.open
            ? "rgba(214, 75, 71, 0.45)"
            : "rgba(52, 121, 184, 0.45)",
      }));

    candleSeries.setData(candleData);
    ma5Series.setData(ma5Data);
    ma25Series.setData(ma25Data);
    ma75Series.setData(ma75Data);
    volumeSeries.setData(volumeData);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver(() => {
      chart.applyOptions({
        width: container.clientWidth,
      });
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [candles, ma5, ma25, ma75]);

  if (candles.length === 0) {
    return (
      <div
        style={{
          height: 420,
          display: "grid",
          placeItems: "center",
          color: "#62788c",
        }}
      >
        暂无行情数据
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: 420,
      }}
    />
  );
}
