import { calculateATR } from "./atr";
import { calculateBollingerBands } from "./bollinger";
import { calculateMACD } from "./macd";
import { calculateMAs } from "./ma";
import { calculateRSI } from "./rsi";

import {
  AnalysisResult,
  PriceCandle,
} from "./types";

export function analyze(
  candles: PriceCandle[]
): AnalysisResult {
  return {
    ma: calculateMAs(candles),

    rsi: calculateRSI(candles),

    macd: calculateMACD(candles),

    bollinger: calculateBollingerBands(candles),

    atr: calculateATR(candles),
  };
}
