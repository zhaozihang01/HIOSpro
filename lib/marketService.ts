export type MarketSnapshot = {
  nikkei: number;
  topix: number;
  usdJpy: number;
};

type MarketQuote = {
  price: number;
  change: number | null;
  changePercent: number | null;
};

type UnknownRecord = Record<
  string,
  unknown
>;

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function toFiniteNumber(
  value: unknown
): number | null {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string" &&
    value.trim().length > 0
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

async function fetchMarketQuote(
  symbol: string
): Promise<MarketQuote> {
  const response = await fetch(
    `/api/market/${encodeURIComponent(
      symbol
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message =
      `获取 ${symbol} 失败`;

    try {
      const body: unknown =
        await response.json();

      if (
        isRecord(body) &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // 保留默认错误信息
    }

    throw new Error(message);
  }

  const body: unknown =
    await response.json();

  if (!isRecord(body)) {
    throw new Error(
      `${symbol} 返回格式不正确`
    );
  }

  const quote = body.quote;

  if (!isRecord(quote)) {
    throw new Error(
      `${symbol} 没有可用的 Quote 数据`
    );
  }

  const price =
    toFiniteNumber(
      quote.price
    );

  if (
    price === null ||
    price <= 0
  ) {
    throw new Error(
      `${symbol} 没有有效价格`
    );
  }

  return {
    price,

    change:
      toFiniteNumber(
        quote.change
      ),

    changePercent:
      toFiniteNumber(
        quote.changePercent
      ),
  };
}

function getChangePercent(
  quote: MarketQuote
): number {
  if (
    quote.changePercent !== null
  ) {
    return quote.changePercent;
  }

  if (quote.change === null) {
    return Number.NaN;
  }

  const previousClose =
    quote.price -
    quote.change;

  if (
    !Number.isFinite(
      previousClose
    ) ||
    previousClose === 0
  ) {
    return Number.NaN;
  }

  return (
    (
      quote.change /
      previousClose
    ) * 100
  );
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const [
    nikkeiResult,
    topixResult,
    usdJpyResult,
  ] =
    await Promise.allSettled([
      fetchMarketQuote(
        "^N225"
      ),

      /*
       * Yahoo上的^TOPX请求不稳定，
       * 因此使用流动性较高的TOPIX ETF
       * 1306.T作为市场走势代理。
       */
      fetchMarketQuote(
        "1306.T"
      ),

      fetchMarketQuote(
        "JPY=X"
      ),
    ]);

  if (
    nikkeiResult.status ===
    "rejected"
  ) {
    console.error(
      "Nikkei 225 数据读取失败：",
      nikkeiResult.reason
    );
  }

  if (
    topixResult.status ===
    "rejected"
  ) {
    console.error(
      "TOPIX代理数据读取失败：",
      topixResult.reason
    );
  }

  if (
    usdJpyResult.status ===
    "rejected"
  ) {
    console.error(
      "USDJPY 数据读取失败：",
      usdJpyResult.reason
    );
  }

  return {
    nikkei:
      nikkeiResult.status ===
      "fulfilled"
        ? getChangePercent(
            nikkeiResult.value
          )
        : Number.NaN,

    topix:
      topixResult.status ===
      "fulfilled"
        ? getChangePercent(
            topixResult.value
          )
        : Number.NaN,

    usdJpy:
      usdJpyResult.status ===
      "fulfilled"
        ? usdJpyResult.value
            .price
        : Number.NaN,
  };
}
