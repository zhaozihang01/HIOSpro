import type {
  InvestmentAssetType,
  InvestmentCurrency,
  InvestmentMarket,
  InvestmentUniverseItem,
} from "@/lib/screener/types";

type UniverseSeed = readonly [
  symbol: string,
  name: string,
  sector: string,
  theme: string,
];

type UniverseDefaults = {
  market: InvestmentMarket;
  exchange: string;
  currency: InvestmentCurrency;
  assetType: InvestmentAssetType;
};

function buildUniverseItems(
  seeds: readonly UniverseSeed[],
  defaults: UniverseDefaults
): InvestmentUniverseItem[] {
  return seeds.map(
    ([
      symbol,
      name,
      sector,
      theme,
    ]) => ({
      symbol,
      name,
      sector,
      theme,
      market: defaults.market,
      exchange: defaults.exchange,
      currency: defaults.currency,
      assetType: defaults.assetType,
      enabled: true,
    })
  );
}

const japanStocks = [
  [
    "7203.T",
    "Toyota Motor",
    "Automobiles",
    "Japan large cap",
  ],
  [
    "6758.T",
    "Sony Group",
    "Consumer Electronics",
    "Japan large cap",
  ],
  [
    "8306.T",
    "Mitsubishi UFJ Financial Group",
    "Banks",
    "Japan financials",
  ],
  [
    "8316.T",
    "Sumitomo Mitsui Financial Group",
    "Banks",
    "Japan financials",
  ],
  [
    "8411.T",
    "Mizuho Financial Group",
    "Banks",
    "Japan financials",
  ],
  [
    "6501.T",
    "Hitachi",
    "Industrial Technology",
    "Digital infrastructure",
  ],
  [
    "6503.T",
    "Mitsubishi Electric",
    "Industrial Technology",
    "Factory automation",
  ],
  [
    "6702.T",
    "Fujitsu",
    "Information Technology",
    "Digital transformation",
  ],
  [
    "6701.T",
    "NEC",
    "Information Technology",
    "Digital infrastructure",
  ],
  [
    "9984.T",
    "SoftBank Group",
    "Investment Holdings",
    "Technology growth",
  ],
  [
    "9432.T",
    "NTT",
    "Telecommunications",
    "Defensive income",
  ],
  [
    "9433.T",
    "KDDI",
    "Telecommunications",
    "Defensive income",
  ],
  [
    "9434.T",
    "SoftBank Corp.",
    "Telecommunications",
    "Defensive income",
  ],
  [
    "8035.T",
    "Tokyo Electron",
    "Semiconductors",
    "AI and semiconductor",
  ],
  [
    "6857.T",
    "Advantest",
    "Semiconductors",
    "AI and semiconductor",
  ],
  [
    "6146.T",
    "DISCO",
    "Semiconductor Equipment",
    "AI and semiconductor",
  ],
  [
    "4063.T",
    "Shin-Etsu Chemical",
    "Materials",
    "Semiconductor materials",
  ],
  [
    "6367.T",
    "Daikin Industries",
    "Industrial Machinery",
    "Energy efficiency",
  ],
  [
    "6954.T",
    "FANUC",
    "Industrial Machinery",
    "Factory automation",
  ],
  [
    "7011.T",
    "Mitsubishi Heavy Industries",
    "Aerospace and Defense",
    "Defense and infrastructure",
  ],
  [
    "7012.T",
    "Kawasaki Heavy Industries",
    "Aerospace and Defense",
    "Defense and infrastructure",
  ],
  [
    "7013.T",
    "IHI",
    "Aerospace and Defense",
    "Defense and infrastructure",
  ],
  [
    "8058.T",
    "Mitsubishi Corporation",
    "Trading Companies",
    "Diversified value",
  ],
  [
    "8001.T",
    "ITOCHU",
    "Trading Companies",
    "Diversified value",
  ],
  [
    "8031.T",
    "Mitsui & Co.",
    "Trading Companies",
    "Diversified value",
  ],
  [
    "8002.T",
    "Marubeni",
    "Trading Companies",
    "Diversified value",
  ],
  [
    "8053.T",
    "Sumitomo Corporation",
    "Trading Companies",
    "Diversified value",
  ],
  [
    "2914.T",
    "Japan Tobacco",
    "Consumer Staples",
    "Dividend income",
  ],
  [
    "2502.T",
    "Asahi Group Holdings",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "2503.T",
    "Kirin Holdings",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "2802.T",
    "Ajinomoto",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "4452.T",
    "Kao",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "4911.T",
    "Shiseido",
    "Consumer Discretionary",
    "Asia consumer",
  ],
  [
    "4502.T",
    "Takeda Pharmaceutical",
    "Healthcare",
    "Defensive healthcare",
  ],
  [
    "4519.T",
    "Chugai Pharmaceutical",
    "Healthcare",
    "Biopharma",
  ],
  [
    "4568.T",
    "Daiichi Sankyo",
    "Healthcare",
    "Biopharma",
  ],
  [
    "4578.T",
    "Otsuka Holdings",
    "Healthcare",
    "Defensive healthcare",
  ],
  [
    "6098.T",
    "Recruit Holdings",
    "Business Services",
    "Digital platforms",
  ],
  [
    "9983.T",
    "Fast Retailing",
    "Retail",
    "Global consumer",
  ],
  [
    "7974.T",
    "Nintendo",
    "Entertainment",
    "Gaming",
  ],
  [
    "7832.T",
    "Bandai Namco Holdings",
    "Entertainment",
    "Gaming",
  ],
  [
    "4661.T",
    "Oriental Land",
    "Leisure",
    "Japan tourism",
  ],
  [
    "9020.T",
    "East Japan Railway",
    "Transportation",
    "Japan reopening",
  ],
  [
    "9022.T",
    "Central Japan Railway",
    "Transportation",
    "Japan reopening",
  ],
  [
    "9101.T",
    "Nippon Yusen",
    "Shipping",
    "Global trade",
  ],
  [
    "9104.T",
    "Mitsui O.S.K. Lines",
    "Shipping",
    "Global trade",
  ],
  [
    "9107.T",
    "Kawasaki Kisen",
    "Shipping",
    "Global trade",
  ],
  [
    "7267.T",
    "Honda Motor",
    "Automobiles",
    "Mobility",
  ],
  [
    "7270.T",
    "Subaru",
    "Automobiles",
    "Mobility",
  ],
  [
    "7201.T",
    "Nissan Motor",
    "Automobiles",
    "Mobility",
  ],
] as const satisfies readonly UniverseSeed[];

