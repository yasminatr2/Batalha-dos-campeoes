// utils/rankingUtils.js - VERSÃO COMPLETA COM MOVIMENTAÇÕES E HISTÓRICO

import { supabase } from '../lib/supabase'

// ============================================
// FUNÇÃO PARA CALCULAR A MÉDIA DO MÊS DE UM MEMBRO
// ============================================
async function calcularMediaMes(membroNome, equipeNome, mes) {
  try {
    // 1. Tenta calcular usando as movimentações primeiro
    const { data: movs, error: movError } = await supabase
      .from("movimentacoes_pontos")
      .select("*")
      .eq("membro_nome", membroNome)
      .eq("equipe_nome", equipeNome)
      .eq("mes", mes)
      .order("data_movimentacao", { ascending: true })

    if (!movError && movs && movs.length > 0) {
      // Usa as movimentações
      const todasAvaliacoes = movs.map(mov => ({
        pontos: mov.pontos_depois,
        data: mov.data_movimentacao || mov.created_at
      }))

      const total = todasAvaliacoes.reduce((acc, item) => acc + item.pontos, 0)
      const count = todasAvaliacoes.length
      const media = total / count

      return {
        media: Math.round(media * 100) / 100,
        total: total,
        count: count,
        avaliacoes: todasAvaliacoes,
        fonte: 'movimentacoes'
      }
    }

    // 2. Fallback: usa o histórico
    const { data: historico, error: errorHist } = await supabase
      .from("avaliacoes_historico")
      .select("pontos, alterado_em, created_at")
      .eq("membro_nome", membroNome)
      .eq("equipe_nome", equipeNome)
      .eq("mes", mes)
      .order("alterado_em", { ascending: true })

    if (errorHist) {
      console.error("Erro ao buscar histórico:", errorHist)
    }

    const { data: atual, error: errorAtual } = await supabase
      .from("avaliacoes")
      .select("pontos, created_at")
      .eq("membro_nome", membroNome)
      .eq("equipe_nome", equipeNome)
      .eq("mes", mes)
      .maybeSingle()

    if (errorAtual) {
      console.error("Erro ao buscar atual:", errorAtual)
    }

    const todasAvaliacoes = []

    if (historico && historico.length > 0) {
      historico.forEach(item => {
        todasAvaliacoes.push({
          pontos: Number(item.pontos) || 0,
          data: item.alterado_em || item.created_at || new Date().toISOString()
        })
      })
    }

    if (atual) {
      const ultimoHistorico = historico && historico.length > 0 
        ? historico[historico.length - 1] 
        : null

      if (!ultimoHistorico || ultimoHistorico.pontos !== atual.pontos) {
        todasAvaliacoes.push({
          pontos: Number(atual.pontos) || 0,
          data: atual.created_at || new Date().toISOString()
        })
      }
    }

    if (todasAvaliacoes.length === 0) {
      return { media: 0, total: 0, count: 0, avaliacoes: [], fonte: 'nenhuma' }
    }

    const total = todasAvaliacoes.reduce((acc, item) => acc + item.pontos, 0)
    const count = todasAvaliacoes.length
    const media = total / count

    return {
      media: Math.round(media * 100) / 100,
      total: total,
      count: count,
      avaliacoes: todasAvaliacoes,
      fonte: 'historico'
    }

  } catch (error) {
    console.error("Erro ao calcular média do mês:", error)
    return { media: 0, total: 0, count: 0, avaliacoes: [], fonte: 'erro' }
  }
}

