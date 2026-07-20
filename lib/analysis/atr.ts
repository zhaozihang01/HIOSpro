import {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export function calculateATR(
  candles: PriceCandle[],
  period = 14
): IndicatorSeries {
  if (candles.length <= period) {
    return {
      name: "ATR",
      values: [],
    };
  }

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );

    trueRanges.push(tr);
  }

  const values = [];

  let atr = 0;

  for (let i = 0; i < period; i++) {
    atr += trueRanges[i];
  }

  atr /= period;

  values.push({
    time: candles[period].time,
    value: atr,
  });

  for (let i = period; i < trueRanges.length; i++) {
    atr =
      (atr * (period - 1) + trueRanges[i]) /
      period;

    values.push({
      time: candles[i + 1].time,
      value: atr,
    });
  }

  return {
    name: "ATR",
    values,
  };
}
