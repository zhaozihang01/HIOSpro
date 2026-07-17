type Props = {
  open: number;
  high: number;
  low: number;
  volume: string;
  pe: number;
  marketCap: string;
};

export default function MarketStats({
  open,
  high,
  low,
  volume,
  pe,
  marketCap,
}: Props) {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
        padding: 24,
        marginTop: 24,
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Market Statistics</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2,1fr)",
          gap: 18,
        }}
      >
        <Stat title="Open" value={open} />
        <Stat title="High" value={high} />
        <Stat title="Low" value={low} />
        <Stat title="Volume" value={volume} />
        <Stat title="P/E" value={pe} />
        <Stat title="Market Cap" value={marketCap} />
      </div>
    </section>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div>
      <div
        style={{
          color: "#60758a",
          fontSize: 13,
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 700,
          marginTop: 4,
        }}
      >
        {value}
      </div>
    </div>
  );
}
