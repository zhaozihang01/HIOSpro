import { MarketDataProvider } from "../gateway";
import {
  DataMetadata,
  StockFundamentals,
  StockQuote,
} from "../types";

interface FinnhubMetricResponse {
  metric?: {
    marketCapitalization?: number;
    peTTM?: number;
    pbAnnual?: number;
    dividendYieldIndicatedAnnual?: number;
    epsTTM?: number;
    roeTTM?: number;
  };
}

export class FinnhubProvider implements MarketDataProvider {
  private createMetadata(
    status: DataMetadata["status"]
  ): DataMetadata {
    return {
      source: "finnhub",
      updatedAt: new Date().toISOString(),
      status,
    };
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    throw new Error(
      "FinnhubProvider does not provide quote data."
    );
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      throw new Error("FINNHUB_API_KEY is not configured.");
    }

    const url =
      `https://finnhub.io/api/v1/stock/metric?metric=all` +
      `&symbol=${encodeURIComponent(symbol)}` +
      `&token=${apiKey}`;

    const response = await fetch(url, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Finnhub request failed: ${response.status}`
      );
    }

    const data =
      (await response.json()) as FinnhubMetricResponse;

    const metric = data.metric ?? {};

    return {
      marketCap: metric.marketCapitalization,
      peRatio: metric.peTTM,
      pbRatio: metric.pbAnnual,
      dividendYield: metric.dividendYieldIndicatedAnnual,
      eps: metric.epsTTM,
      roe: metric.roeTTM,
      metadata: this.createMetadata("fresh"),
    };
  }
}
