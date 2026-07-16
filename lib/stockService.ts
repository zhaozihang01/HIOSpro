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
  marketPrice: number;
  previousClose: number;
  currency: string;
  exchange: string;
  candles: Candle[];
  ma5: (number | null)[];
  ma25: (number | null)[];
  ma75: (number | null)[];
};

export async function getStockData(
  symbol: string
): Promise<StockData> {

  const response = await fetch(
    `/api/market/${symbol}`
  );

  if (!response.ok) {
    throw new Error("获取股票数据失败");
  }

  const json = await response.json();

  const closes = json.data.map(
    (item: Candle) => item.close
  );

  return {
    symbol: json.symbol,
    marketPrice: json.marketPrice,
    previousClose: json.previousClose,
    currency: json.currency,
    exchange: json.exchange,
    candles: json.data,
    ma5: movingAverage(closes, 5),
    ma25: movingAverage(closes, 25),
    ma75: movingAverage(closes, 75),
  };
}