const japanInsuranceStocks = [
  [
    "8766.T",
    "Tokio Marine Holdings",
    "Insurance",
    "Property and casualty",
  ],
  [
    "8725.T",
    "MS&AD Insurance Group Holdings",
    "Insurance",
    "Property and casualty",
  ],
  [
    "8630.T",
    "Sompo Holdings",
    "Insurance",
    "Property and casualty",
  ],
  [
    "8750.T",
    "Dai-ichi Life Holdings",
    "Insurance",
    "Life insurance",
  ],
  [
    "8795.T",
    "T&D Holdings",
    "Insurance",
    "Life insurance",
  ],
] as const satisfies readonly UniverseSeed[];

const japanEtfs = [
  [
    "1306.T",
    "NEXT FUNDS TOPIX ETF",
    "Broad Japan Equity",
    "Core Japan",
  ],
  [
    "1321.T",
    "NEXT FUNDS Nikkei 225 ETF",
    "Large Cap Japan Equity",
    "Nikkei 225",
  ],
  [
    "1330.T",
    "NEXT FUNDS Nikkei 225 ETF",
    "Large Cap Japan Equity",
    "Nikkei 225",
  ],
  [
    "1346.T",
    "MAXIS Nikkei 225 ETF",
    "Large Cap Japan Equity",
    "Nikkei 225",
  ],
  [
    "1475.T",
    "iShares Core TOPIX ETF",
    "Broad Japan Equity",
    "Core Japan",
  ],
  [
    "1489.T",
    "NEXT FUNDS Nikkei 225 High Dividend Yield Stock 50 ETF",
    "Dividend Equity",
    "Japan dividend",
  ],
  [
    "1494.T",
    "One ETF High Dividend Japan Equity",
    "Dividend Equity",
    "Japan dividend",
  ],
  [
    "1570.T",
    "NEXT FUNDS Nikkei 225 Leveraged ETF",
    "Leveraged Equity",
    "Tactical",
  ],
  [
    "1357.T",
    "NEXT FUNDS Nikkei 225 Double Inverse ETF",
    "Inverse Equity",
    "Hedging",
  ],
  [
    "2558.T",
    "MAXIS S&P 500 US Equity ETF",
    "US Equity",
    "S&P 500",
  ],
  [
    "2631.T",
    "MAXIS NASDAQ 100 ETF",
    "US Equity",
    "NASDAQ 100",
  ],
  [
    "1545.T",
    "NEXT FUNDS NASDAQ-100 ETF",
    "US Equity",
    "NASDAQ 100",
  ],
  [
    "1655.T",
    "iShares S&P 500 ETF",
    "US Equity",
    "S&P 500",
  ],
  [
    "2563.T",
    "iShares S&P 500 JPY Hedged ETF",
    "US Equity Hedged",
    "S&P 500",
  ],
  [
    "2621.T",
    "iShares 20+ Year US Treasury Bond JPY Hedged ETF",
    "Long Duration Bonds",
    "US Treasuries",
  ],
  [
    "2510.T",
    "NEXT FUNDS Japan Bond NOMURA-BPI Comprehensive ETF",
    "Japan Bonds",
    "Defensive income",
  ],
  [
    "1343.T",
    "NEXT FUNDS Tokyo Stock Exchange REIT Index ETF",
    "Japan REIT",
    "Listed real estate",
  ],
  [
    "1597.T",
    "MAXIS J-REIT ETF",
    "Japan REIT",
    "Listed real estate",
  ],
] as const satisfies readonly UniverseSeed[];

