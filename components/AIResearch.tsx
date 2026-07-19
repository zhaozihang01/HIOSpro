import { generateAnalysis } from "@/lib/analysis";
type Props = {
  name: string;
  ticker: string;
  score: number;
  label: string;
  breakdown: {
    technical: number;
    trend: number;
    risk: number;
    ai: number;
  };
};

export default function AIResearch({
 name,
ticker,
score,
label,
breakdown,
}: Props) {
   const analysis = generateAnalysis(score, breakdown); 
  return (
    <section
      style={{
        marginTop: 24,
        padding: 24,
        background: "#ffffff",
        border: "1px solid #d6e1ea",
        borderRadius: 16,
      }}
    >
      <h2
        style={{
          margin: "0 0 16px 0",
          color: "#0b2a4a",
        }}
      >
        AI Research
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        <div>
          <div style={{ color: "#60758a", fontSize: 13 }}>
            Rating
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 22,
              fontWeight: 800,
              color: "#11845b",
            }}
          >
            {score} / 100 ・ {label}
          </div>
        </div>

        <div>
          <div style={{ color: "#60758a", fontSize: 13 }}>
            Symbol
          </div>

          <div
            style={{
              marginTop: 6,
              fontSize: 18,
              fontWeight: 800,
              color: "#0b2a4a",
            }}
          >
            {name} ・ {ticker}
          </div>
        </div>
      </div>

      <hr
        style={{
          margin: "20px 0",
          border: 0,
          borderTop: "1px solid #d6e1ea",
        }}
      />

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Summary
        </div>

       <div style={{ lineHeight: 1.8, color: "#33495f" }}>
  {analysis.summary}
</div> 
      </div>

      <div style={{ marginBottom: 18 }}>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Risk
        </div>

       <div style={{ lineHeight: 1.8, color: "#33495f" }}>
  {analysis.risk}
</div> 
      </div>

      <div>
        <div
          style={{
            fontWeight: 800,
            color: "#0b2a4a",
            marginBottom: 6,
          }}
        >
          Strategy
        </div>

        <div style={{ lineHeight: 1.8, color: "#33495f" }}>
  {analysis.strategy}
</div>
      </div>
    </section>
  );
}
