import type {
  StockChart,
  StockFundamentals,
  StockQuote,
} from "./types";

import { YahooProvider } from "./providers/yahoo";
import { FinnhubProvider } from "./providers/finnhub";

export interface MarketDataProvider {
  getQuote(
    symbol: string
  ): Promise<StockQuote>;

  getFundamentals(
    symbol: string
  ): Promise<StockFundamentals>;

  getChart?(
    symbol: string,
    range?: string,
    interval?: string
  ): Promise<StockChart>;
}

function normalizeSymbol(
  symbol: string
): string {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error(
      "MarketGateway: symbol is required."
    );
  }

  return normalizedSymbol;
}

function isFiniteNumber(
  value: unknown
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  );
}

function hasUsableFundamentals(
  data: StockFundamentals | null
): data is StockFundamentals {
  if (!data) {
    return false;
  }

  return (
    (
      isFiniteNumber(data.marketCap) &&
      data.marketCap > 0
    ) ||
    (
      isFiniteNumber(data.peRatio) &&
      data.peRatio > 0
    ) ||
    (
      isFiniteNumber(data.pbRatio) &&
      data.pbRatio > 0
    ) ||
    (
      isFiniteNumber(
        data.dividendYield
      ) &&
      data.dividendYield >= 0
    ) ||
    isFiniteNumber(data.eps) ||
    isFiniteNumber(data.roe)
  );
}

function hasCoreFundamentals(
  data: StockFundamentals | null
): boolean {
  if (!data) {
    return false;
  }

  return (
    (
      isFiniteNumber(data.marketCap) &&
      data.marketCap > 0
    ) ||
    (
      isFiniteNumber(data.peRatio) &&
      data.peRatio > 0
    )
  );
}

function getErrorMessage(
  error: unknown
): string {
  return error instanceof Error
    ? error.message
    : "Unknown provider error.";
}

export class MarketGateway {
  private yahoo =
    new YahooProvider();

  private finnhub =
    new FinnhubProvider();

  async getQuote(
    symbol: string
  ): Promise<StockQuote> {
    const normalizedSymbol =
      normalizeSymbol(symbol);

    return this.yahoo.getQuote(
      normalizedSymbol
    );
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    const normalizedSymbol =
      normalizeSymbol(symbol);

    let finnhubData:
      | StockFundamentals
      | null = null;

    let finnhubError:
      | unknown
      | null = null;

    try {
      finnhubData =
        await this.finnhub.getFundamentals(
          normalizedSymbol
        );

      if (
        hasCoreFundamentals(
          finnhubData
        )
      ) {
        return finnhubData;
      }

      console.warn(
        `Finnhub fundamentals for ${normalizedSymbol} ` +
          "do not contain P/E or Market Cap. " +
          "Trying Yahoo fallback."
      );
    } catch (error) {
      finnhubError = error;

      console.warn(
        `Finnhub fundamentals failed for ${normalizedSymbol}.`,
        error
      );
    }

    let yahooError:
      | unknown
      | null = null;

    try {
      const yahooData =
        await this.yahoo.getFundamentals(
          normalizedSymbol
        );

      if (
        hasUsableFundamentals(
          yahooData
        )
      ) {
        return yahooData;
      }

      yahooError = new Error(
        "Yahoo returned no usable fundamentals."
      );
    } catch (error) {
      yahooError = error;

      console.warn(
        `Yahoo fundamentals failed for ${normalizedSymbol}.`,
        error
      );
    }

    if (
      hasUsableFundamentals(
        finnhubData
      )
    ) {
      return finnhubData;
    }

    throw new Error(
      `Fundamentals are unavailable for ${normalizedSymbol}. ` +
        `Finnhub: ${
          finnhubError
            ? getErrorMessage(
                finnhubError
              )
            : "No usable data."
        } ` +
        `Yahoo: ${
          yahooError
            ? getErrorMessage(
                yahooError
              )
            : "No usable data."
        }`
    );
  }

  async getChart(
    symbol: string,
    range = "6mo",
    interval = "1d"
  ): Promise<StockChart> {
    const normalizedSymbol =
      normalizeSymbol(symbol);

    if (!this.yahoo.getChart) {
      throw new Error(
        "Chart provider is unavailable."
      );
    }

    return this.yahoo.getChart(
      normalizedSymbol,
      range,
      interval
    );
  }
}

export const marketGateway =
  new MarketGateway();
