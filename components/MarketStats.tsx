type Props = {
  open: number;
  high: number;
  low: number;
  volume: string;
  pe: number;
  marketCap: string;
};

function formatPrice(value: number): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPe(value: number): string {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return "--";
  }

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

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
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
        padding: 24,
        marginTop: 24,
      }}
    >
      <h2
        style={{
          margin: "0 0 20px 0",
        }}
      >
        Market Statistics
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(2, minmax(0, 1fr))",
          gap: 18,
        }}
      >
        <Stat
          title="Open"
          value={formatPrice(open)}
        />

        <Stat
          title="High"
          value={formatPrice(high)}
        />

        <Stat
          title="Low"
          value={formatPrice(low)}
        />

        <Stat
          title="Volume"
          value={volume || "--"}
        />

        <Stat
          title="P/E"
          value={formatPe(pe)}
        />

        <Stat
          title="Market Cap"
          value={marketCap || "--"}
        />
      </div>
    </section>
  );
}

function Stat({
  title,
  value,
}: {
  title: string;
  value: string;
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
          overflowWrap: "anywhere",
        }}
      >
        {value}
      </div>
    </div>
  );
}
