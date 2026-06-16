import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { processarEquipes } from '../utils/rankingUtils'

/* ─── Rank tiers ─── */
const TIERS = [
  { 
    label: '✦ 1º LUGAR', 
    borderColor: '#D4A83A', 
    glowColor: 'rgba(212,168,58,0.4)', 
    badgeColor: '#F5D488',
    boxShadow: '0 0 30px rgba(212,168,58,0.5), 0 0 15px rgba(212,168,58,0.3), inset 0 0 20px rgba(212,168,58,0.1)',
    animation: 'glowGold 2s ease-in-out infinite'
  },
  { 
    label: '✦ 2º LUGAR', 
    borderColor: '#C0C0C0', 
    glowColor: 'rgba(192,192,192,0.35)', 
    badgeColor: '#D8D8D8',
    boxShadow: '0 0 25px rgba(192,192,192,0.4), 0 0 10px rgba(192,192,192,0.2), inset 0 0 15px rgba(192,192,192,0.08)',
    animation: 'glowSilver 2.5s ease-in-out infinite'
  },
  { 
    label: '✦ 3º LUGAR', 
    borderColor: '#CD7F32', 
    glowColor: 'rgba(205,127,50,0.35)', 
    badgeColor: '#DA8A4A',
    boxShadow: '0 0 25px rgba(205,127,50,0.4), 0 0 10px rgba(205,127,50,0.2), inset 0 0 15px rgba(205,127,50,0.08)',
    animation: 'glowBronze 2.5s ease-in-out infinite'
  }
]

/* ─── Engajamento styling com texto adaptativo para mobile ─── */
function engStyle(status, mediaEngajamento, isMobile = false) {
  const media = mediaEngajamento !== undefined ? parseFloat(mediaEngajamento) : null
  
  if (!status || status.includes('Alto') || (media !== null && media >= 0.7)) {
    return { 
      border: '1px solid #2d5a3b', 
      color: '#4a9e6e', 
      bg: 'rgba(45,90,59,0.15)', 
      icon: '🔥',
      label: isMobile 
        ? media !== null ? `${(media * 100).toFixed(0)}%` : '🔥'
        : media !== null ? `Engajamento: Coroa cobiçada (${(media * 100).toFixed(0)}%)` : 'Coroa cobiçada'
    }
  }
  if (status.includes('Médio') || (media !== null && media >= 0.4)) {
    return { 
      border: '1px solid #D4A83A', 
      color: '#D4A83A', 
      bg: 'rgba(212,168,58,0.12)', 
      icon: '⚡',
      label: isMobile 
        ? media !== null ? `${(media * 100).toFixed(0)}%` : '⚡'
        : media !== null ? `Engajamento: Médio (${(media * 100).toFixed(0)}%)` : 'Lendas nascendo'
    }
  }
  return { 
    border: '1px solid #c86060', 
    color: '#f43232', 
    bg: 'rgba(200,96,96,0.12)', 
    icon: '📉',
    label: isMobile 
      ? media !== null ? `${(media * 100).toFixed(0)}%` : '📉'
      : media !== null ? `Engajamento: Coroa abandonada (${(media * 100).toFixed(0)}%)` : 'Coroa abandonada'
  }
}

