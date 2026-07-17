import Header from "@/components/Header";
import StockDetailClient from "@/components/StockDetailClient";
type Props = {
  params: Promise<{
    symbol: string;
  }>;
};

const stockNames: Record<string, string> = {
  "8766.T": "东京海上HD",
  MSFT: "Microsoft",
  AVGO: "Broadcom",
  NVDA: "NVIDIA",
  AAPL: "Apple",
  "7203.T": "Toyota",
  "8306.T": "三菱UFJ",
};

export default async function StockDetailPage({ params }: Props) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();
  const name = stockNames[ticker] ?? ticker;

  return (
    <main
      style={{
        maxWidth: "1400px",
        margin: "40px auto",
        padding: "20px",
      }}
    >
      <Header />

      <div
        style={{
          marginBottom: 20,
          fontSize: 14,
          color: "#60758a",
        }}
      >
        首页 / 股票详情 / {ticker}
      </div>

      <StockDetailClient
  name={name}
  ticker={ticker}
/>     
    </main>
  );
}
