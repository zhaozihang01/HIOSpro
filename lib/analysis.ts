export interface AIAnalysis {
  summary: string;
  risk: string;
  strategy: string;
}

export interface HiosBreakdown {
  technical: number;
  trend: number;
  risk: number;
  ai: number;
}

export function generateAnalysis(
  score: number,
  breakdown?: HiosBreakdown
): AIAnalysis {
  if (!breakdown) {
    return generateScoreAnalysis(score);
  }

  const technicalText =
    breakdown.technical >= 25
      ? "技术指标表现强劲，价格结构整体保持多头状态"
      : breakdown.technical >= 20
      ? "技术指标表现较为稳定，但仍需观察关键均线支撑"
      : "技术指标偏弱，价格结构暂时缺乏明确优势";

  const trendText =
    breakdown.trend >= 17
      ? "中短期趋势保持向上，均线关系较为积极"
      : breakdown.trend >= 13
      ? "当前趋势偏中性，方向仍需进一步确认"
      : "趋势动能较弱，短期下行压力需要关注";

  const riskText =
    breakdown.risk >= 17
      ? "当前波动风险相对可控，但仍需关注突发市场消息"
      : breakdown.risk >= 13
      ? "当前风险处于中等水平，应注意仓位和止损管理"
      : "当前波动风险较高，应避免过度集中持仓";

  const aiText =
    breakdown.ai >= 25
      ? "模型综合判断偏积极，可继续关注趋势延续"
      : breakdown.ai >= 20
      ? "模型判断偏中性，建议等待更明确的确认信号"
      : "模型判断偏谨慎，暂时不宜采取激进策略";

  return {
    summary: `当前 HIOS 评分为 ${score} 分。${technicalText}；${trendText}。`,
    risk: `${riskText}。`,
    strategy: `${aiText}。建议结合成交量、市场环境和个人风险承受能力制定交易计划。`,
  };
}

function generateScoreAnalysis(score: number): AIAnalysis {
  if (score >= 85) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，技术趋势整体较强，价格动能处于积极状态。`,
      risk: "强势行情中仍可能出现短期获利回吐，需要关注关键均线。",
      strategy: "可继续持有并观察趋势延续情况，避免短期盲目追高。",
    };
  }

  if (score >= 70) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，整体趋势偏强，但动能仍需确认。`,
      risk: "若市场情绪转弱，短期调整风险可能上升。",
      strategy: "已有仓位可继续观察，新建仓位宜采用分批方式。",
    };
  }

  if (score >= 50) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，股票处于中性观察阶段。`,
      risk: "当前多空力量较为接近，价格可能反复波动。",
      strategy: "建议等待趋势和成交量出现更明确的信号。",
    };
  }

  return {
    summary: `当前 HIOS 评分为 ${score} 分，技术状态偏弱。`,
    risk: "价格继续走弱的风险较高，应注意控制仓位。",
    strategy: "建议暂时观望，等待趋势和技术指标改善。",
  };
}
