import { MarketDataProvider } from "../gateway";
import {
  DataMetadata,
  StockChart,
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

interface YahooChartQuote {
  open?: Array<number | null>;
  high?: Array<number | null>;
  low?: Array<number | null>;
  close?: Array<number | null>;
  volume?: Array<number | null>;
}

interface YahooChartResult {
  meta?: YahooChartMeta;
  timestamp?: number[];
  indicators?: {
    quote?: YahooChartQuote[];
  };
}

interface YahooChartResponse {
  chart?: {
    result?: YahooChartResult[];
    error?: {
      code?: string;
      description?: string;
    } | null;
  };
}

interface YahooQuoteResult {
  symbol?: string;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  trailingAnnualDividendYield?: number;
  dividendYield?: number;
  epsTrailingTwelveMonths?: number;
  epsForward?: number;
  returnOnEquity?: number;
}

interface YahooQuoteResponse {
  quoteResponse?: {
    result?: YahooQuoteResult[];
    error?: {
      code?: string;
      description?: string;
    } | null;
  };
}

function getFiniteNumber(
  value: unknown
): number | undefined {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  return undefined;
}

function getPositiveNumber(
  ...values: unknown[]
): number | undefined {
  for (const value of values) {
    const number = getFiniteNumber(value);

    if (
      number !== undefined &&
      number > 0
    ) {
      return number;
    }
  }

  return undefined;
}

function normalizeRatioAsPercent(
  value: unknown
): number | undefined {
  const number = getFiniteNumber(value);

  if (number === undefined) {
    return undefined;
  }

  if (Math.abs(number) <= 1) {
    return number * 100;
  }

  return number;
}

export class YahooProvider
  implements MarketDataProvider
{
  private createMetadata(
    status: DataMetadata["status"]
  ): DataMetadata {
    return {
      source: "yahoo",
      updatedAt: new Date().toISOString(),
      status,
    };
  }

  private normalizeSymbol(
    symbol: string
  ): string {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "YahooProvider: symbol is required."
      );
    }

    return normalizedSymbol;
  }

  private async fetchChartData(
    symbol: string,
    range: string,
    interval: string
  ): Promise<YahooChartResult> {
    const normalizedSymbol =
      this.normalizeSymbol(symbol);

    const url =
      "https://query1.finance.yahoo.com/v8/finance/chart/" +
      `${encodeURIComponent(normalizedSymbol)}` +
      `?range=${encodeURIComponent(range)}` +
      `&interval=${encodeURIComponent(interval)}` +
      "&includePrePost=false";

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "HIOS-Morning-Research/1.0",
      },
      next: {
        revalidate:
          interval === "1d"
            ? 900
            : 60,
      },
    });

    if (!response.ok) {
      throw new Error(
        "YahooProvider: chart request failed " +
          `with status ${response.status}.`
      );
    }

    const data =
      (await response.json()) as YahooChartResponse;

    if (data.chart?.error) {
      throw new Error(
        "YahooProvider: " +
          (data.chart.error.description ??
            "unknown Yahoo error")
      );
    }

    const result =
      data.chart?.result?.[0];

    if (!result) {
      throw new Error(
        "YahooProvider: chart data is unavailable " +
          `for ${normalizedSymbol}.`
      );
    }

    return result;
  }

  private async fetchQuoteData(
    symbol: string
  ): Promise<YahooQuoteResult> {
    const normalizedSymbol =
      this.normalizeSymbol(symbol);

    const url =
      "https://query1.finance.yahoo.com/v7/finance/quote" +
      `?symbols=${encodeURIComponent(
        normalizedSymbol
      )}`;

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent":
          "HIOS-Morning-Research/1.0",
      },
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(
        "YahooProvider: fundamentals request failed " +
          `with status ${response.status}.`
      );
    }

    const data =
      (await response.json()) as YahooQuoteResponse;

    if (data.quoteResponse?.error) {
      throw new Error(
        "YahooProvider: " +
          (data.quoteResponse.error.description ??
            "unknown Yahoo error")
      );
    }

    const result =
      data.quoteResponse?.result?.[0];

    if (!result) {
      throw new Error(
        "YahooProvider: fundamentals data is unavailable " +
          `for ${normalizedSymbol}.`
      );
    }

    return result;
  }

  async getQuote(
    symbol: string
  ): Promise<StockQuote> {
    const normalizedSymbol =
      this.normalizeSymbol(symbol);

    const result =
      await this.fetchChartData(
        normalizedSymbol,
        "5d",
        "1d"
      );

    const meta = result.meta;

    if (
      !meta ||
      typeof meta.regularMarketPrice !==
        "number"
    ) {
      throw new Error(
        "YahooProvider: quote data is unavailable " +
          `for ${normalizedSymbol}.`
      );
    }

    const previousClose =
      typeof meta.previousClose ===
      "number"
        ? meta.previousClose
        : typeof meta.chartPreviousClose ===
            "number"
          ? meta.chartPreviousClose
          : meta.regularMarketPrice;

    const change =
      meta.regularMarketPrice -
      previousClose;

    const changePercent =
      previousClose !== 0
        ? (change / previousClose) *
          100
        : 0;

    return {
      symbol:
        meta.symbol ??
        normalizedSymbol,

      name:
        meta.longName ??
        meta.shortName ??
        normalizedSymbol,

      price: meta.regularMarketPrice,

      change,

      changePercent,

      currency:
        meta.currency ?? "",

      marketState:
        meta.marketState ?? "UNKNOWN",

      metadata:
        this.createMetadata("fresh"),
    };
  }

  async getChart(
    symbol: string,
    range = "6mo",
    interval = "1d"
  ): Promise<StockChart> {
    const normalizedSymbol =
      this.normalizeSymbol(symbol);

    const result =
      await this.fetchChartData(
        normalizedSymbol,
        range,
        interval
      );

    const timestamps =
      result.timestamp ?? [];

    const quote =
      result.indicators?.quote?.[0];

    const candles =
      timestamps.flatMap(
        (time, index) => {
          const open =
            quote?.open?.[index];

          const high =
            quote?.high?.[index];

          const low =
            quote?.low?.[index];

          const close =
            quote?.close?.[index];

          const volume =
            quote?.volume?.[index];

          if (
            typeof open !== "number" ||
            typeof high !== "number" ||
            typeof low !== "number" ||
            typeof close !== "number"
          ) {
            return [];
          }

          return [
            {
              time,
              open,
              high,
              low,
              close,
              volume:
                typeof volume ===
                "number"
                  ? volume
                  : 0,
            },
          ];
        }
      );

    if (candles.length === 0) {
      throw new Error(
        "YahooProvider: valid candle data is unavailable " +
          `for ${normalizedSymbol}.`
      );
    }

    return {
      symbol:
        result.meta?.symbol ??
        normalizedSymbol,

      interval,

      range,

      candles,

      metadata:
        this.createMetadata("fresh"),
    };
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    const normalizedSymbol =
      this.normalizeSymbol(symbol);

    const data =
      await this.fetchQuoteData(
        normalizedSymbol
      );

    const marketCap =
      getPositiveNumber(
        data.marketCap
      );

    const peRatio =
      getPositiveNumber(
        data.trailingPE,
        data.forwardPE
      );

    const pbRatio =
      getPositiveNumber(
        data.priceToBook
      );

    const eps =
      getFiniteNumber(
        data.epsTrailingTwelveMonths
      ) ??
      getFiniteNumber(
        data.epsForward
      );

    const dividendYield =
      data.trailingAnnualDividendYield !==
      undefined
        ? normalizeRatioAsPercent(
            data.trailingAnnualDividendYield
          )
        : getFiniteNumber(
            data.dividendYield
          );

    const roe =
      normalizeRatioAsPercent(
        data.returnOnEquity
      );

    const hasUsableData =
      marketCap !== undefined ||
      peRatio !== undefined ||
      pbRatio !== undefined ||
      dividendYield !== undefined ||
      eps !== undefined ||
      roe !== undefined;

    if (!hasUsableData) {
      throw new Error(
        "YahooProvider: usable fundamentals are unavailable " +
          `for ${normalizedSymbol}.`
      );
    }

    return {
      marketCap,
      peRatio,
      pbRatio,
      dividendYield,
      eps,
      roe,
      metadata:
        this.createMetadata("delayed"),
    };
  }
}
