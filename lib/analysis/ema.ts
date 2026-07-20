import {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export function calculateEMA(
  candles: PriceCandle[],
  period: number
): IndicatorSeries {
  if (period <= 0) {
    throw new Error("Period must be greater than 0.");
  }

  if (candles.length < period) {
    return {
      name: `EMA${period}`,
      values: [],
    };
  }

  const multiplier = 2 / (period + 1);

  const values = [];

  let ema = 0;

  for (let i = 0; i < period; i++) {
    ema += candles[i].close;
  }

  ema /= period;

  values.push({
    time: candles[period - 1].time,
    value: ema,
  });

  for (let i = period; i < candles.length; i++) {
    ema =
      (candles[i].close - ema) * multiplier +
      ema;

    values.push({
      time: candles[i].time,
      value: ema,
    });
  }

  return {
    name: `EMA${period}`,
    values,
  };
}

export function calculateEMAs(
  candles: PriceCandle[],
  periods: number[]
): Record<number, IndicatorSeries> {
  const result: Record<number, IndicatorSeries> = {};

  for (const period of periods) {
    result[period] = calculateEMA(
      candles,
      period
    );
  }

  return result;
}
