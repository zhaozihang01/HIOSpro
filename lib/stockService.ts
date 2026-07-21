import { movingAverage } from "./indicator";

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type StockData = {
  symbol: string;
  name: string;
  marketPrice: number;
  previousClose: number;
  currency: string;
  exchange: string;
  open: number;
  high: number;
  low: number;
  volume: number;
  pe: number | null;
  marketCap: number | null;
  candles: Candle[];
  ma5: (number | null)[];
  ma25: (number | null)[];
  ma75: (number | null)[];
  ma200: (number | null)[];
};

type UnknownRecord = Record<string, unknown>;

function isRecord(
  value: unknown
): value is UnknownRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getPath(
  source: UnknownRecord,
  path: string[]
): unknown {
  let current: unknown = source;

  for (const key of path) {
    if (!isRecord(current)) {
      return undefined;
    }

    current = current[key];
  }

  return current;
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
    value.trim() !== ""
  ) {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function getFirstNumber(
  sources: UnknownRecord[],
  keys: string[]
): number | null {
  for (const source of sources) {
    for (const key of keys) {
      const value =
        toFiniteNumber(source[key]);

      if (value !== null) {
        return value;
      }
    }
  }

  return null;
}

function getFirstString(
  sources: UnknownRecord[],
  keys: string[],
  fallback: string
): string {
  for (const source of sources) {
    for (const key of keys) {
      const value = source[key];

      if (
        typeof value === "string" &&
        value.trim().length > 0
      ) {
        return value.trim();
      }
    }
  }

  return fallback;
}

function normalizeTime(
  value: unknown,
  fallback: number
): number {
  const numericValue =
    toFiniteNumber(value);

  if (numericValue !== null) {
    return numericValue >
      1_000_000_000_000
      ? Math.floor(
          numericValue / 1000
        )
      : Math.floor(numericValue);
  }

  if (typeof value === "string") {
    const parsedDate =
      Date.parse(value);

    if (
      Number.isFinite(parsedDate)
    ) {
      return Math.floor(
        parsedDate / 1000
      );
    }
  }

  return fallback;
}

function parseCandle(
  value: unknown,
  fallbackTime: number
): Candle | null {
  if (!isRecord(value)) {
    return null;
  }

  const close = getFirstNumber(
    [value],
    [
      "close",
      "adjClose",
      "adjustedClose",
      "price",
    ]
  );

  if (close === null) {
    return null;
  }

  const open =
    getFirstNumber(
      [value],
      ["open"]
    ) ?? close;

  const high =
    getFirstNumber(
      [value],
      ["high"]
    ) ??
    Math.max(open, close);

  const low =
    getFirstNumber(
      [value],
      ["low"]
    ) ??
    Math.min(open, close);

  const volume =
    getFirstNumber(
      [value],
      ["volume"]
    ) ?? 0;

  return {
    time: normalizeTime(
      value.time ??
        value.timestamp ??
        value.date ??
        value.datetime,
      fallbackTime
    ),
    open,
    high,
    low,
    close,
    volume,
  };
}

function getArray(
  source: UnknownRecord,
  keys: string[]
): unknown[] | null {
  for (const key of keys) {
    const value = source[key];

    if (Array.isArray(value)) {
      return value;
    }
  }

  return null;
}

function parseParallelChart(
  source: UnknownRecord
): Candle[] {
  const closes = getArray(
    source,
    ["close", "closes"]
  );

  if (!closes) {
    return [];
  }

  const times =
    getArray(source, [
      "time",
      "times",
      "timestamp",
      "timestamps",
      "date",
      "dates",
    ]) ?? [];

  const opens =
    getArray(
      source,
      ["open", "opens"]
    ) ?? [];

  const highs =
    getArray(
      source,
      ["high", "highs"]
    ) ?? [];

  const lows =
    getArray(
      source,
      ["low", "lows"]
    ) ?? [];

  const volumes =
    getArray(
      source,
      ["volume", "volumes"]
    ) ?? [];

  const now = Math.floor(
    Date.now() / 1000
  );

  return closes
    .map(
      (
        closeValue,
        index
      ): Candle | null => {
        const close =
          toFiniteNumber(
            closeValue
          );

        if (close === null) {
          return null;
        }

        const open =
          toFiniteNumber(
            opens[index]
          ) ?? close;

        const high =
          toFiniteNumber(
            highs[index]
          ) ??
          Math.max(open, close);

        const low =
          toFiniteNumber(
            lows[index]
          ) ??
          Math.min(open, close);

        const volume =
          toFiniteNumber(
            volumes[index]
          ) ?? 0;

        return {
          time: normalizeTime(
            times[index],
            now -
              (
                closes.length -
                index
              ) *
                86400
          ),
          open,
          high,
          low,
          close,
          volume,
        };
      }
    )
    .filter(
      (
        candle
      ): candle is Candle =>
        candle !== null
    );
}

function parseCandleCollection(
  value: unknown
): Candle[] {
  const now = Math.floor(
    Date.now() / 1000
  );

  if (Array.isArray(value)) {
    return value
      .map(
        (
          item,
          index
        ) =>
          parseCandle(
            item,
            now -
              (
                value.length -
                index
              ) *
                86400
          )
      )
      .filter(
        (
          candle
        ): candle is Candle =>
          candle !== null
      );
  }

  if (!isRecord(value)) {
    return [];
  }

  const nestedArray = getArray(
    value,
    [
      "candles",
      "data",
      "items",
      "prices",
      "history",
    ]
  );

  if (nestedArray) {
    return parseCandleCollection(
      nestedArray
    );
  }

  return parseParallelChart(
    value
  );
}

function extractCandles(
  root: UnknownRecord
): Candle[] {
  const candidates: unknown[] = [
    getPath(root, ["data"]),
    getPath(root, ["candles"]),
    getPath(root, ["chart"]),
    getPath(root, [
      "chart",
      "candles",
    ]),
    getPath(root, [
      "chart",
      "data",
    ]),
    getPath(root, [
      "market",
      "chart",
    ]),
    getPath(root, [
      "market",
      "candles",
    ]),
    getPath(root, [
      "marketData",
      "chart",
    ]),
    getPath(root, [
      "marketData",
      "candles",
    ]),
    getPath(root, [
      "research",
      "market",
      "chart",
    ]),
  ];

  for (
    const candidate of candidates
  ) {
    const candles =
      parseCandleCollection(
        candidate
      );

    if (candles.length > 0) {
      return candles.sort(
        (first, second) =>
          first.time -
          second.time
      );
    }
  }

  return [];
}

function collectQuoteSources(
  root: UnknownRecord
): UnknownRecord[] {
  const candidates: unknown[] = [
    getPath(root, ["quote"]),
    getPath(root, [
      "market",
      "quote",
    ]),
    getPath(root, [
      "marketData",
      "quote",
    ]),
    getPath(root, [
      "data",
      "quote",
    ]),
    getPath(root, [
      "research",
      "market",
      "quote",
    ]),
    root,
  ];

  return candidates.filter(
    isRecord
  );
}

export async function getStockData(
  symbol: string
): Promise<StockData> {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error(
      "股票代码不能为空"
    );
  }

  const response = await fetch(
    `/api/market/${encodeURIComponent(
      normalizedSymbol
    )}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    let message =
      "获取股票数据失败";

    try {
      const errorBody =
        await response.text();

      if (errorBody.trim()) {
        message =
          `${message}：${errorBody}`;
      }
    } catch {
      // 保留默认错误信息
    }

    throw new Error(message);
  }

  const rawJson: unknown =
    await response.json();

  if (!isRecord(rawJson)) {
    throw new Error(
      "行情接口返回格式不正确"
    );
  }

  const quoteSources =
    collectQuoteSources(rawJson);

  let candles =
    extractCandles(rawJson);

  let marketPrice =
    getFirstNumber(
      quoteSources,
      [
        "marketPrice",
        "price",
        "regularMarketPrice",
        "currentPrice",
        "lastPrice",
        "close",
      ]
    );

  if (
    marketPrice === null &&
    candles.length > 0
  ) {
    marketPrice =
      candles[
        candles.length - 1
      ].close;
  }

  if (marketPrice === null) {
    throw new Error(
      "行情接口没有返回有效的股票价格"
    );
  }

  if (candles.length === 0) {
    const open =
      getFirstNumber(
        quoteSources,
        [
          "open",
          "regularMarketOpen",
        ]
      ) ?? marketPrice;

    const high =
      getFirstNumber(
        quoteSources,
        [
          "high",
          "regularMarketDayHigh",
          "dayHigh",
        ]
      ) ??
      Math.max(
        open,
        marketPrice
      );

    const low =
      getFirstNumber(
        quoteSources,
        [
          "low",
          "regularMarketDayLow",
          "dayLow",
        ]
      ) ??
      Math.min(
        open,
        marketPrice
      );

    const volume =
      getFirstNumber(
        quoteSources,
        [
          "volume",
          "regularMarketVolume",
        ]
      ) ?? 0;

    candles = [
      {
        time: Math.floor(
          Date.now() / 1000
        ),
        open,
        high,
        low,
        close: marketPrice,
        volume,
      },
    ];
  }

  const latestCandle =
    candles[
      candles.length - 1
    ];

  const previousCandle =
    candles.length > 1
      ? candles[
          candles.length - 2
        ]
      : null;

  const previousClose =
    getFirstNumber(
      quoteSources,
      [
        "previousClose",
        "regularMarketPreviousClose",
        "prevClose",
      ]
    ) ??
    previousCandle?.close ??
    marketPrice;

  const closes =
    candles.map(
      (candle) =>
        candle.close
    );

  return {
    symbol: getFirstString(
      quoteSources,
      ["symbol", "ticker"],
      normalizedSymbol
    ),

    name: getFirstString(
      quoteSources,
      [
        "name",
        "shortName",
        "longName",
        "displayName",
      ],
      normalizedSymbol
    ),

    marketPrice,

    previousClose,

    currency: getFirstString(
      quoteSources,
      ["currency"],
      normalizedSymbol.endsWith(
        ".T"
      )
        ? "JPY"
        : "USD"
    ),

    exchange: getFirstString(
      quoteSources,
      [
        "exchange",
        "fullExchangeName",
        "market",
      ],
      normalizedSymbol.endsWith(
        ".T"
      )
        ? "TSE"
        : "US"
    ),

    open:
      getFirstNumber(
        quoteSources,
        [
          "open",
          "regularMarketOpen",
        ]
      ) ??
      latestCandle.open,

    high:
      getFirstNumber(
        quoteSources,
        [
          "high",
          "regularMarketDayHigh",
          "dayHigh",
        ]
      ) ??
      latestCandle.high,

    low:
      getFirstNumber(
        quoteSources,
        [
          "low",
          "regularMarketDayLow",
          "dayLow",
        ]
      ) ??
      latestCandle.low,

    volume:
      getFirstNumber(
        quoteSources,
        [
          "volume",
          "regularMarketVolume",
        ]
      ) ??
      latestCandle.volume,

    pe: getFirstNumber(
      quoteSources,
      [
        "pe",
        "trailingPE",
        "forwardPE",
        "priceEarnings",
      ]
    ),

    marketCap:
      getFirstNumber(
        quoteSources,
        [
          "marketCap",
          "marketCapitalization",
        ]
      ),

    candles,

    ma5: movingAverage(
      closes,
      5
    ),

    ma25: movingAverage(
      closes,
      25
    ),

    ma75: movingAverage(
      closes,
      75
    ),

    ma200: movingAverage(
      closes,
      200
    ),
  };
}
