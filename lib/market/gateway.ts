import { StockFundamentals, StockQuote } from "./types";
import { YahooProvider } from "./providers/yahoo";
import { FinnhubProvider } from "./providers/finnhub";

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<StockQuote>;
  getFundamentals(symbol: string): Promise<StockFundamentals>;
}

export class MarketGateway {
  private yahoo = new YahooProvider();
  private finnhub = new FinnhubProvider();

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.yahoo.getQuote(symbol);
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    return this.finnhub.getFundamentals(symbol);
  }
}

export const marketGateway = new MarketGateway();
