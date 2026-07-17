type WatchlistItem = {
  name: string;
  ticker: string;
};

type Props = {
  items: WatchlistItem[];
  onSelect: (ticker: string) => void;
  onRemove: (ticker: string) => void;
};

export default function Watchlist({
  items,
  onSelect,
  onRemove,
}: Props) {
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
          <div
            key={item.ticker}
            style={{
              padding: "12px 14px",
              background: "#f5f8fb",
              border: "1px solid #d6e1ea",
              borderRadius: 10,
            }}
          >
            <button
              type="button"
              onClick={() => onSelect(item.ticker)}
              style={{
                width: "100%",
                padding: 0,
                textAlign: "left",
                background: "transparent",
                border: "none",
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

            <button
              type="button"
              onClick={() => onRemove(item.ticker)}
              style={{
                marginTop: 8,
                padding: 0,
                color: "#c94343",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              🗑 删除
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