// ============================================
// FUNÇÃO PRINCIPAL PARA PROCESSAR EQUIPES
// ============================================
export async function processarEquipesComHistorico(mes) {
  try {
    const { data: avaliacoes, error } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("mes", mes)

    if (error) {
      console.error("Erro ao buscar avaliações:", error)
      return []
    }

    if (!avaliacoes || avaliacoes.length === 0) {
      return []
    }

    const equipes = {}

    for (const item of avaliacoes) {
      const eq = item.equipe_nome
      const membro = item.membro_nome
      
      if (!eq) continue

      if (!equipes[eq]) {
        equipes[eq] = {
          somaMediasMes: 0,
          membrosCount: 0,
          membros: [],
          temSugestao: false,
          somaAbsenteismo: 0,
          somaReincidencia: 0,
          somaEngajamento: 0,
          somaMediaEquipe: 0
        }
      }

      // Calcula a média do mês
      const resultado = await calcularMediaMes(membro, eq, mes)

      equipes[eq].somaMediasMes += resultado.media
      equipes[eq].membrosCount++
      
      equipes[eq].membros.push({
        nome: membro,
        mediaMes: resultado.media,
        pontosAtuais: Number(item.pontos) || 0,
        mediaIndividual: Number(item.media_individual) || 0,
        countAvaliacoes: resultado.count,
        fonte: resultado.fonte
      })

      equipes[eq].somaAbsenteismo += Number(item.absenteismo) || 0
      equipes[eq].somaReincidencia += Number(item.reincidencia) || 0
      equipes[eq].somaEngajamento += Number(item.engajamento) || 0
      equipes[eq].somaMediaEquipe += Number(item.media_equipe) || 0
      
      if (item.sugestao && item.sugestao.trim() !== "") {
        equipes[eq].temSugestao = true
      }
    }

    const resultado = Object.entries(equipes).map(([nome, dados]) => {
      const mediaEquipe = dados.somaMediasMes / dados.membrosCount
      const mvp = [...dados.membros].sort((a, b) => b.mediaMes - a.mediaMes)[0]
      
      const mediaAbsenteismo = dados.somaAbsenteismo / dados.membrosCount
      const mediaReincidencia = dados.somaReincidencia / dados.membrosCount
      const mediaEngajamento = dados.somaEngajamento / dados.membrosCount
      const mediaEquipeManual = dados.somaMediaEquipe / dados.membrosCount

      let statusEngajamento = "✅ Normal"
      if (mediaEngajamento >= 0.7) statusEngajamento = "🔥 Engajamento Alto"
      else if (mediaEngajamento >= 0.4) statusEngajamento = "📈 Engajamento Médio"

      return {
        nome,
        pontos: Math.round(mediaEquipe * 100) / 100,
        mediaEquipe: mediaEquipeManual.toFixed(2),
        mediaAbsenteismo: mediaAbsenteismo.toFixed(2),
        mediaReincidencia: mediaReincidencia.toFixed(2),
        mediaEngajamento: mediaEngajamento.toFixed(2),
        statusEngajamento,
        mvp: mvp?.nome || "-",
        totalMembros: dados.membrosCount,
        temSugestao: dados.temSugestao,
        mediaIndividuais: dados.membros.map(m => ({
          nome: m.nome,
          media: m.mediaMes,
          avaliacoes: m.countAvaliacoes,
          fonte: m.fonte
        }))
      }
    })

    return resultado.sort((a, b) => {
      if (b.pontos !== a.pontos) return b.pontos - a.pontos
      if (parseFloat(b.mediaEquipe) !== parseFloat(a.mediaEquipe)) {
        return parseFloat(b.mediaEquipe) - parseFloat(a.mediaEquipe)
      }
      if (parseFloat(a.mediaAbsenteismo) !== parseFloat(b.mediaAbsenteismo)) {
        return parseFloat(a.mediaAbsenteismo) - parseFloat(b.mediaAbsenteismo)
      }
      if (parseFloat(a.mediaReincidencia) !== parseFloat(b.mediaReincidencia)) {
        return parseFloat(a.mediaReincidencia) - parseFloat(b.mediaReincidencia)
      }
      return parseFloat(b.mediaEngajamento) - parseFloat(a.mediaEngajamento)
    })

  } catch (error) {
    console.error("Erro ao processar equipes:", error)
    return []
  }
}

