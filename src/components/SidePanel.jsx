import { METRICS } from '../data/attributeMap';

const PANEL_WIDTH = 272;

function toIntPcts(weights, keys) {
  const pcts = {};
  keys.forEach(k => { pcts[k] = Math.round((weights[k] ?? 0) * 100); });
  return pcts;
}

function distributeRemaining(remaining, keys, currentPcts) {
  const total = keys.reduce((s, k) => s + currentPcts[k], 0);
  const result = {};
  if (total > 0) {
    let distributed = 0;
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        result[k] = Math.max(0, remaining - distributed);
      } else {
        const share = Math.round(remaining * (currentPcts[k] / total));
        result[k] = Math.max(0, share);
        distributed += result[k];
      }
    });
  } else {
    let distributed = 0;
    const perKey = Math.floor(remaining / keys.length);
    keys.forEach((k, i) => {
      if (i === keys.length - 1) {
        result[k] = Math.max(0, remaining - distributed);
      } else {
        result[k] = perKey;
        distributed += perKey;
      }
    });
  }
  return result;
}

function handleSliderChange(key, rawValue, weights, setWeights, selectedKeys) {
  const newPct = Math.max(0, Math.min(100, parseInt(rawValue, 10)));
  const otherKeys = selectedKeys.filter(k => k !== key);

  if (otherKeys.length === 0) {
    setWeights(prev => ({ ...prev, [key]: 1 }));
    return;
  }

  const currentPcts = toIntPcts(weights, selectedKeys);
  const remaining = 100 - newPct;
  const distributed = distributeRemaining(remaining, otherKeys, currentPcts);

  const updated = Object.fromEntries(Object.keys(weights).map(k => [k, 0]));
  updated[key] = newPct / 100;
  otherKeys.forEach(k => { updated[k] = distributed[k] / 100; });
  setWeights(updated);
}

function handleAddMetric(key, selectedKeys, setSelectedTags, weights, setWeights) {
  const newSelected = [...selectedKeys, key];
  setSelectedTags(newSelected);

  const N = newSelected.length;
  const newPct = Math.floor(100 / N);
  const remaining = 100 - newPct;

  const currentPcts = toIntPcts(weights, selectedKeys);
  const distributed = distributeRemaining(remaining, selectedKeys, currentPcts);

  const updated = Object.fromEntries(Object.keys(weights).map(k => [k, 0]));
  updated[key] = newPct / 100;
  selectedKeys.forEach(k => { updated[k] = distributed[k] / 100; });
  setWeights(updated);
}

function handleRemoveMetric(key, selectedKeys, setSelectedTags, weights, setWeights) {
  const newSelected = selectedKeys.filter(k => k !== key);
  setSelectedTags(newSelected);

  if (newSelected.length === 0) {
    setWeights(Object.fromEntries(Object.keys(weights).map(k => [k, 0])));
    return;
  }

  const currentPcts = toIntPcts(weights, selectedKeys);
  const distributed = distributeRemaining(100, newSelected, currentPcts);

  const updated = Object.fromEntries(Object.keys(weights).map(k => [k, 0]));
  newSelected.forEach(k => { updated[k] = distributed[k] / 100; });
  setWeights(updated);
}

