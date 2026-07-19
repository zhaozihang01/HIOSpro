import Header from "@/components/Header";
import { getStockData } from "@/lib/stockService";
import StockDetailClient from "@/components/StockDetailClient";
type Props = {
  params: Promise<{
    symbol: string;
  }>;
};



export default async function StockDetailPage({ params }: Props) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();
  const stock = await getStockData(ticker);
const name = stock.name;

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
