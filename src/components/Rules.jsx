import React from 'react'

const rules = [
  {
    num: '♥ 01',
    title: 'MÉDIA MÍNIMA DA CASA',
    text: 'A média individual de cada cavaleiro deve ser ≥ 90 e a média geral da Casa ≥ 94 para manter-se entre as Casas de elite.'
  },
  {
    num: '♦ 02',
    title: 'MÉDIA MÍNIMA POR CAVALEIRO',
    text: 'A casa que acumular falhas graves recorrentes perante a monitoria perderá honra na disputa e será desclassificada.'
  },
  {
    num: '♠ 03',
    title: 'JURAMENTO DA COROA',
    text: 'Nenhum cavaleiro digno da coroa deve acumular apontamentos graves em sua jornada. A honra é o escudo da Casa.'
  },
  {
    num: '♥ 04',
    title: 'MEDIDAS DISCIPLINARES',
    text: 'A equipe que tiver um cavaleiro com advertências, penalidades ou medidas administrativas no período avaliado será desclassificado.'
  },
  {
    num: '♣ 05',
    title: 'PONTUAÇÃO ZERO',
    text: 'A equipe que tiver um cavaleiro com pontuação zero no critério Qualidade de Atendimento será desclassificada.'
  }
]

// Critérios de desempate
const tiebreakers = [
  { ordem: '1º', criterio: 'Maior média geral de qualidade' },
  { ordem: '2º', criterio: 'Menor índice de registro de apontamentos' },
  { ordem: '3º', criterio: 'Menor índice de absenteísmo' },
  { ordem: '4º', criterio: 'Maior número de ações de engajamento e desenvolvimento' },
  { ordem: '5º', criterio: 'Maior número de sugestões de melhoria' }
]

function Rules() {
  return (
    <div id="regras" style={{ background: 'linear-gradient(180deg, var(--stone-dark) 0%, var(--stone) 100%)', borderTop: '0.5px solid var(--border)' }}>
      <div className="section">

        {/* Header */}
        <p className="section-tag reveal">✦ DECRETOS DA TEMPORADA ✦</p>
        <h2 className="section-title reveal">AS LEIS DO REINO</h2>
        <div className="section-ornament reveal">
          <span style={{ color: 'var(--rose)' }}>♦</span>
          {' '}◈{' '}
          <span style={{ color: 'var(--rose)' }}>♦</span>
        </div>
        <p className="section-desc reveal">
          Decretos oficiais gravados em pedra rúnica, que definem a honra e o funcionamento desta temporada.
        </p>

        {/* Rules list */}
        <div className="rules-list">
          {rules.map((rule, index) => (
            <RuleItem key={index} {...rule} index={index} />
          ))}
        </div>

        {/* Download */}
        <div className="download-container" style={{ textAlign: 'center', marginTop: '2.5rem' }}>
          <a
            href="/regulamento_competicao.pdf"
            download="Regulamento Real"
            className="hero-cta download-btn"
          >
            📜 OBTER O PERGAMINHO REAL
          </a>
        </div>

        {/* ─── CRITÉRIOS DE DESEMPATE ─── Minimalista abaixo do botão */}
        <div style={{
          marginTop: '3rem',
          paddingTop: '2rem',
          borderTop: '1px solid rgba(212, 175, 90, 0.25)',
          textAlign: 'center'
        }}>
          <div style={{
            marginBottom: '1rem'
          }}>
            <span style={{
              fontFamily: 'var(--font-sc)',
              fontSize: '0.6rem',
              letterSpacing: '0.3em',
              color: 'var(--gold-dim)',
              textTransform: 'uppercase',
              background: 'rgba(212, 168, 58, 0.08)',
              padding: '0.25rem 1rem',
              borderRadius: '20px',
              display: 'inline-block'
            }}>
              ◈ CRITÉRIOS DE DESEMPATE ◈
            </span>
          </div>
          
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.7rem',
            rowGap: '0.5rem',
            maxWidth: '750px',
            margin: '0 auto'
          }}>
            {tiebreakers.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontFamily: "'IM Fell English', serif",
                  fontSize: '1rem',
                  color: '#A89870',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '0.25rem 0.8rem',
                  borderRadius: '25px',
                  border: '1px solid rgba(212, 175, 90, 0.2)'
                }}
              >
                <span style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: '#F5D488'
                }}>
                  {item.ordem}
                </span>
                <span style={{ fontSize: '0.65rem' }}>
                  {item.criterio}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

function RuleItem({ num, title, text, index }) {
  // Todas as numerações agora são rose (cor vermelha)
  return (
    <div className={`rule-item reveal ${index > 0 ? `reveal-delay-${Math.min(index, 4)}` : ''}`}>
      <div className="rule-header">
        <span
          className="rule-num"
          style={{ color: 'white' }}
        >
          {num}
        </span>
        <div className="rule-bar" />
        <span className="rule-title-text">{title}</span>
      </div>
      <div className="rule-body">
        <div className="rule-body-inner">{text}</div>
      </div>
    </div>
  )
}

export default Rules