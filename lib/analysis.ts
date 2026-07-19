export interface AIAnalysis {
  summary: string;
  risk: string;
  strategy: string;
}

export function generateAnalysis(score: number): AIAnalysis {
  if (score >= 85) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，技术趋势整体较强，价格动能处于积极状态。`,
      risk:
        "强势行情中仍可能出现短期获利回吐，需要继续关注价格是否跌破关键均线。",
      strategy:
        "可继续持有并观察趋势延续情况，避免在短期快速上涨后盲目追高。",
    };
  }

  if (score >= 70) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，整体趋势偏强，但上涨动能仍需进一步确认。`,
      risk:
        "若市场情绪转弱或价格跌破中期均线，短期调整风险可能上升。",
      strategy:
        "已有仓位可继续观察，新建仓位宜采用分批方式并控制风险。",
    };
  }

  if (score >= 50) {
    return {
      summary: `当前 HIOS 评分为 ${score} 分，股票处于中性观察阶段，暂时没有明确方向。`,
      risk:
        "当前多空力量较为接近，价格可能出现反复波动。",
      strategy:
        "建议等待趋势、成交量和均线关系出现更明确的信号后再采取行动。",
    };
  }

  return {
    summary: `当前 HIOS 评分为 ${score} 分，技术状态偏弱，下行压力相对明显。`,
    risk:
      "价格继续走弱或跌破重要支撑位的风险较高，应注意控制仓位。",
    strategy:
      "建议暂时回避或降低持仓比例，等待技术指标和趋势明显改善。",
  };
}
