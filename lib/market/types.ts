/**
 * HIOS Core Data Types
 * Version: 1.1
 */

export type DataSource =
  | "yahoo"
  | "finnhub"
  | "jpx"
  | "sec"
  | "edinet"
  | "manual";

export type DataStatus =
  | "fresh"
  | "delayed"
  | "stale"
  | "missing"
  | "unavailable";

export interface DataMetadata {
  source: DataSource;
  updatedAt: string;
  status: DataStatus;
}

export interface StockSymbol {
  symbol: string;
  exchange: string;
  currency: string;
  market: string;
}

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  marketState: string;
  metadata: DataMetadata;
}

export interface StockFundamentals {
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  dividendYield?: number;
  eps?: number;
  roe?: number;
  metadata: DataMetadata;
}

export interface StockCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface StockChart {
  symbol: string;
  interval: string;
  range: string;
  candles: StockCandle[];
  metadata: DataMetadata;
}
