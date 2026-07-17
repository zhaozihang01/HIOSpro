import { calculateHiosScore } from "@/lib/hiosEngine";

export type HiosRating = {
  score: number;
  stars: number;
  label: "Strong Buy" | "Buy" | "Watch" | "Avoid";
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
  };
}
