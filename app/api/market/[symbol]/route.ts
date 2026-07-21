import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  generateStockResearch,
} from "@/lib/research";

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const { symbol } = await params;

    const normalizedSymbol =
      decodeURIComponent(symbol)
        .trim()
        .toUpperCase();

    if (!normalizedSymbol) {
      return NextResponse.json(
        {
          error: "Stock symbol is required.",
        },
        {
          status: 400,
        }
      );
    }

    const searchParams =
      request.nextUrl.searchParams;

    const range =
      searchParams.get("range") ?? "6mo";

    const interval =
      searchParams.get("interval") ?? "1d";

    const data =
      await generateStockResearch(
        normalizedSymbol,
        range,
        interval
      );

    return NextResponse.json(data);
  } catch (error) {
    console.error(
      "Stock research API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