const japanReits = [
  [
    "8951.T",
    "Nippon Building Fund",
    "Office REIT",
    "Prime offices",
  ],
  [
    "8952.T",
    "Japan Real Estate Investment",
    "Office REIT",
    "Prime offices",
  ],
  [
    "8953.T",
    "Japan Metropolitan Fund Investment",
    "Diversified REIT",
    "Urban assets",
  ],
  [
    "8954.T",
    "ORIX JREIT",
    "Diversified REIT",
    "Diversified income",
  ],
  [
    "8955.T",
    "Japan Prime Realty Investment",
    "Diversified REIT",
    "Office and retail",
  ],
  [
    "8956.T",
    "NTT UD REIT Investment",
    "Diversified REIT",
    "Office and residential",
  ],
  [
    "8957.T",
    "Tokyu REIT",
    "Diversified REIT",
    "Tokyo urban assets",
  ],
  [
    "8960.T",
    "United Urban Investment",
    "Diversified REIT",
    "Diversified income",
  ],
  [
    "8961.T",
    "Mori Trust REIT",
    "Diversified REIT",
    "Prime real estate",
  ],
  [
    "8963.T",
    "Invincible Investment",
    "Hotel REIT",
    "Tourism",
  ],
  [
    "8972.T",
    "KDX Realty Investment",
    "Diversified REIT",
    "Diversified income",
  ],
  [
    "8976.T",
    "Daiwa Office Investment",
    "Office REIT",
    "Prime offices",
  ],
  [
    "8984.T",
    "Daiwa House REIT Investment",
    "Diversified REIT",
    "Logistics and residential",
  ],
  [
    "3281.T",
    "GLP J-REIT",
    "Logistics REIT",
    "Logistics",
  ],
  [
    "3462.T",
    "Nomura Real Estate Master Fund",
    "Diversified REIT",
    "Diversified income",
  ],
] as const satisfies readonly UniverseSeed[];

