import { useState } from "react";
import Leaderboard from "./Leaderboard";
import Podium from "./Podium";
import WeightModal from "./WeightModal";

export default function Stage4_Verdict({
  athletes,
  overallScores,
  weights,
  setWeights,
  selectedTags,
  goTo,
}) {
  const [showModal, setShowModal] = useState(false);

  const allAthletes = [
    ...athletes.football.map((a) => ({ ...a, sport: "football" })),
    ...athletes.chess.map((a) => ({ ...a, sport: "chess" })),
    ...athletes.boxing.map((a) => ({ ...a, sport: "boxing" })),
  ]
    .map((a) => ({
      ...a,
      overallScore: overallScores[a.id]?.score || 0,
      breakdown: overallScores[a.id]?.breakdown || {},
    }))
    .sort((a, b) => b.overallScore - a.overallScore);

  const top3 = allAthletes.slice(0, 3);

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "40px 20px 80px",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 52 }}>
        <h2
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            margin: "0 0 12px",
            background: "linear-gradient(135deg, #F59E0B, #FBBF24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The Verdict
        </h2>
        <p style={{ color: "#6b7280", fontSize: 15 }}>
          Based on your values, here are the greatest athletes of all time
        </p>
      </div>

      <Podium top3={top3} selectedTags={selectedTags} />

      <div style={{ margin: "60px 0 32px" }}>
        <h3
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 22,
            fontWeight: 700,
            marginBottom: 8,
            color: "#e5e5e5",
          }}
        >
          Full Rankings
        </h3>
        <p style={{ color: "#6b7280", fontSize: 13 }}>
          All athletes across all three sports, ranked by your weights
        </p>
      </div>

      <Leaderboard athletes={allAthletes} selectedTags={selectedTags} />

      <div
        style={{
          marginTop: 60,
          padding: 32,
          backgroundColor: "#1a1a1a",
          borderRadius: 20,
          border: "1px solid #2a2a2a",
          textAlign: "center",
        }}
      >
        <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 8 }}>
          Your values shaped this result. Change them and see who rises.
        </p>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "12px 32px",
            background: "none",
            border: "2px solid #F59E0B",
            borderRadius: 50,
            color: "#F59E0B",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            transition: "all 200ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(245,158,11,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          Adjust my weights →
        </button>

        <button
          onClick={() => goTo(5)}
          style={{
            marginTop: 12,
            padding: "10px 28px",
            backgroundColor: "#111827",
            border: "1px solid #374151",
            borderRadius: 50,
            color: "#d1d5db",
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          Open Experimental Stage 5
        </button>
      </div>

      {showModal && (
        <WeightModal
          weights={weights}
          setWeights={setWeights}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
