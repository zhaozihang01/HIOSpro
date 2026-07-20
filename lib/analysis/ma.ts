import {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export function calculateMA(
  candles: PriceCandle[],
  period: number
): IndicatorSeries {
  if (period <= 0) {
    throw new Error("Period must be greater than 0.");
  }

  const values = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;

    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }

    values.push({
      time: candles[i].time,
      value: sum / period,
    });
  }

  return {
    name: `MA${period}`,
    values,
  };
}

export function calculateMAs(
  candles: PriceCandle[],
  periods: number[] = [5, 10, 20, 60, 120, 200]
): Record<number, IndicatorSeries> {
  const result: Record<number, IndicatorSeries> = {};

  for (const period of periods) {
    result[period] = calculateMA(candles, period);
  }

  return result;
}
