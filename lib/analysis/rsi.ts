import {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export function calculateRSI(
  candles: PriceCandle[],
  period = 14
): IndicatorSeries {
  if (candles.length <= period) {
    return {
      name: "RSI",
      values: [],
    };
  }

  const values = [];

  let gain = 0;
  let loss = 0;

  for (let i = 1; i <= period; i++) {
    const change =
      candles[i].close - candles[i - 1].close;

    if (change >= 0) {
      gain += change;
    } else {
      loss += Math.abs(change);
    }
  }

  let avgGain = gain / period;
  let avgLoss = loss / period;

  let rs =
    avgLoss === 0 ? Number.POSITIVE_INFINITY : avgGain / avgLoss;

  values.push({
    time: candles[period].time,
    value: 100 - 100 / (1 + rs),
  });

  for (let i = period + 1; i < candles.length; i++) {
    const change =
      candles[i].close - candles[i - 1].close;

    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain =
      (avgGain * (period - 1) + currentGain) / period;

    avgLoss =
      (avgLoss * (period - 1) + currentLoss) / period;

    rs =
      avgLoss === 0
        ? Number.POSITIVE_INFINITY
        : avgGain / avgLoss;

    values.push({
      time: candles[i].time,
      value: 100 - 100 / (1 + rs),
    });
  }

  return {
    name: "RSI",
    values,
  };
}
