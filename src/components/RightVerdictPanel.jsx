import { METRICS } from '../data/attributeMap';

const SPORT_COLORS = { football: '#F59E0B', chess: '#14B8A6', boxing: '#EF4444' };
const SPORT_LABELS = { football: 'Football', chess: 'Chess', boxing: 'Boxing' };
const PANEL_TAB_WIDTH = 20;

function toAthleteRows(athletes, overallScores) {
  return [
    ...(athletes.football || []).map((a) => ({ ...a, sport: 'football' })),
    ...(athletes.chess || []).map((a) => ({ ...a, sport: 'chess' })),
    ...(athletes.boxing || []).map((a) => ({ ...a, sport: 'boxing' })),
  ]
    .map((a) => ({
      ...a,
      overallScore: overallScores[a.id]?.score || 0,
      breakdown: overallScores[a.id]?.breakdown || {},
    }))
    .sort((a, b) => b.overallScore - a.overallScore);
}

function toSportRows(athletes, sport, sportScores) {
  const list = (athletes[sport] || []).map((a) => ({
    ...a,
    sport,
    overallScore: sportScores?.[sport]?.[a.id]?.score || 0,
    breakdown: sportScores?.[sport]?.[a.id]?.breakdown || {},
  }));

  return list.sort((a, b) => b.overallScore - a.overallScore);
}

