import { calculateEMA } from "./ema";
import {
  IndicatorPoint,
  IndicatorSeries,
  PriceCandle,
} from "./types";

export interface MACDResult {
  macd: IndicatorSeries;
  signal: IndicatorSeries;
  histogram: IndicatorSeries;
}

function calculateEMAFromPoints(
  points: IndicatorPoint[],
  period: number,
  name: string
): IndicatorSeries {
  if (period <= 0) {
    throw new Error("Period must be greater than 0.");
  }

  if (points.length < period) {
    return {
      name,
      values: [],
    };
  }

  const multiplier = 2 / (period + 1);

  let ema =
    points
      .slice(0, period)
      .reduce((sum, point) => sum + point.value, 0) /
    period;

  const values: IndicatorPoint[] = [
    {
      time: points[period - 1].time,
      value: ema,
    },
  ];

  for (let i = period; i < points.length; i++) {
    ema =
      (points[i].value - ema) * multiplier +
      ema;

    values.push({
      time: points[i].time,
      value: ema,
    });
  }

  return {
    name,
    values,
  };
}

export function calculateMACD(
  candles: PriceCandle[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MACDResult {
  if (
    fastPeriod <= 0 ||
    slowPeriod <= 0 ||
    signalPeriod <= 0
  ) {
    throw new Error(
      "MACD periods must be greater than 0."
    );
  }

  if (fastPeriod >= slowPeriod) {
    throw new Error(
      "Fast period must be smaller than slow period."
    );
  }

  const fastEMA = calculateEMA(candles, fastPeriod);
  const slowEMA = calculateEMA(candles, slowPeriod);

  const fastMap = new Map(
    fastEMA.values.map((point) => [
      point.time,
      point.value,
    ])
  );

  const macdValues: IndicatorPoint[] = [];

  for (const slowPoint of slowEMA.values) {
    const fastValue = fastMap.get(slowPoint.time);

    if (fastValue === undefined) {
      continue;
    }

    macdValues.push({
      time: slowPoint.time,
      value: fastValue - slowPoint.value,
    });
  }

  const macd: IndicatorSeries = {
    name: "MACD",
    values: macdValues,
  };

  const signal = calculateEMAFromPoints(
    macdValues,
    signalPeriod,
    "MACD Signal"
  );

  const signalMap = new Map(
    signal.values.map((point) => [
      point.time,
      point.value,
    ])
  );

  const histogramValues: IndicatorPoint[] = [];

  for (const macdPoint of macdValues) {
    const signalValue = signalMap.get(macdPoint.time);

    if (signalValue === undefined) {
      continue;
    }

    histogramValues.push({
      time: macdPoint.time,
      value: macdPoint.value - signalValue,
    });
  }

  return {
    macd,
    signal,
    histogram: {
      name: "MACD Histogram",
      values: histogramValues,
    },
  };
}
