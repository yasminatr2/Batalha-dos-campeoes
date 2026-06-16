import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { processarEquipes } from '../utils/rankingUtils' // 👈 Importa a mesma lógica do ranking

/* ─── Static house data ─── */
const casasInfo = {
  'The Jokers': {
    corPrimaria: '#C0424F', corSecundaria: '#1a1a1a', corTab: '#C0424F',
    lema: 'Pela honra, pela glória e pela folga!',
    simbolo: '🃏',
    descricao: 'Casa dos coringas, conhecida por sua versatilidade e jogadas imprevisíveis. Estratégia, criatividade e muito estilo definem este time.',
    historia: 'Fundada nos salões da irreverência, The Jokers prova que é possível vencer com estilo e ousadia. Cada jogada é uma carta na manga.',
    membros: ['Rayara', 'Lindsey', 'Tatiane', 'Maria Clara', 'Felipe G']
  },
  'Carmesim de Neshão': {
    corPrimaria: '#8B0000', corSecundaria: '#1a0a0a', corTab: '#8B0000',
    lema: 'Sangue, honra e atendimento!',
    simbolo: '🐦‍🔥',
    descricao: 'Guerreiros de Neshão. Disciplina, força e compromisso com a qualidade total. Como a fênix, renascem mais fortes.',
    historia: 'Nascidos nas terras vermelhas de Neshão, estes guerreiros forjaram sua reputação na ponta da espada e na excelência do atendimento.',
    membros: ['Matheus', 'Mariana', 'Aline', 'Arthur', 'Gustavo']
  },
  'Blackwolff': {
    corPrimaria: '#1a1a1a',
    corSecundaria: '#C0C0C0',
    corTab: '#C0C0C0',
    lema: 'Um lobo sozinho é forte, uma alcateia é imbatível',
    simbolo: '🐺',
    descricao: 'A alcateia unida pela força e lealdade. Sob a luz da lua prateada, os lobos da Blackwolff caçam a vitória com determinação e trabalho em equipe.',
    historia: 'Nas terras geladas do norte, a alcateia Blackwolff forjou sua reputação. Lideradas por guerreiras destemidas, provam que juntos são imbatíveis como lobos em matilha.',
    membros: ['Maria Eduarda', 'Lindsey', 'Sara', 'Frederico', 'Cauane', 'Felipe P', 'Julia']
  },
  'Reis Templários': {
    corPrimaria: '#1a4d3a',
    corSecundaria: '#2d7a5a',
    corTab: '#2d7a5a',
    lema: 'Deixe que o medo te traga a coragem!',
    simbolo: '🦅',
    descricao: 'Cavaleiros da fé e da honra. Os Reis Templários protegem o reino com bravura inabalável e determinação férrea.',
    historia: 'Fundados nos ideais sagrados da cavalaria, os Reis Templários transformam medo em força e desafios em glória. Liderados por Hugo e Mari, são a linha de frente da batalha.',
    membros: ['Hugo', 'Mariana', 'Daniel', 'Samuel']
  }
}

const casaPadrao = {
  corPrimaria: '#d4a03a', corSecundaria: '#1a1410', corTab: '#d4a03a',
  lema: 'Em busca da glória!',
  simbolo: '🏰',
  descricao: 'Casa participante da Batalha dos Campeões.',
  historia: 'Uma nova casa surgiu nas terras da competição. Ainda não se sabe muito sobre seus guerreiros, mas prometem dar trabalho.',
  membros: []
}

