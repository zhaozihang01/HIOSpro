export type HiosRating = {
  score: number;
  stars: number;
  label: "Strong Buy" | "Buy" | "Watch" | "Avoid";
};

export function getHiosScore(symbol: string): HiosRating {
  const scores: Record<string, HiosRating> = {
    "8766.T": {
      score: 92,
      stars: 5,
      label: "Strong Buy",
    },
    MSFT: {
      score: 88,
      stars: 4,
      label: "Buy",
    },
    AVGO: {
      score: 90,
      stars: 5,
      label: "Strong Buy",
    },
  };

  return (
    scores[symbol.toUpperCase()] ?? {
      score: 75,
      stars: 3,
      label: "Watch",
    }
  );
}
