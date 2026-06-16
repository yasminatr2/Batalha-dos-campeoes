import React from 'react'

function Footer() {
  return (
    <footer>
      <div className="suit-row" style={{ justifyContent: 'center', gap: '1.8rem', marginBottom: '1.2rem' }} aria-hidden="true">
        {[
          { char: '♥', color: 'var(--rose)',    opacity: 0.6 },
          { char: '◈', color: 'var(--gold)',    opacity: 0.3 },
          { char: '♠', color: 'var(--ink-dim)', opacity: 0.4 },
          { char: '◈', color: 'var(--gold)',    opacity: 0.3 },
          { char: '♦', color: 'var(--rose)',    opacity: 0.5 },
          { char: '◈', color: 'var(--gold)',    opacity: 0.3 },
          { char: '♣', color: 'var(--ink-dim)', opacity: 0.4 }
        ].map((s, i) => (
          <span key={i} style={{ fontSize: '1.1rem', color: s.color, opacity: s.opacity }}>
            {s.char}
          </span>
        ))}
      </div>

      <div className="footer-emblem">♥ QUALIDADE ♥</div>
      <div className="footer-ornament">— ◈ —</div>
    </footer>
  )
}

export default Footer