const usStocks = [
  [
    "AAPL",
    "Apple",
    "Technology Hardware",
    "US mega cap",
  ],
  [
    "MSFT",
    "Microsoft",
    "Software",
    "AI and cloud",
  ],
  [
    "NVDA",
    "NVIDIA",
    "Semiconductors",
    "AI and semiconductor",
  ],
  [
    "AMZN",
    "Amazon",
    "Consumer and Cloud",
    "Digital platforms",
  ],
  [
    "GOOGL",
    "Alphabet",
    "Digital Advertising",
    "AI and cloud",
  ],
  [
    "META",
    "Meta Platforms",
    "Digital Advertising",
    "AI and digital platforms",
  ],
  [
    "AVGO",
    "Broadcom",
    "Semiconductors",
    "AI and semiconductor",
  ],
  [
    "TSLA",
    "Tesla",
    "Automobiles",
    "Electric vehicles",
  ],
  [
    "BRK-B",
    "Berkshire Hathaway",
    "Diversified Financials",
    "Quality compounder",
  ],
  [
    "JPM",
    "JPMorgan Chase",
    "Banks",
    "US financials",
  ],
  [
    "V",
    "Visa",
    "Payments",
    "Digital payments",
  ],
  [
    "MA",
    "Mastercard",
    "Payments",
    "Digital payments",
  ],
  [
    "XOM",
    "Exxon Mobil",
    "Energy",
    "Integrated energy",
  ],
  [
    "CVX",
    "Chevron",
    "Energy",
    "Integrated energy",
  ],
  [
    "LLY",
    "Eli Lilly",
    "Healthcare",
    "Biopharma",
  ],
  [
    "JNJ",
    "Johnson & Johnson",
    "Healthcare",
    "Defensive healthcare",
  ],
  [
    "UNH",
    "UnitedHealth Group",
    "Healthcare",
    "Managed care",
  ],
  [
    "ABBV",
    "AbbVie",
    "Healthcare",
    "Biopharma",
  ],
  [
    "MRK",
    "Merck",
    "Healthcare",
    "Biopharma",
  ],
  [
    "PG",
    "Procter & Gamble",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "KO",
    "Coca-Cola",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "PEP",
    "PepsiCo",
    "Consumer Staples",
    "Defensive consumption",
  ],
  [
    "COST",
    "Costco Wholesale",
    "Retail",
    "Quality consumer",
  ],
  [
    "WMT",
    "Walmart",
    "Retail",
    "Defensive consumption",
  ],
  [
    "HD",
    "Home Depot",
    "Retail",
    "US housing",
  ],
  [
    "MCD",
    "McDonald's",
    "Restaurants",
    "Global consumer",
  ],
  [
    "CAT",
    "Caterpillar",
    "Industrial Machinery",
    "Infrastructure",
  ],
  [
    "GE",
    "GE Aerospace",
    "Aerospace",
    "Aerospace",
  ],
  [
    "RTX",
    "RTX",
    "Aerospace and Defense",
    "Defense",
  ],
  [
    "BA",
    "Boeing",
    "Aerospace",
    "Aerospace",
  ],
  [
    "LIN",
    "Linde",
    "Industrial Gases",
    "Quality industrial",
  ],
  [
    "NEE",
    "NextEra Energy",
    "Utilities",
    "Renewable infrastructure",
  ],
  [
    "DUK",
    "Duke Energy",
    "Utilities",
    "Defensive income",
  ],
  [
    "SO",
    "Southern Company",
    "Utilities",
    "Defensive income",
  ],
  [
    "ORCL",
    "Oracle",
    "Software",
    "AI and cloud",
  ],
  [
    "CRM",
    "Salesforce",
    "Software",
    "Cloud software",
  ],
  [
    "ADBE",
    "Adobe",
    "Software",
    "Digital media",
  ],
  [
    "AMD",
    "Advanced Micro Devices",
    "Semiconductors",
    "AI and semiconductor",
  ],
  [
    "QCOM",
    "Qualcomm",
    "Semiconductors",
    "Connectivity",
  ],
  [
    "TXN",
    "Texas Instruments",
    "Semiconductors",
    "Analog semiconductors",
  ],
  [
    "AMAT",
    "Applied Materials",
    "Semiconductor Equipment",
    "AI and semiconductor",
  ],
  [
    "MU",
    "Micron Technology",
    "Semiconductors",
    "Memory",
  ],
  [
    "NFLX",
    "Netflix",
    "Entertainment",
    "Streaming",
  ],
  [
    "DIS",
    "Walt Disney",
    "Entertainment",
    "Media and parks",
  ],
  [
    "BKNG",
    "Booking Holdings",
    "Travel",
    "Global travel",
  ],
] as const satisfies readonly UniverseSeed[];

