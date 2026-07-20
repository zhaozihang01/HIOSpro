import {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export interface BollingerBandsResult {
  upper: IndicatorSeries;
  middle: IndicatorSeries;
  lower: IndicatorSeries;
}

export function calculateBollingerBands(
  candles: PriceCandle[],
  period = 20,
  multiplier = 2
): BollingerBandsResult {
  if (candles.length < period) {
    return {
      upper: {
        name: "Upper Band",
        values: [],
      },
      middle: {
        name: "Middle Band",
        values: [],
      },
      lower: {
        name: "Lower Band",
        values: [],
      },
    };
  }

  const upper = [];
  const middle = [];
  const lower = [];

  for (let i = period - 1; i < candles.length; i++) {
    const window = candles.slice(
      i - period + 1,
      i + 1
    );

    const mean =
      window.reduce(
        (sum, candle) => sum + candle.close,
        0
      ) / period;

    const variance =
      window.reduce(
        (sum, candle) =>
          sum +
          Math.pow(candle.close - mean, 2),
        0
      ) / period;

    const stdDev = Math.sqrt(variance);

    const time = candles[i].time;

    middle.push({
      time,
      value: mean,
    });

    upper.push({
      time,
      value: mean + multiplier * stdDev,
    });

    lower.push({
      time,
      value: mean - multiplier * stdDev,
    });
  }

  return {
    upper: {
      name: "Upper Band",
      values: upper,
    },
    middle: {
      name: "Middle Band",
      values: middle,
    },
    lower: {
      name: "Lower Band",
      values: lower,
    },
  };
}
