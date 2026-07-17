export type StockItem = {
  name: string;
  ticker: string;
  market: string;
  decision: "BUY" | "WAIT" | "AVOID";
  summary: string;
};

export const defaultWatchlist: StockItem[] = [
  {
    name: "东京海上HD",
    ticker: "8766.T",
    market: "TSE",
    decision: "BUY",
    summary:
      "保险行业龙头，长期趋势保持向上，目前位于75日均线上方，属于重点观察对象。",
  },
  {
    name: "Microsoft",
    ticker: "MSFT",
    market: "NASDAQ",
    decision: "WAIT",
    summary:
      "AI与云业务继续推动业绩增长，但短线涨幅较大，建议等待更好的买入位置。",
  },
  {
    name: "Broadcom",
    ticker: "AVGO",
    market: "NASDAQ",
    decision: "BUY",
    summary:
      "AI基础设施需求依旧强劲，中长期逻辑没有改变，可持续关注。",
  },
];
