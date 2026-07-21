import type { MarketDataProvider } from "../gateway";

import type {
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
  value: unknown
): number | undefined {
  const number = getFiniteNumber(value);

  if (
    number === undefined ||
    number <= 0
  ) {
    return undefined;
  }

  return number;
}

function normalizeMarketCap(
  value: unknown
): number | undefined {
  const marketCap =
    getPositiveNumber(value);

  if (marketCap === undefined) {
    return undefined;
  }

  /*
   * Finnhub 的 basic financials 数据经常以
   * “百万货币单位”返回 Market Cap。
   *
   * 例如：
   * 2910 → 2,910,000,000
   *
   * 如果未来接口已经返回完整金额，
   * 大于等于 10,000,000 时保留原值，
   * 避免重复乘以 1,000,000。
   */
  if (marketCap < 10_000_000) {
    return marketCap * 1_000_000;
  }

  return marketCap;
}

function hasUsableFundamentals(
  fundamentals: Omit<
    StockFundamentals,
    "metadata"
  >
): boolean {
  return (
    fundamentals.marketCap !== undefined ||
    fundamentals.peRatio !== undefined ||
    fundamentals.pbRatio !== undefined ||
    fundamentals.dividendYield !== undefined ||
    fundamentals.eps !== undefined ||
    fundamentals.roe !== undefined
  );
}

export class FinnhubProvider
  implements MarketDataProvider
{
  private createMetadata(
    status: DataMetadata["status"]
  ): DataMetadata {
    return {
      source: "finnhub",
      updatedAt: new Date().toISOString(),
      status,
    };
  }

  async getQuote(
    _symbol: string
  ): Promise<StockQuote> {
    throw new Error(
      "FinnhubProvider does not provide quote data."
    );
  }

  async getFundamentals(
    symbol: string
  ): Promise<StockFundamentals> {
    const normalizedSymbol =
      symbol.trim().toUpperCase();

    if (!normalizedSymbol) {
      throw new Error(
        "FinnhubProvider: symbol is required."
      );
    }

    const apiKey =
      process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      throw new Error(
        "FINNHUB_API_KEY is not configured."
      );
    }

    const url =
      "https://finnhub.io/api/v1/stock/metric" +
      "?metric=all" +
      `&symbol=${encodeURIComponent(
        normalizedSymbol
      )}` +
      `&token=${encodeURIComponent(
        apiKey
      )}`;

    const response = await fetch(url, {
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      throw new Error(
        "Finnhub fundamentals request failed " +
          `with status ${response.status}.`
      );
    }

    const data =
      (await response.json()) as FinnhubMetricResponse;

    const metric = data.metric;

    if (!metric) {
      throw new Error(
        `Finnhub returned no fundamentals for ${normalizedSymbol}.`
      );
    }

    const fundamentals: Omit<
      StockFundamentals,
      "metadata"
    > = {
      marketCap: normalizeMarketCap(
        metric.marketCapitalization
      ),

      peRatio: getPositiveNumber(
        metric.peTTM
      ),

      pbRatio: getPositiveNumber(
        metric.pbAnnual
      ),

      dividendYield: getFiniteNumber(
        metric.dividendYieldIndicatedAnnual
      ),

      eps: getFiniteNumber(
        metric.epsTTM
      ),

      roe: getFiniteNumber(
        metric.roeTTM
      ),
    };

    if (
      !hasUsableFundamentals(
        fundamentals
      )
    ) {
      throw new Error(
        `Finnhub returned no usable fundamentals for ${normalizedSymbol}.`
      );
    }

    return {
      ...fundamentals,
      metadata:
        this.createMetadata("fresh"),
    };
  }
}
