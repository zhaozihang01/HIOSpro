import Header from "@/components/Header";
import StockCard from "@/components/StockCard";

type Props = {
  params: Promise<{
    symbol: string;
  }>;
};

export default async function StockDetailPage({ params }: Props) {
  const { symbol } = await params;
  const ticker = decodeURIComponent(symbol).toUpperCase();

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
        Stock Detail / {ticker}
      </div>

      <StockCard
        name={ticker}
        ticker={ticker}
        market={ticker.endsWith(".T") ? "TSE" : "US"}
        decision="WAIT"
        summary="正在加载该股票的行情、技术指标与 HIOS 分析。"
      />
    </main>
  );
}
