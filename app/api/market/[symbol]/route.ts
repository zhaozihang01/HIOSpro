import { NextRequest, NextResponse } from "next/server";
import { getStockResearch } from "@/lib/market/research";

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

    const searchParams = request.nextUrl.searchParams;

    const range =
      searchParams.get("range") ?? "6mo";

    const interval =
      searchParams.get("interval") ?? "1d";

    const data = await getStockResearch(
      symbol,
      range,
      interval
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);

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