function HousesShowcase() {
  const [houses, setHouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHouse, setSelectedHouse] = useState(null)

  useEffect(() => { carregarCasas() }, [])

  const carregarCasas = async () => {
    setLoading(true)

    // Busca TODOS os dados das avaliações
    const { data: avaliacoes, error } = await supabase
      .from('avaliacoes')
      .select('*')
      .order('equipe_nome')

    if (error) { 
      console.error(error); 
      setLoading(false); 
      return 
    }

    // ✅ USA A MESMA LÓGICA DO RANKING para calcular pontuação das equipes
    const ranking = processarEquipes(avaliacoes || [])
    
    // Cria um mapa para acesso rápido por nome da equipe
    const pontosMap = {}
    ranking.forEach(equipe => {
      pontosMap[equipe.nome] = equipe.pontos
    })

    // Pega nomes únicos das equipes
    const nomesUnicos = [...new Map(avaliacoes.map(i => [i.equipe_nome, i])).values()]
    
    // Formata as casas com a pontuação calculada pelo rankingUtils
    const casasFormatadas = nomesUnicos.map((equipe, index) => ({
      id: index,
      nome: equipe.equipe_nome,
      pontos: pontosMap[equipe.equipe_nome] || 0, // ✅ USA PONTUAÇÃO DO RANKING
      ...(casasInfo[equipe.equipe_nome] || casaPadrao)
    }))

    // Ordena por pontuação (maior para menor) para manter consistência
    casasFormatadas.sort((a, b) => b.pontos - a.pontos)

    setHouses(casasFormatadas)
    if (casasFormatadas.length > 0) setSelectedHouse(casasFormatadas[0])
    setLoading(false)
  }

  if (loading) return (
    <section className="section">
      <p className="section-tag">⏳ CONVOCANDO AS CASAS…</p>
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)', fontFamily: 'var(--font-title)', letterSpacing: '0.2em' }}>
        🏰 Abrindo os registros do reino…
      </div>
    </section>
  )

  if (!selectedHouse) return null

  return (
    <section
      className="section houses-showcase"
      style={{
        background: 'linear-gradient(180deg, var(--stone-dark) 0%, var(--stone) 50%, var(--stone-dark) 100%)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        padding: '3rem 2rem 5rem',
        maxWidth: '100%'
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>

        {/* ─── Section header ─── */}
        <p className="section-tag reveal">⚔ AS CASAS PARTICIPANTES ⚔</p>
        <h2 className="section-title reveal">CONHEÇA OS CLÃS</h2>
        <div className="section-ornament reveal">
          <span style={{ color: 'var(--rose)' }}>♥</span>
          {' '}◈{' '}
          <span style={{ color: 'var(--rose)' }}>♠</span>
        </div>

        {/* ─── Glassmorphism container com brilho ─── */}
        <div className="glass-container" style={{ position: 'relative' }}>
          {/* Cantos com brilho animado */}
          <div className="corner-shine top-left"></div>
          <div className="corner-shine top-right"></div>
          <div className="corner-shine bottom-left"></div>
          <div className="corner-shine bottom-right"></div>
          
          {/* Cantos decorativos */}
          <div className="decor-corner" style={{ top: '12px', left: '16px' }}>✦</div>
          <div className="decor-corner" style={{ bottom: '12px', right: '16px' }}>✦</div>

          {/* Tabs */}
          <div className="house-tabs">
            {houses.map(house => (
              <button
                key={house.id}
                className={`house-tab ${selectedHouse?.nome === house.nome ? 'active' : ''}`}
                onClick={() => setSelectedHouse(house)}
                style={{ '--tab-color': house.corTab, '--tab-color-glow': `${house.corTab}40` }}
              >
                <span className="tab-simbolo">{house.simbolo}</span>
                <span className="tab-nome">{house.nome}</span>
                <span className="tab-pontos">{house.pontos} pts</span>
              </button>
            ))}
          </div>

          {/* House content */}
          <div
            className="house-content"
            style={{ '--house-primary': selectedHouse.corPrimaria, '--house-secondary': selectedHouse.corSecundaria }}
          >
            {/* Header */}
            <div className="house-header-glass">
              <div className="house-icon" style={{ color: selectedHouse.corPrimaria }}>
                {selectedHouse.simbolo}
              </div>

              <div className="house-title">
                <h3 className="house-name">{selectedHouse.nome}</h3>
                <div
                  className="house-lema-glass"
                  style={{ borderLeftColor: selectedHouse.corPrimaria, borderTopColor: selectedHouse.corPrimaria }}
                >
                  "{selectedHouse.lema}"
                </div>
              </div>

              <div className="house-score">
                <span className="score-value">{selectedHouse.pontos}</span>
                <span className="score-label">PONTOS TOTAIS</span>
              </div>
            </div>

            {/* Body grid */}
            <div className="house-body">
              <div className="house-description">
                <h4>✦ Sobre a Casa</h4>
                <p>{selectedHouse.descricao}</p>
              </div>

              <div className="house-history">
                <h4>📜 Lenda da Casa</h4>
                <p>{selectedHouse.historia}</p>
              </div>

              <div className="house-members">
                <h4>⚔ Cavaleiros da Casa</h4>
                <div className="members-grid">
                  {selectedHouse.membros.map((membro, idx) => (
                    <span key={idx} className="member-tag">{membro}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="house-footer">
              <div className="ranking-indicator">⚔ Em busca da vitória · Batalha dos Campeões ⚔</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HousesShowcase