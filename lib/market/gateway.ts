import { StockFundamentals, StockQuote } from "./types";

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<StockQuote>;

  getFundamentals(symbol: string): Promise<StockFundamentals>;
}

export class MarketGateway {
  private provider: MarketDataProvider;

  constructor(provider: MarketDataProvider) {
    this.provider = provider;
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.provider.getQuote(symbol);
  }

  async getFundamentals(symbol: string): Promise<StockFundamentals> {
    return this.provider.getFundamentals(symbol);
  }
}
