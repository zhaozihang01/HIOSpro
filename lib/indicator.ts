export function movingAverage(
  values: number[],
  period: number
) {
  return values.map((_, index) => {
    if (index + 1 < period) return null;

    const slice = values.slice(
      index + 1 - period,
      index + 1
    );

    return (
      slice.reduce((a, b) => a + b, 0) /
      period
    );
  });
}

export function calculateSupport(
  lows: number[]
) {
  return Math.min(...lows);
}

export function calculateResistance(
  highs: number[]
) {
  return Math.max(...highs);
}
