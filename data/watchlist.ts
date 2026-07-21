export type StockItem = {
  name: string;
  ticker: string;
  market: string;
};

export const defaultWatchlist: StockItem[] = [
  {
    name: "Tokio Marine Holdings, Inc.",
    ticker: "8766.T",
    market: "TSE",
  },
  {
    name: "Microsoft Corporation",
    ticker: "MSFT",
    market: "NASDAQ",
  },
  {
    name: "Broadcom Inc.",
    ticker: "AVGO",
    market: "NASDAQ",
  },
];
