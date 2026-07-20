import { marketGateway } from "./gateway";
import {
  StockFundamentals,
  StockQuote,
} from "./types";

export interface MarketDataWarning {
  section: "quote" | "fundamentals";
  message: string;
}

export interface StockMarketData {
  symbol: string;
  quote: StockQuote | null;
  fundamentals: StockFundamentals | null;
  warnings: MarketDataWarning[];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unknown market data error.";
}

export async function getStockMarketData(
  symbol: string
): Promise<StockMarketData> {
  const normalizedSymbol = symbol.trim().toUpperCase();

  if (!normalizedSymbol) {
    throw new Error("Symbol is required.");
  }

  const [quoteResult, fundamentalsResult] =
    await Promise.allSettled([
      marketGateway.getQuote(normalizedSymbol),
      marketGateway.getFundamentals(normalizedSymbol),
    ]);

  const warnings: MarketDataWarning[] = [];

  let quote: StockQuote | null = null;
  let fundamentals: StockFundamentals | null = null;

  if (quoteResult.status === "fulfilled") {
    quote = quoteResult.value;
  } else {
    warnings.push({
      section: "quote",
      message: getErrorMessage(quoteResult.reason),
    });
  }

  if (fundamentalsResult.status === "fulfilled") {
    fundamentals = fundamentalsResult.value;
  } else {
    warnings.push({
      section: "fundamentals",
      message: getErrorMessage(fundamentalsResult.reason),
    });
  }

  if (!quote && !fundamentals) {
    throw new Error(
      `No market data is available for ${normalizedSymbol}.`
    );
  }

  return {
    symbol: normalizedSymbol,
    quote,
    fundamentals,
    warnings,
  };
}
