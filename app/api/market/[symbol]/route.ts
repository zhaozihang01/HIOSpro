import { NextResponse } from "next/server";

export const revalidate = 900;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;

  const url =
    `https://query1.finance.yahoo.com/v8/finance/chart/` +
    `${encodeURIComponent(symbol)}` +
    `?range=6mo&interval=1d&includePrePost=false`;

  try {
    const response = await fetch(url, {
      next: {
        revalidate: 900,
      },
      headers: {
        "User-Agent": "Mozilla/5.0 HIOS",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `行情服务返回错误：${response.status}`,
        },
        {
          status: 502,
        }
      );
    }

    const payload = await response.json();
    const result = payload?.chart?.result?.[0];

    if (!result) {
      return NextResponse.json(
        {
          error: "没有取得行情数据",
        },
        {
          status: 502,
        }
      );
    }

    const quote = result.indicators?.quote?.[0];
    const timestamps: number[] = result.timestamp ?? [];

    const data = timestamps
      .map((time, index) => ({
        time,
        open: quote?.open?.[index],
        high: quote?.high?.[index],
        low: quote?.low?.[index],
        close: quote?.close?.[index],
        volume: quote?.volume?.[index] ?? 0,
      }))
      .filter(
        (item) =>
          Number.isFinite(item.open) &&
          Number.isFinite(item.high) &&
          Number.isFinite(item.low) &&
          Number.isFinite(item.close)
      );
let pe: number | null = null;
let marketCap: number | null = null;

try {
  const quoteResponse = await fetch(
    `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${encodeURIComponent(symbol)}`,
    {
      next: {
        revalidate: 900,
      },
      headers: {
        "User-Agent": "Mozilla/5.0 HIOS",
      },
    }
  );

  if (quoteResponse.ok) {
    const quotePayload = await quoteResponse.json();
    const quoteResult = quotePayload?.quoteResponse?.result?.[0];

    pe =
      typeof quoteResult?.trailingPE === "number"
        ? quoteResult.trailingPE
        : null;

    marketCap =
      typeof quoteResult?.marketCap === "number"
        ? quoteResult.marketCap
        : null;
  }
} catch {
  pe = null;
  marketCap = null;
}
    return NextResponse.json({
      symbol,
     name: result.meta?.shortName ?? result.meta?.longName ?? symbol, 
      currency: result.meta?.currency ?? "",
      marketPrice:
        result.meta?.regularMarketPrice ??
        data[data.length - 1]?.close ??
        null,
      previousClose:
  data[data.length - 2]?.close ??
  result.meta?.chartPreviousClose ??
  null,
      exchange: result.meta?.exchangeName ?? "",
pe,
marketCap,
data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "取得行情时发生未知错误",
      },
      {
        status: 500,
      }
    );
  }
}