export default function RightVerdictPanel({
  athletes,
  sportScores,
  overallScores,
  selectedTags,
  currentStage,
  currentSport,
  selectedAthletes,
  highlightedAthleteId,
  isOpen,
  setIsOpen,
  onAthleteClick,
  onAthleteHover,
  isDocked,
  width = 360,
}) {
  const inSportDive = currentStage === 1;
  const ranked = inSportDive
    ? toSportRows(athletes, currentSport, sportScores)
    : toAthleteRows(athletes, overallScores);
  const top3 = ranked.slice(0, 3);
  const selectedInSport = selectedAthletes?.[currentSport] || [];

  const activeMetrics = selectedTags && selectedTags.length > 0
    ? METRICS.filter((m) => selectedTags.includes(m.key))
    : METRICS;

  const containerStyle = isDocked && isOpen
    ? {
      position: 'fixed',
      top: 0,
      right: 0,
      height: '100vh',
      width,
      zIndex: 55,
      borderLeft: '1px solid #222',
      background: 'linear-gradient(180deg, #0e0e0e 0%, #111 100%)',
      boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
    }
    : isDocked
      ? {
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100vh',
        width: 1,
        zIndex: 55,
      }
      : {
        position: 'relative',
        margin: '0 20px 24px',
        border: '1px solid #222',
        borderRadius: 16,
        background: 'linear-gradient(180deg, #0e0e0e 0%, #111 100%)',
      };

  return (
    <aside style={containerStyle}>
      {isOpen && (
        <div style={{ height: '100%', overflowY: 'auto', padding: isDocked ? '18px 14px 16px' : '18px 14px 14px' }}>
          <h3 style={{
            margin: '2px 0 6px',
            fontFamily: 'Playfair Display, serif',
            fontSize: 24,
            lineHeight: 1.1,
            color: '#FBBF24',
            fontWeight: 900,
          }}>
            {inSportDive ? `${SPORT_LABELS[currentSport]} Board` : 'Live Verdict'}
          </h3>
          <p style={{ margin: '0 0 16px', color: '#6b7280', fontSize: 12 }}>
            {inSportDive
              ? 'Click athletes to include or exclude them from radar comparison.'
              : 'Hover athletes to highlight them in both cross-sport charts.'}
          </p>

          <ProminentPodium top3={top3} />

          <div style={{
            marginTop: 14,
            border: '1px solid #252525',
            borderRadius: 12,
            overflow: 'hidden',
            backgroundColor: '#141414',
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '36px 1fr 74px',
              gap: 8,
              padding: '10px 10px',
              borderBottom: '1px solid #242424',
              color: '#6b7280',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: 700,
            }}>
              <span>Rank</span>
              <span>Athlete</span>
              <span style={{ textAlign: 'right' }}>Score</span>
            </div>

            {ranked.map((a, i) => {
              const isSelectedInSportDive = inSportDive && selectedInSport.includes(a.id);
              const isHighlighted = highlightedAthleteId === a.id;

              return (
                <div
                  key={a.id}
                  onMouseEnter={() => onAthleteHover?.(a.id)}
                  onMouseLeave={() => onAthleteHover?.(null)}
                  onClick={() => onAthleteClick?.(a.id)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '36px 1fr 74px',
                    gap: 8,
                    alignItems: 'center',
                    padding: '9px 10px',
                    borderBottom: i < ranked.length - 1 ? '1px solid #202020' : 'none',
                    backgroundColor: isHighlighted ? '#232323' : i < 3 ? '#171717' : 'transparent',
                    outline: isSelectedInSportDive ? `1px solid ${SPORT_COLORS[a.sport]}aa` : 'none',
                    cursor: onAthleteClick || onAthleteHover ? 'pointer' : 'default',
                  }}
                >
                  <span style={{
                    fontSize: 12,
                    fontWeight: i < 3 ? 800 : 600,
                    color: i === 0 ? '#FBBF24' : i === 1 ? '#d1d5db' : i === 2 ? '#c08457' : '#6b7280',
                  }}>
                    {i + 1}
                  </span>

                  <div>
                    <div style={{ color: '#e5e5e5', fontSize: 12, fontWeight: 600, lineHeight: 1.2 }}>
                      {a.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: SPORT_COLORS[a.sport],
                        flexShrink: 0,
                      }} />
                      <span style={{ color: '#6b7280', fontSize: 10 }}>{SPORT_LABELS[a.sport]}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#FBBF24', fontSize: 12, fontWeight: 800 }}>
                      {(a.overallScore * 100).toFixed(1)}
                    </div>
                    <MiniBreakdown breakdown={a.breakdown} activeMetrics={activeMetrics} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        onClick={() => setIsOpen((prev) => !prev)}
        title={isOpen ? 'Hide leaderboard panel' : 'Open leaderboard panel'}
        style={{
          position: 'absolute',
          top: '50%',
          left: isOpen ? 0 : -PANEL_TAB_WIDTH,
          transform: 'translateY(-50%)',
          width: PANEL_TAB_WIDTH,
          height: 68,
          border: 'none',
          borderRadius: '6px 0 0 6px',
          background: '#F59E0B',
          color: '#0f0f0f',
          fontSize: 13,
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '-2px 0 10px rgba(0,0,0,0.5)',
        }}
      >
        {isOpen ? '›' : '‹'}
      </button>
    </aside>
  );
}

function ProminentPodium({ top3 }) {
  if (top3.length === 0) return null;

  const order = [1, 0, 2];

  return (
    <section style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1.1fr 1fr',
      gap: 8,
      alignItems: 'end',
      padding: '8px 4px 12px',
      border: '1px solid #252525',
      borderRadius: 14,
      background: 'radial-gradient(120% 100% at 50% 0%, rgba(251,191,36,0.14), rgba(15,15,15,0) 65%)',
    }}>
      {order.map((idx) => {
        const a = top3[idx];
        if (!a) return <div key={`empty-${idx}`} />;

        const isFirst = idx === 0;
        const height = isFirst ? 120 : idx === 1 ? 96 : 88;
        const color = SPORT_COLORS[a.sport];

        return (
          <div key={a.id} style={{ textAlign: 'center' }}>
            <div style={{ color: '#c5c5c5', fontSize: 10, marginBottom: 6 }}>{a.name}</div>
            <div style={{
              height,
              borderRadius: '10px 10px 0 0',
              border: `2px solid ${color}`,
              background: isFirst ? `linear-gradient(180deg, ${color}, #0f0f0f)` : '#171717',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isFirst ? `0 0 18px ${color}66` : 'none',
            }}>
              <div>
                <div style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: isFirst ? 34 : 24,
                  fontWeight: 900,
                  color: isFirst ? '#0f0f0f' : color,
                  lineHeight: 1,
                }}>
                  {idx + 1}
                </div>
                <div style={{ color: isFirst ? '#111' : '#9ca3af', fontSize: 10, marginTop: 3 }}>
                  {(a.overallScore * 100).toFixed(1)}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function MiniBreakdown({ breakdown, activeMetrics }) {
  const sum = activeMetrics.reduce((acc, m) => acc + (breakdown?.[m.key] || 0), 0);
  if (sum <= 0) return null;

  return (
    <div style={{
      marginTop: 4,
      display: 'flex',
      height: 4,
      borderRadius: 999,
      overflow: 'hidden',
      backgroundColor: '#222',
      width: '100%',
      minWidth: 60,
    }}>
      {activeMetrics.map((m) => {
        const value = breakdown?.[m.key] || 0;
        return (
          <div
            key={m.key}
            style={{
              flex: value,
              backgroundColor: m.color,
              minWidth: value > 0 ? 1 : 0,
            }}
          />
        );
      })}
    </div>
  );
}
