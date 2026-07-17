export type MarketSnapshot = {
  nikkei: number;
  topix: number;
  usdJpy: number;
};

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  return {
    nikkei: 0.82,
    topix: 0.65,
    usdJpy: 148.72,
  };
}