function Ranking() {
  const [data, setData] = useState({ top3: [], demais: [] })
  const [loading, setLoading] = useState(true)
  const [width, setWidth] = useState(window.innerWidth)
  const [filtroMes, setFiltroMes] = useState('todos')
  const [semDados, setSemDados] = useState(false)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    carregarDados()
  }, [filtroMes])

  const carregarDados = async () => {
    setLoading(true)
    setSemDados(false)
    
    let query = supabase.from('avaliacoes').select('*')
    
    if (filtroMes !== 'todos') {
      query = query.eq('mes', filtroMes)
    }
    
    const { data: rows, error } = await query
    
    if (error) { 
      console.error('❌ Erro na consulta:', error); 
      setLoading(false); 
      return 
    }
    
    const arr = processarEquipes(rows || [])
    
    if (arr.length === 0) {
      setSemDados(true)
      setData({ top3: [], demais: [] })
    } else {
      setSemDados(false)
      setData({ top3: arr.slice(0, 3), demais: arr.slice(3, 6) })
    }
    
    setLoading(false)
  }

  const mobile = width <= 768
  const tablet = width <= 1024 && width > 768
  const verySmall = width <= 380

  // Safe area para iPhone com notch
  const safeTop = 'env(safe-area-inset-top)'
  const safeBottom = 'env(safe-area-inset-bottom)'

  if (loading) return (
    <div className="ranking-loading">
      <p style={{ fontFamily: 'var(--font-title)', color: 'var(--ink)', letterSpacing: '0.3em' }}>
        🏰 Consultando os registros do reino…
      </p>
    </div>
  )

  if (semDados) {
    const mensagemPersonalizada = "O destino desta temporada ainda há de ser escrito nas crônicas do tempo..."
    
    return (
      <div
        id="ranking"
        style={{
          backdropFilter: 'var(--glass-blur-strong)',
          WebkitBackdropFilter: 'var(--glass-blur-strong)',
          paddingTop: mobile ? `calc(40px + ${safeTop})` : tablet ? `calc(60px + ${safeTop})` : `calc(90px + ${safeTop})`,
          paddingRight: mobile ? '12px' : tablet ? '20px' : '24px',
          paddingBottom: mobile ? `calc(40px + ${safeBottom})` : tablet ? `calc(60px + ${safeBottom})` : `calc(90px + ${safeBottom})`,
          paddingLeft: mobile ? '12px' : tablet ? '20px' : '24px'
        }}
      >
        <div style={{ 
          maxWidth: mobile ? '100%' : tablet ? '90%' : 1100, 
          margin: '0 auto' 
        }}>
          <p style={{
            fontFamily: 'var(--font-sc)', 
            fontSize: mobile ? 10 : tablet ? 11 : 13,
            letterSpacing: mobile ? '0.3em' : '0.55em', 
            color: 'var(--gold)',
            textAlign: 'center', 
            marginBottom: '0.6rem'
          }}>
            ✦ RANKING DAS CASAS ✦
          </p>
          <h2 style={{
            fontFamily: 'var(--font-display)', 
            fontWeight: 700,
            fontSize: mobile ? 'clamp(1.3rem, 5vw, 1.8rem)' : tablet ? 'clamp(1.8rem, 4vw, 2.2rem)' : 'clamp(2rem, 5vw, 3rem)',
            background: 'linear-gradient(160deg, var(--ink) 0%, var(--gold-bright) 50%, var(--ink) 100%)',
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            textAlign: 'center', 
            marginBottom: '0.6rem', 
            letterSpacing: '0.06em'
          }}>
            CRÔNICA DA DISPUTA
          </h2>
          <div style={{ 
            textAlign: 'center', 
            color: 'var(--gold)', 
            fontSize: mobile ? 10 : tablet ? 12 : 14, 
            marginBottom: '0.8rem', 
            letterSpacing: mobile ? 6 : tablet ? 8 : 12 
          }}>
            <span style={{ color: 'var(--rose)' }}>♥</span>
            {' '}◈{' '}
            <span style={{ color: 'var(--rose)' }}>♦</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: mobile ? '0.8rem' : '1.5rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {['todos', 'Junho', 'Julho', 'Agosto'].map(mes => (
              <button
                key={mes}
                onClick={() => setFiltroMes(mes)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  fontFamily: 'var(--font-sc)',
                  fontSize: mobile ? (verySmall ? '0.5rem' : '0.6rem') : '0.7rem',
                  letterSpacing: mobile ? (verySmall ? '0.08em' : '0.15em') : '0.15em',
                  color: filtroMes === mes ? 'var(--gold-bright)' : 'var(--ink-fade)',
                  cursor: 'pointer',
                  padding: mobile ? '0.2rem 0.3rem' : '0.2rem 0',
                  transition: 'all 0.3s ease',
                  borderBottom: filtroMes === mes ? '1px solid var(--gold-bright)' : 'none',
                  opacity: filtroMes === mes ? 1 : 0.5,
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => {
                  if (filtroMes !== mes) {
                    e.currentTarget.style.color = 'var(--gold-mid)'
                    e.currentTarget.style.opacity = '0.8'
                  }
                }}
                onMouseLeave={(e) => {
                  if (filtroMes !== mes) {
                    e.currentTarget.style.color = 'var(--ink-fade)'
                    e.currentTarget.style.opacity = '0.5'
                  }
                }}
              >
                {mes === 'todos' 
                  ? (verySmall ? 'TODOS' : 'TODOS OS MESES') 
                  : mes.toUpperCase()
                }
              </button>
            ))}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            background: 'rgba(36, 36, 36, 0.3)',
            backdropFilter: 'blur(8px)',
            borderRadius: '16px',
            padding: mobile ? '1rem 1.2rem' : '1.5rem 2rem',
            border: '1px solid rgba(212, 175, 90, 0.3)',
            maxWidth: '500px',
            margin: '2rem auto'
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: mobile ? '0.8rem' : '1rem',
              color: 'var(--gold-mid)',
              letterSpacing: '0.08em',
              margin: 0,
              lineHeight: 1.5
            }}>
              {mensagemPersonalizada}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      id="ranking"
      style={{
        backdropFilter: 'var(--glass-blur-strong)',
        WebkitBackdropFilter: 'var(--glass-blur-strong)',
        paddingTop: mobile ? `calc(40px + ${safeTop})` : tablet ? `calc(60px + ${safeTop})` : `calc(90px + ${safeTop})`,
        paddingRight: mobile ? '12px' : tablet ? '20px' : '24px',
        paddingBottom: mobile ? `calc(40px + ${safeBottom})` : tablet ? `calc(60px + ${safeBottom})` : `calc(90px + ${safeBottom})`,
        paddingLeft: mobile ? '12px' : tablet ? '20px' : '24px'
      }}
    >
      <style>{`
        @keyframes glowGold {
          0%, 100% {
            box-shadow: 0 0 20px rgba(212,168,58,0.3), 0 0 40px rgba(212,168,58,0.2), inset 0 0 15px rgba(212,168,58,0.1);
          }
          50% {
            box-shadow: 0 0 35px rgba(212,168,58,0.6), 0 0 60px rgba(212,168,58,0.4), inset 0 0 25px rgba(212,168,58,0.2);
          }
        }
        
        @keyframes glowSilver {
          0%, 100% {
            box-shadow: 0 0 15px rgba(192,192,192,0.3), 0 0 30px rgba(192,192,192,0.15), inset 0 0 10px rgba(192,192,192,0.08);
          }
          50% {
            box-shadow: 0 0 25px rgba(192,192,192,0.5), 0 0 45px rgba(192,192,192,0.3), inset 0 0 18px rgba(192,192,192,0.15);
          }
        }
        
        @keyframes glowBronze {
          0%, 100% {
            box-shadow: 0 0 15px rgba(205,127,50,0.3), 0 0 30px rgba(205,127,50,0.15), inset 0 0 10px rgba(205,127,50,0.08);
          }
          50% {
            box-shadow: 0 0 25px rgba(205,127,50,0.5), 0 0 45px rgba(205,127,50,0.3), inset 0 0 18px rgba(205,127,50,0.15);
          }
        }
      `}</style>

      <div style={{ 
        maxWidth: mobile ? '100%' : tablet ? '90%' : 1100, 
        margin: '0 auto' 
      }}>

        <p style={{
          fontFamily: 'var(--font-sc)', 
          fontSize: mobile ? 10 : tablet ? 11 : 13,
          letterSpacing: mobile ? '0.3em' : '0.55em', 
          color: 'var(--gold)',
          textAlign: 'center', 
          marginBottom: '0.6rem'
        }}>
          ✦ RANKING DAS CASAS ✦
        </p>
        <h2 style={{
          fontFamily: 'var(--font-display)', 
          fontWeight: 700,
          fontSize: mobile ? 'clamp(1.3rem, 5vw, 1.8rem)' : tablet ? 'clamp(1.8rem, 4vw, 2.2rem)' : 'clamp(2rem, 5vw, 3rem)',
          background: 'linear-gradient(160deg, var(--ink) 0%, var(--gold-bright) 50%, var(--ink) 100%)',
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          textAlign: 'center', 
          marginBottom: '0.6rem', 
          letterSpacing: '0.06em'
        }}>
          CRÔNICA DA DISPUTA
        </h2>
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--gold)', 
          fontSize: mobile ? 10 : tablet ? 12 : 14, 
          marginBottom: '0.8rem', 
          letterSpacing: mobile ? 6 : tablet ? 8 : 12 
        }}>
          <span style={{ color: 'var(--rose)' }}>♥</span>
          {' '}◈{' '}
          <span style={{ color: 'var(--rose)' }}>♦</span>
        </div>
        <p style={{
          textAlign: 'center', 
          fontStyle: 'italic',
          fontSize: mobile ? '0.8rem' : tablet ? '0.9rem' : '1.1rem',
          color: 'var(--ink-dim)', 
          marginBottom: mobile ? '1.5rem' : tablet ? '2rem' : '2rem',
          fontFamily: 'var(--font-body)',
          padding: '0 1rem'
        }}>
          As casas classificadas pela ordem de glória conquistada nesta temporada.
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: mobile ? '0.8rem' : '1.5rem',
          marginBottom: '2rem',
          flexWrap: 'wrap'
        }}>
          {['todos', 'Junho', 'Julho', 'Agosto'].map(mes => (
            <button
              key={mes}
              onClick={() => setFiltroMes(mes)}
              style={{
                background: 'transparent',
                border: 'none',
                fontFamily: 'var(--font-sc)',
                fontSize: mobile ? (verySmall ? '0.5rem' : '0.6rem') : '0.7rem',
                letterSpacing: mobile ? (verySmall ? '0.08em' : '0.15em') : '0.15em',
                color: filtroMes === mes ? 'var(--gold-bright)' : 'var(--ink-fade)',
                cursor: 'pointer',
                padding: mobile ? '0.2rem 0.3rem' : '0.2rem 0',
                transition: 'all 0.3s ease',
                borderBottom: filtroMes === mes ? '1px solid var(--gold-bright)' : 'none',
                opacity: filtroMes === mes ? 1 : 0.5,
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                if (filtroMes !== mes) {
                  e.currentTarget.style.color = 'var(--gold-mid)'
                  e.currentTarget.style.opacity = '0.8'
                }
              }}
              onMouseLeave={(e) => {
                if (filtroMes !== mes) {
                  e.currentTarget.style.color = 'var(--ink-fade)'
                  e.currentTarget.style.opacity = '0.5'
                }
              }}
            >
              {mes === 'todos' 
                ? (verySmall ? 'TODOS' : 'TODOS OS MESES') 
                : mes.toUpperCase()
              }
            </button>
          ))}
        </div>

        {/* Top 3 cards - AGORA COM 3 COLUNAS NO TABLET TAMBÉM */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : '1fr 1.15fr 1fr',
          gap: mobile ? '1rem' : tablet ? '1.2rem' : '1.5rem',
          alignItems: 'stretch'
        }}>
          {data.top3.map((equipe, idx) => {
            const tier = TIERS[idx]
            const eng = engStyle(equipe.statusEngajamento, equipe.mediaEngajamento, mobile)
            
            return (
              <div
                key={equipe.nome}
                style={{
                  background: 'rgba(0, 0, 0, 0.45)',
                  backdropFilter: 'blur(12px)',
                  border: `2px solid ${tier.borderColor}`,
                  borderRadius: mobile ? '16px' : tablet ? '20px' : '24px',
                  boxShadow: tier.boxShadow,
                  animation: tier.animation,
                  padding: mobile ? '1rem 0.8rem' : tablet ? '1.2rem 1rem' : '1.5rem 1.5rem',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'default',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={e => {
                  if (!mobile) {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                    e.currentTarget.style.boxShadow = `0 0 45px ${tier.glowColor}, 0 0 80px ${tier.glowColor}`
                  }
                }}
                onMouseLeave={e => {
                  if (!mobile) {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = tier.boxShadow
                  }
                }}
              >
                <div style={{
                  position: 'absolute', 
                  top: 0, 
                  left: '10%', 
                  right: '10%', 
                  height: mobile ? 2 : 3,
                  background: `linear-gradient(90deg, transparent, ${tier.borderColor} 30%, #fff 50%, ${tier.borderColor} 70%, transparent)`,
                  borderTopLeftRadius: mobile ? '16px' : tablet ? '20px' : '24px',
                  borderTopRightRadius: mobile ? '16px' : tablet ? '20px' : '24px'
                }} />

                <p style={{
                  fontFamily: 'Cinzel', 
                  fontSize: mobile ? 9 : tablet ? 11 : 15,
                  letterSpacing: '0.4em', 
                  color: tier.badgeColor,
                  marginBottom: '0.3rem'
                }}>
                  {tier.label}
                </p>

                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: mobile ? '0.85rem' : tablet ? '1.1rem' : '1.3rem',
                  fontWeight: 700, 
                  color: 'var(--ink)',
                  marginBottom: '0.2rem', 
                  letterSpacing: '0.04em',
                  background: 'transparent',
                  wordBreak: 'break-word'
                }}>
                  {equipe.nome}
                </h3>

                <div style={{ 
                  width: mobile ? 25 : tablet ? 35 : 40, 
                  height: mobile ? 1 : 2, 
                  background: tier.borderColor, 
                  marginTop: '0.4rem',
                  marginRight: 'auto',
                  marginBottom: '0.8rem',
                  marginLeft: 'auto',
                  opacity: 0.8, 
                  borderRadius: 1 
                }} />

                <div style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: mobile ? '1.3rem' : tablet ? '1.8rem' : '2.2rem',
                  fontWeight: 700,
                  background: 'transparent',
                  color: tier.borderColor,
                  lineHeight: 1, 
                  marginBottom: '0.8rem',
                  textShadow: `0 0 10px ${tier.glowColor}`
                }}>
                  {equipe.pontos}
                  <span style={{
                    fontSize: mobile ? '0.5rem' : tablet ? '0.7rem' : '0.8rem',
                    letterSpacing: '0.2em', 
                    color: 'var(--ink-dim)',
                    marginLeft: 4,
                    display: mobile ? 'block' : 'inline'
                  }}>
                    PONTOS
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
                  gap: mobile ? '0.4rem' : tablet ? '0.6rem' : '0.8rem', 
                  marginBottom: '0.8rem'
                }}>
                  {[
                    { key: 'MÉDIA', val: equipe.mediaEquipe === '-' ? '—' : `${equipe.mediaEquipe}%` },
                    { key: 'MVP', val: equipe.mvp }
                  ].map(({ key, val }) => (
                    <div key={key} style={{
                      background: 'rgba(0, 0, 0, 0.35)',
                      backdropFilter: 'blur(8px)',
                      padding: mobile ? '4px 4px' : tablet ? '6px 4px' : '8px 6px',
                      borderRadius: '10px',
                      border: `1px solid ${tier.borderColor}40`
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-sc)', 
                        fontSize: mobile ? 6 : tablet ? 8 : 9, 
                        letterSpacing: '0.2em',
                        color: tier.borderColor, 
                        marginBottom: 2
                      }}>{key}</div>
                      <div style={{ 
                        color: 'var(--ink-mid)', 
                        fontSize: mobile ? '0.7rem' : tablet ? '0.85rem' : '0.95rem', 
                        fontWeight: 600,
                        wordBreak: 'break-word'
                      }}>
                        {val}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: mobile ? 3 : 8,
                  fontFamily: 'var(--font-sc)', 
                  fontSize: mobile ? 6 : tablet ? 8 : 9, 
                  letterSpacing: '0.15em',
                  border: eng.border, 
                  color: eng.color, 
                  background: eng.bg,
                  padding: mobile ? '4px 8px' : tablet ? '6px 12px' : '6px 14px', 
                  borderRadius: 30, 
                  transition: 'all 0.3s',
                  width: 'fit-content',
                  margin: '0 auto'
                }}>
                  <span style={{ fontSize: mobile ? 9 : 12 }}>{eng.icon}</span>
                  <span>{eng.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Positions 4–6 */}
        {data.demais.length > 0 && (
          <div style={{ marginTop: mobile ? '2rem' : tablet ? '2.5rem' : '3rem' }}>

            <div style={{
              display: 'flex', 
              alignItems: 'center', 
              gap: mobile ? '0.6rem' : '1.5rem',
              marginBottom: mobile ? '0.8rem' : '1.2rem', 
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <div style={{ 
                flex: mobile ? 0 : tablet ? 0.5 : 1, 
                height: 1, 
                background: 'linear-gradient(to right, transparent, var(--glass-border-strong))', 
                display: mobile ? 'none' : 'block' 
              }} />
              <span style={{ 
                fontFamily: 'var(--font-sc)', 
                fontSize: mobile ? 6 : tablet ? 8 : 9, 
                letterSpacing: '0.3em', 
                color: 'var(--ink-dim)', 
                whiteSpace: 'nowrap', 
                textAlign: 'center',
                padding: '0 0.5rem'
              }}>
                ♠ DEMAIS CASAS ♠
              </span>
              <div style={{ 
                flex: mobile ? 0 : tablet ? 0.5 : 1, 
                height: 1, 
                background: 'linear-gradient(to left, transparent, var(--glass-border-strong))', 
                display: mobile ? 'none' : 'block' 
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '0.5rem' : '0.8rem' }}>
              {data.demais.map((equipe, i) => {
                const suits = ['♣', '♦', '♠']
                const eng = engStyle(equipe.statusEngajamento, equipe.mediaEngajamento, mobile)

                return (
                  <div
                    key={equipe.nome}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: mobile 
                        ? '1fr' 
                        : tablet 
                          ? 'minmax(40px, auto) 1fr 1fr' 
                          : 'minmax(50px, auto) minmax(180px, 2fr) minmax(180px, auto) minmax(80px, auto)',
                      alignItems: 'center',
                      gap: mobile ? '0.4rem' : tablet ? '0.6rem' : '1rem',
                      padding: mobile ? '0.6rem' : tablet ? '0.7rem' : '0.8rem 1.2rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      backdropFilter: 'blur(12px)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: mobile ? '12px' : tablet ? '16px' : '20px',
                      transition: 'all 0.3s',
                      cursor: 'default'
                    }}
                    onMouseEnter={e => {
                      if (!mobile) {
                        e.currentTarget.style.borderColor = 'var(--gold)'
                        e.currentTarget.style.transform = 'translateX(6px)'
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'
                        e.currentTarget.style.boxShadow = '0 4px 24px var(--gold-glow)'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!mobile) {
                        e.currentTarget.style.borderColor = 'var(--glass-border)'
                        e.currentTarget.style.transform = 'translateX(0)'
                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'
                        e.currentTarget.style.boxShadow = 'none'
                      }
                    }}
                  >
                    <div style={{ 
                      display: 'flex', 
                      flexDirection: mobile ? 'row' : 'column', 
                      alignItems: 'center', 
                      gap: mobile ? '0.2rem' : 0,
                      justifyContent: 'center'
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', 
                        fontSize: mobile ? '1rem' : tablet ? '1.1rem' : '1.3rem', 
                        fontWeight: 700,
                        color: 'var(--gold)',
                        lineHeight: 1
                      }}>
                        {i + 4}º
                      </span>
                      <span style={{ fontSize: mobile ? 8 : 11, color: 'var(--ink-dim)', opacity: 0.5 }}>{suits[i]}</span>
                    </div>

                    <div style={{ 
                      textAlign: mobile ? 'center' : 'left',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        fontFamily: 'var(--font-title)', 
                        fontSize: mobile ? '0.8rem' : tablet ? '0.85rem' : '0.95rem',
                        fontWeight: 700, 
                        color: 'var(--ink)', 
                        letterSpacing: '0.05em',
                        wordBreak: 'break-word'
                      }}>
                        {equipe.nome}
                      </div>
                      <div style={{ 
                        fontFamily: 'var(--font-body)', 
                        fontSize: mobile ? '0.6rem' : '0.7rem', 
                        fontStyle: 'italic', 
                        color: 'var(--ink-dim)', 
                        marginTop: 2 
                      }}>
                        {equipe.pontos} pontos
                      </div>
                    </div>

                    <div style={{
                      display: 'flex', 
                      flexWrap: 'wrap', 
                      gap: mobile ? '0.3rem' : '0.4rem', 
                      alignItems: 'center',
                      justifyContent: mobile ? 'center' : 'flex-start'
                    }}>
                      <span style={{
                        fontFamily: 'var(--font-sc)', 
                        fontSize: mobile ? 5 : tablet ? 7 : 8, 
                        letterSpacing: '0.1em',
                        padding: mobile ? '2px 5px' : tablet ? '3px 8px' : '4px 8px', 
                        border: '1px solid var(--glass-border)',
                        color: 'var(--gold)', 
                        background: 'rgba(212,168,58,0.08)',
                        whiteSpace: 'nowrap', 
                        borderRadius: 10
                      }}>
                        ◈ {mobile ? '' : 'MÉDIA '}{equipe.mediaEquipe === '-' ? '—' : `${equipe.mediaEquipe}%`}
                      </span>

                      <span style={{
                        fontFamily: 'var(--font-sc)', 
                        fontSize: mobile ? 5 : tablet ? 7 : 8, 
                        letterSpacing: '0.1em',
                        padding: mobile ? '2px 6px' : tablet ? '3px 8px' : '4px 10px', 
                        border: eng.border, 
                        color: eng.color,
                        background: eng.bg, 
                        whiteSpace: 'nowrap', 
                        borderRadius: 20,
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: 2
                      }}>
                        <span style={{ fontSize: mobile ? 8 : 10 }}>{eng.icon}</span>
                        <span>{mobile ? eng.label : (eng.label.includes('%') ? eng.label.split('(')[0] : eng.label)}</span>
                      </span>
                    </div>

                    <div style={{
                      display: mobile ? 'none' : 'flex',
                      flexDirection: 'column',
                      alignItems: tablet ? 'center' : 'flex-end',
                      textAlign: tablet ? 'center' : 'right'
                    }}>
                      <span style={{ 
                        fontFamily: 'var(--font-sc)', 
                        fontSize: mobile ? 5 : tablet ? 6 : 7, 
                        letterSpacing: '0.25em', 
                        color: 'var(--gold)', 
                        opacity: 0.7 
                      }}>
                        ♛ MVP
                      </span>
                      <span style={{ 
                        fontSize: mobile ? '0.6rem' : tablet ? '0.7rem' : '0.8rem', 
                        fontWeight: 600, 
                        color: 'var(--ink-mid)'
                      }}>
                        {equipe.mvp}
                      </span>
                    </div>

                    {/* MVP em mobile - aparece abaixo */}
                    {mobile && (
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        paddingTop: '0.2rem',
                        borderTop: '1px solid var(--glass-border)'
                      }}>
                        <span style={{ 
                          fontFamily: 'var(--font-sc)', 
                          fontSize: 5, 
                          letterSpacing: '0.25em', 
                          color: 'var(--gold)', 
                          opacity: 0.7 
                        }}>
                          ♛ MVP
                        </span>
                        <span style={{ 
                          fontSize: '0.6rem', 
                          fontWeight: 600, 
                          color: 'var(--ink-mid)'
                        }}>
                          {equipe.mvp}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Ranking