const usInsuranceStocks = [
  [
    "CB",
    "Chubb",
    "Insurance",
    "Property and casualty",
  ],
  [
    "PGR",
    "Progressive",
    "Insurance",
    "Property and casualty",
  ],
  [
    "MET",
    "MetLife",
    "Insurance",
    "Life insurance",
  ],
  [
    "AFL",
    "Aflac",
    "Insurance",
    "Supplemental insurance",
  ],
  [
    "PRU",
    "Prudential Financial",
    "Insurance",
    "Life insurance",
  ],
] as const satisfies readonly UniverseSeed[];

const usEtfs = [
  [
    "SPY",
    "SPDR S&P 500 ETF Trust",
    "US Equity",
    "S&P 500",
  ],
  [
    "VOO",
    "Vanguard S&P 500 ETF",
    "US Equity",
    "S&P 500",
  ],
  [
    "IVV",
    "iShares Core S&P 500 ETF",
    "US Equity",
    "S&P 500",
  ],
  [
    "QQQ",
    "Invesco QQQ Trust",
    "US Equity",
    "NASDAQ 100",
  ],
  [
    "VTI",
    "Vanguard Total Stock Market ETF",
    "US Equity",
    "Total US market",
  ],
  [
    "VT",
    "Vanguard Total World Stock ETF",
    "Global Equity",
    "Global diversification",
  ],
  [
    "IWM",
    "iShares Russell 2000 ETF",
    "US Small Cap Equity",
    "US small caps",
  ],
  [
    "DIA",
    "SPDR Dow Jones Industrial Average ETF Trust",
    "US Equity",
    "Dow 30",
  ],
  [
    "SCHD",
    "Schwab US Dividend Equity ETF",
    "Dividend Equity",
    "US dividend",
  ],
  [
    "VIG",
    "Vanguard Dividend Appreciation ETF",
    "Dividend Equity",
    "Dividend growth",
  ],
  [
    "AGG",
    "iShares Core US Aggregate Bond ETF",
    "US Bonds",
    "Core bonds",
  ],
  [
    "BND",
    "Vanguard Total Bond Market ETF",
    "US Bonds",
    "Core bonds",
  ],
  [
    "TLT",
    "iShares 20+ Year Treasury Bond ETF",
    "Long Duration Bonds",
    "US Treasuries",
  ],
  [
    "GLD",
    "SPDR Gold Shares",
    "Commodity",
    "Gold",
  ],
  [
    "USO",
    "United States Oil Fund",
    "Commodity",
    "Crude oil",
  ],
  [
    "VNQ",
    "Vanguard Real Estate ETF",
    "US REIT",
    "Listed real estate",
  ],
] as const satisfies readonly UniverseSeed[];

