export type HiosScoreBreakdown = {
  technical: number;
  trend: number;
  risk: number;
  ai: number;
};

export type HiosAnalysis = {
  totalScore: number;
  stars: number;
  label: "Strong Buy" | "Buy" | "Watch" | "Avoid";
  breakdown: HiosScoreBreakdown;
};

function getLabel(score: number): HiosAnalysis["label"] {
  if (score >= 85) return "Strong Buy";
  if (score >= 70) return "Buy";
  if (score >= 50) return "Watch";
  return "Avoid";
}

function getStars(score: number): number {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

export function calculateHiosScore(
  breakdown: HiosScoreBreakdown
): HiosAnalysis {
  const totalScore =
    breakdown.technical +
    breakdown.trend +
    breakdown.risk +
    breakdown.ai;

  const safeScore = Math.max(0, Math.min(100, totalScore));

  return {
    totalScore: safeScore,
    stars: getStars(safeScore),
    label: getLabel(safeScore),
    breakdown,
  };
}
