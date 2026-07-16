export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#eef3f8",
        padding: "40px",
        fontFamily: "Arial, sans-serif"
      }}
    >
      <h1
        style={{
          fontSize: "42px",
          color: "#0b2a4a",
          marginBottom: "10px"
        }}
      >
        HIOS Morning Research
      </h1>

      <p
        style={{
          color: "#555",
          fontSize: "18px",
          marginBottom: "40px"
        }}
      >
        HIOS V1.0 开发中...
      </p>

      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          boxShadow: "0 6px 20px rgba(0,0,0,.08)"
        }}
      >
        <h2>今日研究对象</h2>

        <ul>
          <li>东京海上（8766.T）</li>
          <li>Microsoft（MSFT）</li>
          <li>Broadcom（AVGO）</li>
        </ul>
      </div>
    </main>
  );
}
