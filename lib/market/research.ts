import { getStockMarketData } from "./service";
import { marketGateway } from "./gateway";

export async function getStockResearch(
  symbol: string,
  range = "6mo",
  interval = "1d"
) {
  const [market, chart] = await Promise.all([
    getStockMarketData(symbol),
    marketGateway.getChart(symbol, range, interval),
  ]);

  return {
    symbol: market.symbol,
    quote: market.quote,
    fundamentals: market.fundamentals,
    chart,
    warnings: market.warnings,
  };
}
