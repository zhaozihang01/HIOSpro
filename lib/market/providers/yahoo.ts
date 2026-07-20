import {
  MarketDataProvider,
} from "../gateway";

import {
  DataMetadata,
  StockFundamentals,
  StockQuote,
} from "../types";

export class YahooProvider implements MarketDataProvider {
  private createMetadata(): DataMetadata {
    return {
      source: "yahoo",
      updatedAt: new Date().toISOString(),
      status: "fresh",
    };
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    throw new Error(
      `YahooProvider.getQuote("${symbol}") has not been implemented yet.`
    );
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    throw new Error(
      `YahooProvider.getFundamentals("${symbol}") has not been implemented yet.`
    );
  }
}
