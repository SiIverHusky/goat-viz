import { useEffect, useState } from 'react';

const SportIcon = ({ sport }) => {
  if (sport === 'football') return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" stroke="#F59E0B" strokeWidth="2"/>
      <polygon points="20,8 23,16 32,16 25,21 28,30 20,25 12,30 15,21 8,16 17,16"
        fill="none" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  );
  if (sport === 'chess') return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <rect x="14" y="28" width="12" height="4" rx="2" stroke="#14B8A6" strokeWidth="2"/>
      <rect x="16" y="24" width="8" height="4" rx="1" stroke="#14B8A6" strokeWidth="2"/>
      <path d="M16 24 C16 18 14 14 20 10 C26 14 24 18 24 24" stroke="#14B8A6" strokeWidth="2" fill="none"/>
      <circle cx="20" cy="8" r="3" stroke="#14B8A6" strokeWidth="2"/>
    </svg>
  );
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <path d="M20 8 C28 8 34 14 34 20 C34 28 28 34 20 34 C14 34 8 28 8 22 C8 16 12 12 16 10"
        stroke="#EF4444" strokeWidth="2" fill="none"/>
      <path d="M8 22 L14 20 L20 26 L26 20 L32 22" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinejoin="round"/>
      <circle cx="20" cy="12" r="3" fill="#EF4444"/>
    </svg>
  );
};

export default function Stage0_Intro({ goTo }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 900);
    const t3 = setTimeout(() => setPhase(3), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const letters = "Who is the Greatest of All Time?".split('');

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '40px 20px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: 'clamp(2rem, 6vw, 5rem)',
        fontWeight: 900, margin: '0 0 20px',
        lineHeight: 1.1,
        background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }}>
        {letters.map((ch, i) => (
          <span key={i} style={{
            display: 'inline-block',
            opacity: phase >= 1 ? 1 : 0,
            transform: phase >= 1 ? 'translateY(0)' : 'translateY(30px)',
            transition: `opacity 400ms ease ${i * 18}ms, transform 400ms ease ${i * 18}ms`,
          }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        ))}
      </h1>

      <p style={{
        fontFamily: 'DM Sans, sans-serif', fontSize: 'clamp(1rem, 2.5vw, 1.4rem)',
        color: '#9ca3af', marginBottom: 48,
        opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 500ms ease, transform 500ms ease',
      }}>
        Football. Chess. Boxing. <em>You decide.</em>
      </p>

      <div style={{
        display: 'flex', gap: 48, marginBottom: 64,
        opacity: phase >= 2 ? 1 : 0,
        transition: 'opacity 600ms ease 200ms',
      }}>
        {['football', 'chess', 'boxing'].map((sport, i) => (
          <div key={sport} style={{
            opacity: phase >= 2 ? 1 : 0,
            transform: phase >= 2 ? 'scale(1)' : 'scale(0.5)',
            transition: `opacity 500ms ease ${i * 150 + 200}ms, transform 500ms cubic-bezier(0.34,1.56,0.64,1) ${i * 150 + 200}ms`,
          }}>
            <SportIcon sport={sport} />
          </div>
        ))}
      </div>

      <button
        onClick={() => goTo(1)}
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 400ms ease, transform 400ms ease, box-shadow 300ms ease',
          padding: '16px 48px',
          background: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
          border: 'none', borderRadius: 50,
          color: '#0f0f0f',
          fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
          fontSize: 18, cursor: 'pointer',
          boxShadow: '0 0 40px rgba(245,158,11,0.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.boxShadow = '0 0 60px rgba(245,158,11,0.6)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 0 40px rgba(245,158,11,0.4)';
        }}
      >
        Start Exploring →
      </button>
    </div>
  );
}
