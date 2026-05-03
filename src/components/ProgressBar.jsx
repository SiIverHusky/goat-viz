const stages = [
  { id: 1, label: 'Sport Dives' },
  { id: 2, label: 'Cross-Sport' },
];

export default function ProgressBar({ currentStage, goTo }) {
  return (
    <div style={{
      position: 'sticky', top: 0, zIndex: 50,
      backgroundColor: '#0f0f0f',
      borderBottom: '1px solid #2a2a2a',
      padding: '12px 32px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, maxWidth: 700, margin: '0 auto' }}>
        {stages.map((stage) => {
          const active = currentStage === stage.id;
          const clickable = true;
          return (
            <button
              key={stage.id}
              onClick={() => clickable && goTo(stage.id)}
              type="button"
              style={{
                minWidth: 180,
                padding: '10px 16px',
                borderRadius: 14,
                border: `1px solid ${active ? '#F59E0B' : '#2a2a2a'}`,
                background: active ? 'rgba(245,158,11,0.12)' : '#111',
                color: active ? '#FBBF24' : '#9ca3af',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                boxShadow: active ? '0 0 0 1px rgba(245,158,11,0.25) inset' : 'none',
                transition: 'all 220ms ease',
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Stage</span>
              <span style={{ fontSize: 13, fontFamily: 'DM Sans, sans-serif', fontWeight: 700, whiteSpace: 'nowrap' }}>
                {stage.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
