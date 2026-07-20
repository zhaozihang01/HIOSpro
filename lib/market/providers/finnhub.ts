import { MarketDataProvider } from "../gateway";
import {
  DataMetadata,
  StockFundamentals,
  StockQuote,
} from "../types";

export class FinnhubProvider implements MarketDataProvider {
  private createMetadata(): DataMetadata {
    return {
      source: "finnhub",
      updatedAt: new Date().toISOString(),
      status: "fresh",
    };
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    throw new Error(
      `FinnhubProvider.getQuote("${symbol}") has not been implemented yet.`
    );
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    throw new Error(
      `FinnhubProvider.getFundamentals("${symbol}") has not been implemented yet.`
    );
  }
}
