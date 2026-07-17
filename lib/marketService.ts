export type MarketSnapshot = {
  nikkei: number;
  topix: number;
  usdJpy: number;
};

type MarketApiResponse = {
  marketPrice: number;
  previousClose: number;
};

async function fetchMarketData(symbol: string): Promise<MarketApiResponse> {
  const response = await fetch(
    `/api/market/${encodeURIComponent(symbol)}`,
    {
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(`获取 ${symbol} 失败`);
  }

  return response.json();
}

function calculateChange(
  marketPrice: number,
  previousClose: number
): number {
  if (previousClose === 0) {
    return 0;
  }

  return ((marketPrice - previousClose) / previousClose) * 100;
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  try {
    const [nikkeiData, topixData, usdJpyData] = await Promise.all([
      fetchMarketData("^N225"),
      fetchMarketData("1306.T"),
      fetchMarketData("JPY=X"),
    ]);

    return {
      nikkei: calculateChange(
        nikkeiData.marketPrice,
        nikkeiData.previousClose
      ),
      topix: calculateChange(
        topixData.marketPrice,
        topixData.previousClose
      ),
      usdJpy: usdJpyData.marketPrice,
    };
  } catch (error) {
    console.error("市场数据读取失败：", error);

    return {
      nikkei: 0,
      topix: 0,
      usdJpy: 0,
    };
  }
}
