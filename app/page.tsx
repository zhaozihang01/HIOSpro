import Header from "@/components/Header";
import StockCard from "@/components/StockCard";

export default function Home() {
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
          display: "grid",
          gap: "24px",
        }}
      >
        <StockCard
          name="东京海上HD"
          ticker="8766.T"
          market="TSE"
          decision="BUY"
          summary="保险行业龙头，长期趋势保持向上，目前位于75日均线上方，属于重点观察对象。"
        />

        <StockCard
          name="Microsoft"
          ticker="MSFT"
          market="NASDAQ"
          decision="WAIT"
          summary="AI与云业务继续推动业绩增长，但短线涨幅较大，建议等待更好的买入位置。"
        />

        <StockCard
          name="Broadcom"
          ticker="AVGO"
          market="NASDAQ"
          decision="BUY"
          summary="AI基础设施需求依旧强劲，中长期逻辑没有改变，可持续关注。"
        />
      </div>
    </main>
  );
}
