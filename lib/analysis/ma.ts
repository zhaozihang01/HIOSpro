import type {
  IndicatorSeries,
  PriceCandle,
} from "./types";

export function calculateMA(
  candles: PriceCandle[],
  period: number
): IndicatorSeries {
  if (
    !Number.isInteger(period) ||
    period <= 0
  ) {
    throw new Error(
      "Period must be a positive integer."
    );
  }

  if (candles.length < period) {
    return {
      name: `MA${period}`,
      values: [],
    };
  }

  const values: IndicatorSeries["values"] = [];

  let rollingSum = 0;

  for (
    let index = 0;
    index < candles.length;
    index += 1
  ) {
    rollingSum += candles[index].close;

    if (index >= period) {
      rollingSum -=
        candles[index - period].close;
    }

    if (index >= period - 1) {
      values.push({
        time: candles[index].time,
        value: rollingSum / period,
      });
    }
  }

  return {
    name: `MA${period}`,
    values,
  };
}

export function calculateMAs(
  candles: PriceCandle[],
  periods: number[] = [
    5,
    10,
    20,
    25,
    60,
    75,
    120,
    200,
  ]
): Record<number, IndicatorSeries> {
  const result: Record<
    number,
    IndicatorSeries
  > = {};

  const uniquePeriods = Array.from(
    new Set(periods)
  ).sort(
    (first, second) =>
      first - second
  );

  for (const period of uniquePeriods) {
    result[period] =
      calculateMA(candles, period);
  }

  return result;
}
