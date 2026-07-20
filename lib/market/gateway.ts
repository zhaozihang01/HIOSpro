import {
  StockChart,
  StockFundamentals,
  StockQuote,
} from "./types";

import { YahooProvider } from "./providers/yahoo";
import { FinnhubProvider } from "./providers/finnhub";

export interface MarketDataProvider {
  getQuote(symbol: string): Promise<StockQuote>;

  getFundamentals(symbol: string): Promise<StockFundamentals>;

  getChart?(
    symbol: string,
    range?: string,
    interval?: string
  ): Promise<StockChart>;
}

export class MarketGateway {
  private yahoo = new YahooProvider();

  private finnhub = new FinnhubProvider();

  async getQuote(symbol: string): Promise<StockQuote> {
    return this.yahoo.getQuote(symbol);
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    return this.finnhub.getFundamentals(symbol);
  }

  async getChart(
    symbol: string,
    range = "6mo",
    interval = "1d"
  ): Promise<StockChart> {
    if (!this.yahoo.getChart) {
      throw new Error("Chart provider is unavailable.");
    }

    return this.yahoo.getChart(
      symbol,
      range,
      interval
    );
  }
}

export const marketGateway = new MarketGateway();