export default function SidePanel({ selectedTags, setSelectedTags, weights, setWeights, isOpen, setIsOpen }) {
  const selectedMetrics = METRICS.filter(m => selectedTags.includes(m.key));
  const otherMetrics    = METRICS.filter(m => !selectedTags.includes(m.key));

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 60, pointerEvents: 'none' }}>

      {/* Slide-in panel */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: PANEL_WIDTH, height: '100%',
        background: 'linear-gradient(180deg, #0d0d0d 0%, #111 100%)',
        borderRight: '1px solid #222',
        boxShadow: isOpen ? '4px 0 32px rgba(0,0,0,0.6)' : 'none',
        transform: isOpen ? 'translateX(0)' : `translateX(-${PANEL_WIDTH}px)`,
        transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1), box-shadow 300ms ease',
        overflowY: 'auto', overflowX: 'hidden',
        pointerEvents: 'all',
      }}>
        <div style={{ padding: '68px 18px 32px' }}>

          {/* Header */}
          <div style={{ marginBottom: 20 }}>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: 15, fontWeight: 700, color: '#e5e5e5', margin: '0 0 2px',
            }}>
              Metric Weights
            </h3>
            <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>
              Drag sliders to weight · click labels to add/remove
            </p>
          </div>

          {selectedMetrics.length === 0 && (
            <div style={{
              marginBottom: 14,
              padding: '10px 12px',
              borderRadius: 10,
              border: '1px solid #4a3211',
              background: 'rgba(245,158,11,0.08)',
              color: '#fbbf24',
              fontSize: 11,
              lineHeight: 1.4,
            }}>
              Start by selecting a value below to personalize the ranking.
            </div>
          )}

          {/* Selected metrics */}
          {selectedMetrics.length > 0 && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 9, color: '#F59E0B', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Your selections
              </p>
              {selectedMetrics.map(m => (
                <MetricSlider
                  key={m.key}
                  metric={m}
                  value={weights[m.key] ?? 0}
                  onChange={v => handleSliderChange(m.key, v, weights, setWeights, selectedTags)}
                  onToggle={() => handleRemoveMetric(m.key, selectedTags, setSelectedTags, weights, setWeights)}
                />
              ))}
            </div>
          )}

          {/* Other metrics */}
          {otherMetrics.length > 0 && (
            <>
              <div style={{ height: 1, background: '#1a1a1a', margin: '8px 0 14px' }} />
              <p style={{ fontSize: 9, color: '#374151', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>
                Add metrics
              </p>
              {otherMetrics.map(m => (
                <MetricAddRow
                  key={m.key}
                  metric={m}
                  onAdd={() => handleAddMetric(m.key, selectedTags, setSelectedTags, weights, setWeights)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Toggle tab */}
      <button
        onClick={() => setIsOpen(o => !o)}
        title={isOpen ? 'Collapse panel' : 'Open weight panel'}
        style={{
          position: 'absolute',
          top: '50%',
          left: isOpen ? PANEL_WIDTH : 0,
          transform: 'translateY(-50%)',
          transition: 'left 300ms cubic-bezier(0.4,0,0.2,1)',
          width: 20, height: 64,
          background: '#F59E0B',
          border: 'none', borderRadius: '0 6px 6px 0',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#0f0f0f', fontSize: 13, fontWeight: 700,
          boxShadow: '2px 0 10px rgba(0,0,0,0.5)',
          pointerEvents: 'all', zIndex: 61,
        }}
      >
        {isOpen ? '‹' : '›'}
      </button>
    </div>
  );
}

function MetricSlider({ metric, value, onChange, onToggle }) {
  const pct = Math.round(value * 100);

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <button
          type="button"
          onClick={onToggle}
          title="Disable metric"
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: metric.color,
            fontFamily: 'DM Sans, sans-serif',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {metric.label}
        </button>
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: metric.color,
          fontFamily: 'DM Mono, monospace',
          minWidth: 32, textAlign: 'right',
        }}>
          {pct}%
        </span>
      </div>

      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', left: 0, top: '50%',
          transform: 'translateY(-50%)',
          width: `${pct}%`,
          height: 4, borderRadius: 2,
          background: metric.color,
          pointerEvents: 'none',
          transition: 'width 80ms linear',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute', left: 0, top: '50%',
          transform: 'translateY(-50%)',
          width: '100%',
          height: 4, borderRadius: 2,
          background: '#1a1a1a',
          zIndex: 0,
        }} />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={pct}
          onChange={e => onChange(e.target.value)}
          style={{
            position: 'relative', zIndex: 2,
            width: '100%', margin: 0,
            appearance: 'none', background: 'transparent',
            cursor: 'pointer',
            accentColor: metric.color,
            height: 20,
          }}
        />
      </div>
    </div>
  );
}

function MetricAddRow({ metric, onAdd }) {
  return (
    <button
      onClick={onAdd}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        width: '100%', padding: '8px 4px',
        background: 'none', border: 'none', borderBottom: '1px solid #161616',
        cursor: 'pointer', transition: 'background 150ms ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#1a1a1a'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
    >
      <span style={{
        fontSize: 11, fontWeight: 400,
        color: '#4b5563',
        fontFamily: 'DM Sans, sans-serif',
        transition: 'color 150ms ease',
      }}>
        {metric.label}
      </span>
      <span style={{ color: '#374151', fontSize: 16, lineHeight: 1 }}>+</span>
    </button>
  );
}
