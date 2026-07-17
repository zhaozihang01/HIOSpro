import { calculateHiosScore } from "@/lib/hiosEngine";

export type HiosRating = {
  score: number;
  stars: number;
  label: "Strong Buy" | "Buy" | "Watch" | "Avoid";
  breakdown: {
    technical: number;
    trend: number;
    risk: number;
    ai: number;
  };
};

export function getHiosScore(symbol: string): HiosRating {
  const breakdowns = {
    "8766.T": {
      technical: 28,
      trend: 19,
      risk: 17,
      ai: 28,
    },
    MSFT: {
      technical: 25,
      trend: 18,
      risk: 18,
      ai: 27,
    },
    AVGO: {
      technical: 27,
      trend: 19,
      risk: 17,
      ai: 27,
    },
  };

  const breakdown =
    breakdowns[symbol.toUpperCase() as keyof typeof breakdowns] ?? {
      technical: 20,
      trend: 16,
      risk: 17,
      ai: 22,
    };

  const result = calculateHiosScore(breakdown);

  return {
    score: result.totalScore,
    stars: result.stars,
    label: result.label,
    breakdown: result.breakdown,
  };
}
type RealMarketInput = {
  marketPrice: number;
  previousClose: number;
  volume: number;
  ma5: (number | null)[];
  ma25: (number | null)[];
  ma75: (number | null)[];
};

function getLatestValue(values: (number | null)[]): number | null {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];

    if (value !== null) {
      return value;
    }
  }

  return null;
}

export function getRealHiosScore(
  data: RealMarketInput
): HiosRating {
  const ma5 = getLatestValue(data.ma5);
  const ma25 = getLatestValue(data.ma25);
  const ma75 = getLatestValue(data.ma75);

  let technical = 15;
  let trend = 10;
  let risk = 15;
  let ai = 20;

  if (ma5 !== null && data.marketPrice >= ma5) {
    technical += 5;
  }

  if (ma25 !== null && data.marketPrice >= ma25) {
    technical += 5;
  }

  if (ma75 !== null && data.marketPrice >= ma75) {
    technical += 5;
  }

  if (ma5 !== null && ma25 !== null && ma5 >= ma25) {
    trend += 5;
  }

  if (ma25 !== null && ma75 !== null && ma25 >= ma75) {
    trend += 5;
  }

  const changePercent =
    data.previousClose === 0
      ? 0
      : ((data.marketPrice - data.previousClose) /
          data.previousClose) *
        100;

  if (changePercent >= 0) {
    trend += 5;
  }

  if (Math.abs(changePercent) <= 3) {
    risk += 5;
  }

  if (data.volume > 0) {
    ai += 5;
  }

  const result = calculateHiosScore({
    technical,
    trend,
    risk,
    ai,
  });

  return {
    score: result.totalScore,
    stars: result.stars,
    label: result.label,
    breakdown: result.breakdown,
  };
}
