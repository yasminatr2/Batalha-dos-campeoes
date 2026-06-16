import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function Stats() {
  const [stats, setStats] = useState({ casas: 0, dias: 0, topo: 0, trono: 1 })

  useEffect(() => {
    async function loadStats() {
      const { data, error } = await supabase.from('avaliacoes').select('*')
      if (error) { console.error('Erro stats:', error); return }

      const equipes = new Set()
      const pontosPorMembro = {}
      let maiorPontuacaoIndividual = 0

      data.forEach(item => {
        equipes.add(item.equipe_nome)
        
        const membro = item.membro_nome
        const pontos = Number(item.pontos) || 0
        
        // Acumula pontos por membro (todos os meses)
        pontosPorMembro[membro] = (pontosPorMembro[membro] || 0) + pontos
        
        // Atualiza a maior pontuação individual
        if (pontosPorMembro[membro] > maiorPontuacaoIndividual) {
          maiorPontuacaoIndividual = pontosPorMembro[membro]
        }
      })

      const inicio = new Date('2026-06-01T00:00:00')
      const diasPassados = Math.max(0, Math.ceil((new Date() - inicio) / 86400000))

      setStats({ 
        casas: equipes.size, 
        dias: diasPassados, 
        topo: maiorPontuacaoIndividual,  // ← Pontos do melhor atendente
        trono: 1 
      })
    }
    loadStats()
  }, [])

  const statItems = [
    { num: stats.casas, label: 'CASAS EM DISPUTA', icon: '🏰' },
    { num: stats.dias,  label: 'DIAS DE BATALHA',  icon: '⚔' },
    { num: stats.topo,  label: 'PONTOS NO TOPO MVP',   icon: '👑' },
    { num: stats.trono, label: 'TRONO A CONQUISTAR', icon: '♛' }
  ]

  return (
    <div className="stats">
      {/* Ornament row */}
      <div className="suit-row" aria-hidden="true">
        {['♥','◈','♠','◈','♦','◈','♣'].map((s, i) => (
          <span key={i} className={s === '♥' || s === '♦' ? 's-red' : 's-black'}>
            {s}
          </span>
        ))}
      </div>

      <div className="stats-grid">
        {statItems.map((item, i) => (
          <div key={i} className="stat-item reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
            <span className="stat-num">{item.num}</span>
            <div className="stat-line" />
            <span className="stat-label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Stats