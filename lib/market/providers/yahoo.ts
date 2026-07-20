import { MarketDataProvider } from "../gateway";
import {
  DataMetadata,
  StockFundamentals,
  StockQuote,
} from "../types";

interface YahooChartMeta {
  symbol?: string;
  currency?: string;
  exchangeName?: string;
  instrumentType?: string;
  regularMarketPrice?: number;
  previousClose?: number;
  chartPreviousClose?: number;
  longName?: string;
  shortName?: string;
  marketState?: string;
}

interface YahooChartResponse {
  chart?: {
    result?: Array<{
      meta?: YahooChartMeta;
    }>;
    error?: {
      code?: string;
      description?: string;
    } | null;
  };
}

export class YahooProvider implements MarketDataProvider {
  private createMetadata(status: DataMetadata["status"]): DataMetadata {
    return {
      source: "yahoo",
      updatedAt: new Date().toISOString(),
      status,
    };
  }

  async getQuote(symbol: string): Promise<StockQuote> {
    const normalizedSymbol = symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error("YahooProvider: symbol is required.");
    }

    const url =
      `https://query1.finance.yahoo.com/v8/finance/chart/` +
      `${encodeURIComponent(normalizedSymbol)}?interval=1d&range=5d`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "HIOS-Morning-Research/1.0",
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      throw new Error(
        `YahooProvider: quote request failed with status ${response.status}.`
      );
    }

    const data = (await response.json()) as YahooChartResponse;

    if (data.chart?.error) {
      throw new Error(
        `YahooProvider: ${
          data.chart.error.description ?? "unknown Yahoo error"
        }`
      );
    }

    const meta = data.chart?.result?.[0]?.meta;

    if (!meta || typeof meta.regularMarketPrice !== "number") {
      throw new Error(
        `YahooProvider: quote data is unavailable for ${normalizedSymbol}.`
      );
    }

    const previousClose =
      typeof meta.previousClose === "number"
        ? meta.previousClose
        : typeof meta.chartPreviousClose === "number"
          ? meta.chartPreviousClose
          : meta.regularMarketPrice;

    const change = meta.regularMarketPrice - previousClose;

    const changePercent =
      previousClose !== 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: meta.symbol ?? normalizedSymbol,
      name: meta.longName ?? meta.shortName ?? normalizedSymbol,
      price: meta.regularMarketPrice,
      change,
      changePercent,
      currency: meta.currency ?? "",
      marketState: meta.marketState ?? "UNKNOWN",
      metadata: this.createMetadata("fresh"),
    };
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    throw new Error(
      `YahooProvider.getFundamentals("${symbol}") is not supported.`
    );
  }
}
