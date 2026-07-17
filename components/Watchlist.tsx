type WatchlistItem = {
  name: string;
  ticker: string;
};

type Props = {
  items: WatchlistItem[];
  onSelect: (ticker: string) => void;
};

export default function Watchlist({ items, onSelect }: Props) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          color: "#0b2a4a",
        }}
      >
        ⭐ My Watchlist
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 10,
        }}
      >
        {items.map((item) => (
          <button
            key={item.ticker}
            type="button"
            onClick={() => onSelect(item.ticker)}
            style={{
              padding: "12px 14px",
              textAlign: "left",
              background: "#f5f8fb",
              border: "1px solid #d6e1ea",
              borderRadius: 10,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                fontWeight: 800,
                color: "#0b2a4a",
              }}
            >
              {item.ticker}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 13,
                color: "#60758a",
              }}
            >
              {item.name}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
