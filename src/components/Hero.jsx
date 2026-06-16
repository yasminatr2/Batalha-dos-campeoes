import React from 'react'

const floatingCards = [
  { rank: 'Q', suit: '♥', top: '20%', left: '7%', rotate: '-18deg' },
  { rank: 'A', suit: '♠', top: '22%', right: '8%', rotate: '14deg' },
  { rank: 'K', suit: '♦', bottom: '20%', left: '11%', rotate: '10deg' },
  { rank: 'J', suit: '♣', bottom: '25%', right: '10%', rotate: '-12deg' }
]

function Hero({ onPlayMusic }) {
  return (
    <section className="hero">
      <div className="suit-pattern" aria-hidden="true" />
      <div className="hero-giant-suit" aria-hidden="true">♥</div>

      {/* Central emblem */}
      <div className="hero-emblem">
        <img src="/imagens/logo3.png" alt="Emblema da Batalha" />
      </div>

      {/* Lore subtitle */}
      <div className="hero-suit-label">
        <span className="red">♥</span>
        COMPETIÇÃO ENTRE EQUIPES · QUALIDADE
        <span className="red">♦</span>
      </div>

      {/* Main titles */}
      <h1 className="hero-title">BATALHA DOS CAMPEÕES</h1>
      <p className="hero-subtitle">CENTRAL DE ATENDIMENTO</p>

      {/* Ornament divider */}
      <div className="hero-divider">
        <div className="hdl" />
        <span style={{ color: 'var(--rose)', fontSize: '0.85rem' }}>✦</span>
        <div className="hdl r" />
      </div>

      {/* Season info */}
      <p className="hero-date">JUNHO · JULHO · AGOSTO</p>

      <h2 className="hero-tagline">Apenas Uma Casa Reinará</h2>

      {/* CTA com tooltip */}
      <button 
        onClick={onPlayMusic} 
        className="hero-cta"
        title="🎵 Clique para começar a música e ver o ranking"
      >
        ⚔ VER RANKING
      </button>

      {/* Bottom atmospheric rune row */}
      <div
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '1.8rem',
          fontSize: '1rem',
          opacity: 0.25,
          color: 'var(--gold)',
          letterSpacing: '0.5rem',
          pointerEvents: 'none',
          userSelect: 'none'
        }}
        aria-hidden="true"
      >
        {['♥','◈','♠','◈','♦','◈','♣'].map((s, i) => (
          <span key={i}>{s}</span>
        ))}
      </div>
    </section>
  )
}

export default Hero