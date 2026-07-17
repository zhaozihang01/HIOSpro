export default function MorningReport() {
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
          margin: "0 0 12px 0",
          color: "#0b2a4a",
        }}
      >
        🌅 HIOS Morning Report
      </h2>

      <div style={{ color: "#666", marginBottom: 16 }}>
        2026-07-18 08:30 JST
      </div>

      <div style={{ lineHeight: 1.8 }}>
        <div>📈 Nikkei225　+0.82%</div>
        <div>📈 TOPIX　　　+0.65%</div>
        <div>💵 USDJPY　　148.72</div>
      </div>

      <hr style={{ margin: "16px 0" }} />

      <div style={{ fontWeight: 700, marginBottom: 8 }}>
        AI Summary
      </div>

      <div style={{ color: "#333", lineHeight: 1.8 }}>
        今天保险、银行板块保持强势，
        AI 半导体高位震荡，
        建议重点关注东京海上HD。
      </div>
    </section>
  );
}
