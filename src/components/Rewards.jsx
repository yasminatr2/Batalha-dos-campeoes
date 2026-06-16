import React from 'react'

const rewards = [
  {
    tag: 'TROFÉU SUPREMO',
    title: 'BANQUETE DA VITÓRIA',
    desc: 'Um banquete de carnes assadas, provido pelo mestre da guilda.',
    featured: true,
    suit: '♥',
    rank: 'Q',
    icon: 'crown'
  },
  {
    tag: 'MÉRITO DA COMPANHIA',
    title: 'RECESSO DA GUILDA',
    desc: 'Repouso sagrado concedido pela casa mais valiosa.',
    delay: 1,
    suit: '♥',
    rank: 'A',
    icon: 'star'
  },
  {
    tag: 'PERGAMINHO OFICIAL',
    title: 'CERTIFICADO DE HONRA',
    desc: 'Reconhecimento formal gravado nos registros eternos da temporada.',
    delay: 2,
    suit: '♠',
    rank: 'K',
    icon: 'scroll'
  },
  {
    tag: 'PROCLAMAÇÃO REAL',
    title: 'TÍTULO HONORÁRIO',
    desc: 'Distinção permanente nos canais da Casa vencedora. Uma honra imortal.',
    delay: 1,
    suit: '♦',
    rank: 'J',
    icon: 'check'
  }
]

function Rewards() {
  return (
    <div id="recompensas" style={{
      background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(212,168,58,0.08) 0%, transparent 70%)'
    }}>
      <div className="section">

        <p className="section-tag reveal">✦ GLÓRIAS DO REINO ✦</p>
        <h2 className="section-title reveal">OS PRÊMIOS DA CONQUISTA</h2>
        <div className="section-ornament reveal">
          <span style={{ color: 'var(--rose)' }}>♥</span>
          {' '}◈{' '}
          <span style={{ color: 'var(--rose)' }}>♥</span>
        </div>
        <p className="section-desc reveal">
          Glórias e honras concedidas às Casas e cavaleiros que elevarem a bandeira da qualidade.
        </p>

        <div className="rewards-grid">
          {rewards.map((reward, i) => (
            <RewardCard key={i} {...reward} />
          ))}
        </div>

      </div>
    </div>
  )
}

function RewardCard({ tag, title, desc, featured, delay, suit, rank, icon }) {
  const isRose = suit === '♥' || suit === '♦'
  const suitColor = isRose ? 'var(--rose)' : 'var(--rose)'

  return (
    <div
      className={`reward-card ${featured ? 'featured' : ''} reveal ${delay ? `reveal-delay-${delay}` : ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}
    >
      {/* Card corner — top left */}
      <div style={{
        position: 'absolute', top: '12px', left: '14px',
        fontFamily: 'var(--font-title)', lineHeight: 1
      }}>
        <div style={{ fontSize: featured ? '13px' : '11px', fontWeight: 700, color: suitColor }}>{rank}</div>
        <div style={{ fontSize: featured ? '18px' : '14px', color: suitColor, lineHeight: 0.9 }}>{suit}</div>
      </div>

      {/* Card corner — bottom right (featured only) - COMPLETAMENTE REMOVIDO */}
      {featured && (
        <div style={{
          position: 'absolute', bottom: '12px', right: '14px',
          fontFamily: 'var(--font-title)', lineHeight: 1,
          transform: 'rotate(180deg)'
        }}>
          {/* Nada aqui - removido rank e suit */}
        </div>
      )}

      <p className="reward-tag">{tag}</p>
      <RewardIcon icon={icon} />
      <h3 className="reward-title">{title}</h3>
      <p className="reward-desc">{desc}</p>
    </div>
  )
}

function RewardIcon({ icon }) {
  // Estilo gradiente dourado via CSS (será aplicado no Font Awesome)
  const iconClass = "reward-icon-fontawesome"
  
  // Mapeamento de ícones do Font Awesome
  const iconMap = {
    crown: 'fas fa-crown',
    star: 'fas fa-star',
    scroll: 'fas fa-scroll',
    check: 'fas fa-check-circle'
  }

  const isCheck = icon === 'check'
  const gradientClass = isCheck ? 'icon-gold-gradient' : 'icon-gold-gradient'

  return (
    <i 
      className={`${iconMap[icon]} ${iconClass} ${gradientClass}`}
      style={{ fontSize: '48px', display: 'block', textAlign: 'center' }}
    />
  )
}

export default Rewards