const usReits = [
  [
    "PLD",
    "Prologis",
    "Logistics REIT",
    "Logistics",
  ],
  [
    "AMT",
    "American Tower",
    "Infrastructure REIT",
    "Digital infrastructure",
  ],
  [
    "EQIX",
    "Equinix",
    "Data Center REIT",
    "Digital infrastructure",
  ],
  [
    "O",
    "Realty Income",
    "Net Lease REIT",
    "Monthly income",
  ],
  [
    "WELL",
    "Welltower",
    "Healthcare REIT",
    "Senior housing",
  ],
  [
    "DLR",
    "Digital Realty Trust",
    "Data Center REIT",
    "Digital infrastructure",
  ],
  [
    "SPG",
    "Simon Property Group",
    "Retail REIT",
    "Prime malls",
  ],
  [
    "PSA",
    "Public Storage",
    "Self Storage REIT",
    "Self storage",
  ],
] as const satisfies readonly UniverseSeed[];

export const investmentUniverse: InvestmentUniverseItem[] =
  [
    ...buildUniverseItems(
      japanStocks,
      {
        market: "japan",
        exchange: "TSE",
        currency: "JPY",
        assetType: "stock",
      }
    ),

    ...buildUniverseItems(
      japanInsuranceStocks,
      {
        market: "japan",
        exchange: "TSE",
        currency: "JPY",
        assetType:
          "insurance_stock",
      }
    ),

    ...buildUniverseItems(
      japanEtfs,
      {
        market: "japan",
        exchange: "TSE",
        currency: "JPY",
        assetType: "etf",
      }
    ),

    ...buildUniverseItems(
      japanReits,
      {
        market: "japan",
        exchange: "TSE",
        currency: "JPY",
        assetType: "reit",
      }
    ),

    ...buildUniverseItems(
      usStocks,
      {
        market:
          "united_states",
        exchange: "US Markets",
        currency: "USD",
        assetType: "stock",
      }
    ),

    ...buildUniverseItems(
      usInsuranceStocks,
      {
        market:
          "united_states",
        exchange: "US Markets",
        currency: "USD",
        assetType:
          "insurance_stock",
      }
    ),

    ...buildUniverseItems(
      usEtfs,
      {
        market:
          "united_states",
        exchange: "US Markets",
        currency: "USD",
        assetType: "etf",
      }
    ),

    ...buildUniverseItems(
      usReits,
      {
        market:
          "united_states",
        exchange: "US Markets",
        currency: "USD",
        assetType: "reit",
      }
    ),
  ];

export const INVESTMENT_UNIVERSE_SIZE =
  investmentUniverse.length;

export function getEnabledInvestmentUniverse(): InvestmentUniverseItem[] {
  return investmentUniverse.filter(
    (item) => item.enabled
  );
}

export function getInvestmentUniverseByMarket(
  market: InvestmentMarket
): InvestmentUniverseItem[] {
  return investmentUniverse.filter(
    (item) =>
      item.enabled &&
      item.market === market
  );
}

export function getInvestmentUniverseByAssetType(
  assetType: InvestmentAssetType
): InvestmentUniverseItem[] {
  return investmentUniverse.filter(
    (item) =>
      item.enabled &&
      item.assetType ===
        assetType
  );
}

export function findInvestmentUniverseItem(
  symbol: string
): InvestmentUniverseItem | null {
  const normalizedSymbol =
    symbol.trim().toUpperCase();

  return (
    investmentUniverse.find(
      (item) =>
        item.symbol.toUpperCase() ===
        normalizedSymbol
    ) ?? null
  );
}

export function findDuplicateUniverseSymbols(): string[] {
  const seen =
    new Set<string>();

  const duplicates =
    new Set<string>();

  for (
    const item of investmentUniverse
  ) {
    const normalizedSymbol =
      item.symbol.toUpperCase();

    if (
      seen.has(normalizedSymbol)
    ) {
      duplicates.add(
        normalizedSymbol
      );
    }

    seen.add(normalizedSymbol);
  }

  return Array.from(
    duplicates
  );
}
