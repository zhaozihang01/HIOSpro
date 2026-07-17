export type MarketSnapshot = {
  nikkei: number;
  topix: number;
  usdJpy: number;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
      };
    }>;
  };
};

async function fetchYahooChange(symbol: string): Promise<number> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=5d&interval=1d`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol}`);
  }

  const data: YahooChartResponse = await response.json();
  const meta = data.chart?.result?.[0]?.meta;

  const price = meta?.regularMarketPrice;
  const previousClose = meta?.chartPreviousClose;

  if (
    typeof price !== "number" ||
    typeof previousClose !== "number" ||
    previousClose === 0
  ) {
    throw new Error(`Invalid market data for ${symbol}`);
  }

  return ((price - previousClose) / previousClose) * 100;
}

async function fetchYahooPrice(symbol: string): Promise<number> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
      symbol
    )}?range=1d&interval=1d`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch ${symbol}`);
  }

  const data: YahooChartResponse = await response.json();
  const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;

  if (typeof price !== "number") {
    throw new Error(`Invalid market data for ${symbol}`);
  }

  return price;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  try {
    const [nikkei, topix, usdJpy] = await Promise.all([
      fetchYahooChange("^N225"),
      fetchYahooChange("^TOPX"),
      fetchYahooPrice("JPY=X"),
    ]);

    return {
      nikkei,
      topix,
      usdJpy,
    };
  } catch {
    return {
      nikkei: 0,
      topix: 0,
      usdJpy: 0,
    };
  }
}