// ============================================
// VERSÃO SÍNCRONA (PARA COMPATIBILIDADE)
// ============================================
export function processarEquipes(data) {
  console.warn("⚠️ processarEquipes() síncrono NÃO usa histórico! Use processarEquipesComHistorico()")
  
  const equipes = {}

  data.forEach(item => {
    const eq = item.equipe_nome
    if (!eq) return

    if (!equipes[eq]) {
      equipes[eq] = {
        somaAbsenteismo: 0,
        somaReincidencia: 0,
        somaEngajamento: 0,
        somaMediaEquipe: 0,
        membrosCount: 0,
        membros: [],
        temSugestao: false,
        somaPontosIndividuais: 0
      }
    }

    equipes[eq].somaAbsenteismo += Number(item.absenteismo) || 0
    equipes[eq].somaReincidencia += Number(item.reincidencia) || 0
    equipes[eq].somaEngajamento += Number(item.engajamento) || 0
    equipes[eq].somaMediaEquipe += Number(item.media_equipe) || 0
    equipes[eq].membrosCount++
    equipes[eq].somaPontosIndividuais += Number(item.pontos) || 0
    
    if (item.sugestao && item.sugestao.trim() !== "") {
      equipes[eq].temSugestao = true
    }
    
    equipes[eq].membros.push({
      nome: item.membro_nome,
      mediaIndividual: Number(item.media_individual) || 0,
      pontos: Number(item.pontos) || 0
    })
  })

  const resultado = Object.entries(equipes).map(([nome, dados]) => {
    const mediaAbsenteismo = dados.somaAbsenteismo / dados.membrosCount
    const mediaReincidencia = dados.somaReincidencia / dados.membrosCount
    const mediaEngajamento = dados.somaEngajamento / dados.membrosCount
    const mediaEquipeManual = dados.somaMediaEquipe / dados.membrosCount
    const mediaPontosIndividuais = dados.somaPontosIndividuais / dados.membrosCount
    const pontuacaoFinal = Math.round(mediaPontosIndividuais * 100) / 100
    
    const mvp = [...dados.membros].sort((a, b) => b.mediaIndividual - a.mediaIndividual)[0]
    
    let statusEngajamento = "✅ Normal"
    if (mediaEngajamento >= 0.7) statusEngajamento = "🔥 Engajamento Alto"
    else if (mediaEngajamento >= 0.4) statusEngajamento = "📈 Engajamento Médio"
    
    return {
      nome,
      pontos: pontuacaoFinal,
      mediaEquipe: mediaEquipeManual.toFixed(2),
      mediaAbsenteismo: mediaAbsenteismo.toFixed(2),
      mediaReincidencia: mediaReincidencia.toFixed(2),
      mediaEngajamento: mediaEngajamento.toFixed(2),
      statusEngajamento,
      mvp: mvp?.nome || "-",
      totalMembros: dados.membrosCount,
      temSugestao: dados.temSugestao,
      somaPontos: dados.somaPontosIndividuais,
      mediaPontos: mediaPontosIndividuais.toFixed(2)
    }
  })
  
  return resultado.sort((a, b) => {
    if (b.pontos !== a.pontos) return b.pontos - a.pontos
    if (parseFloat(b.mediaEquipe) !== parseFloat(a.mediaEquipe)) {
      return parseFloat(b.mediaEquipe) - parseFloat(a.mediaEquipe)
    }
    if (parseFloat(a.mediaAbsenteismo) !== parseFloat(b.mediaAbsenteismo)) {
      return parseFloat(a.mediaAbsenteismo) - parseFloat(b.mediaAbsenteismo)
    }
    if (parseFloat(a.mediaReincidencia) !== parseFloat(b.mediaReincidencia)) {
      return parseFloat(a.mediaReincidencia) - parseFloat(b.mediaReincidencia)
    }
    return parseFloat(b.mediaEngajamento) - parseFloat(a.mediaEngajamento)
  })
}