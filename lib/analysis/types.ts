export interface PriceCandle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IndicatorPoint {
  time: number;
  value: number;
}

export interface IndicatorSeries {
  name: string;
  values: IndicatorPoint[];
}

export interface AnalysisResult {
  ma?: Record<number, IndicatorSeries>;
  rsi?: IndicatorSeries;
  macd?: {
    macd: IndicatorSeries;
    signal: IndicatorSeries;
    histogram: IndicatorSeries;
  };
  bollinger?: {
    upper: IndicatorSeries;
    middle: IndicatorSeries;
    lower: IndicatorSeries;
  };
  atr?: IndicatorSeries;
}
