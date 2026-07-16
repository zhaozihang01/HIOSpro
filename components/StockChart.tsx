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

type ChartPoint = {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  ma5?: number;
  ma25?: number;
  ma75?: number;
};

type StockChartProps = {
  data: ChartPoint[];
};

export default function StockChart({ data }: StockChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const container = containerRef.current;

    const chart = createChart(container, {
      width: container.clientWidth,
      height: 340,
      layout: {
        background: {
          type: ColorType.Solid,
          color: "#ffffff",
        },
        textColor: "#52697d",
      },
      grid: {
        vertLines: {
          color: "#edf2f6",
        },
        horzLines: {
          color: "#edf2f6",
        },
      },
      rightPriceScale: {
        borderColor: "#d6e1ea",
      },
      timeScale: {
        borderColor: "#d6e1ea",
        timeVisible: true,
      },
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#d94343",
      downColor: "#2878b5",
      borderUpColor: "#d94343",
      borderDownColor: "#2878b5",
      wickUpColor: "#d94343",
      wickDownColor: "#2878b5",
    });

    const ma5Series = chart.addSeries(LineSeries, {
      color: "#df9b00",
      lineWidth: 2,
      title: "MA5",
    });

    const ma25Series = chart.addSeries(LineSeries, {
      color: "#23935b",
      lineWidth: 2,
      title: "MA25",
    });

    const ma75Series = chart.addSeries(LineSeries, {
      color: "#8f43c7",
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

    const candles: CandlestickData[] = data.map((item) => ({
      time: item.time as unknown as UTCTimestamp,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));

    const ma5: LineData[] = data
      .filter((item) => item.ma5 !== undefined)
      .map((item) => ({
        time: item.time as unknown as UTCTimestamp,
        value: item.ma5!,
      }));

    const ma25: LineData[] = data
      .filter((item) => item.ma25 !== undefined)
      .map((item) => ({
        time: item.time as unknown as UTCTimestamp,
        value: item.ma25!,
      }));

    const ma75: LineData[] = data
      .filter((item) => item.ma75 !== undefined)
      .map((item) => ({
        time: item.time as unknown as UTCTimestamp,
        value: item.ma75!,
      }));

    const volume: HistogramData[] = data.map((item) => ({
      time: item.time as unknown as UTCTimestamp,
      value: item.volume,
      color:
        item.close >= item.open
          ? "rgba(217, 67, 67, 0.45)"
          : "rgba(40, 120, 181, 0.45)",
    }));

    candleSeries.setData(candles);
    ma5Series.setData(ma5);
    ma25Series.setData(ma25);
    ma75Series.setData(ma75);
    volumeSeries.setData(volume);

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
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        minHeight: "340px",
      }}
    />
  );
}
