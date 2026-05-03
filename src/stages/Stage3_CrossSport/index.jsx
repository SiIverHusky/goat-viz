import BubbleChart from "./BubbleChart";
import ParallelCoords from "./ParallelCoords";

export default function Stage3_CrossSport({
  athletes,
  overallScores,
  goTo,
  highlightedAthleteId,
  setHighlightedAthleteId,
}) {
  // Flatten all athletes with their sport and overall breakdown
  const allAthletes = [
    ...athletes.football.map((a) => ({ ...a, sport: "football" })),
    ...athletes.chess.map((a) => ({ ...a, sport: "chess" })),
    ...athletes.boxing.map((a) => ({ ...a, sport: "boxing" })),
  ].map((a) => ({
    ...a,
    overallScore: overallScores[a.id]?.score || 0,
    breakdown: overallScores[a.id]?.breakdown || {},
  }));

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px 60px",
        maxWidth: 1000,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <h2
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(1.8rem, 4vw, 3rem)",
            fontWeight: 900,
            margin: "0 0 8px",
            background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Cross-Sport Comparison
        </h2>
        <p style={{ color: "#6b7280", fontSize: 15 }}>
          All athletes in a shared space — see who truly stands apart
        </p>
      </div>

      <section style={{ marginBottom: 52 }}>
        <SectionHeading
          number="01"
          title="The Field"
          subtitle="Longevity Index vs. Dominance Score — bubble size = Accolade Density"
        />
        <BubbleChart
          athletes={allAthletes}
          highlightedId={highlightedAthleteId}
          setHighlightedId={setHighlightedAthleteId}
        />
      </section>

      <section style={{ marginBottom: 52 }}>
        <SectionHeading
          number="02"
          title="Parallel Profiles"
          subtitle="Hover lines for athlete names, filter by sport, and drag axis labels to reorder"
        />
        <ParallelCoords
          athletes={allAthletes}
          highlightedId={highlightedAthleteId}
          setHighlightedId={setHighlightedAthleteId}
        />
      </section>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
        <button
          type="button"
          onClick={() => goTo(3)}
          style={{
            padding: "12px 28px",
            borderRadius: 999,
            border: "1px solid #F59E0B",
            backgroundColor: "rgba(245,158,11,0.1)",
            color: "#FBBF24",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Open Experimental Stage
        </button>
      </div>
    </div>
  );
}

function SectionHeading({ number, title, subtitle }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 12,
          marginBottom: 4,
        }}
      >
        <span style={{ color: "#4b5563", fontSize: 12, fontWeight: 600 }}>
          {number}
        </span>
        <h3
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 20,
            fontWeight: 700,
            margin: 0,
            color: "#e5e5e5",
          }}
        >
          {title}
        </h3>
      </div>
      <p style={{ color: "#6b7280", fontSize: 13, margin: 0, paddingLeft: 28 }}>
        {subtitle}
      </p>
    </div>
  );
}
