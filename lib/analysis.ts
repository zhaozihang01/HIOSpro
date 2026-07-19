export interface AIAnalysis {
  summary: string;
  risk: string;
  strategy: string;
}

export function generateAnalysis(
  score: number
): AIAnalysis {

  if (score >= 85) {
    return {
      summary:
        "The stock is in a strong bullish trend with healthy momentum.",
      risk:
        "Short-term volatility is low, but investors should still monitor market news.",
      strategy:
        "Holding or buying on pullbacks may be considered."
    };
  }

  if (score >= 70) {
    return {
      summary:
        "The trend remains positive, although momentum has started to slow.",
      risk:
        "There is some correction risk if market sentiment weakens.",
      strategy:
        "Consider holding existing positions and avoid chasing prices."
    };
  }

  if (score >= 50) {
    return {
      summary:
        "The market is neutral without a clear direction.",
      risk:
        "Both upside and downside risks exist.",
      strategy:
        "Wait for stronger confirmation before increasing exposure."
    };
  }

  return {
    summary:
      "The stock is currently in a weak technical position.",
    risk:
      "Downside risk remains relatively high.",
    strategy:
      "Reduce exposure or wait until technical indicators improve."
  };
}
