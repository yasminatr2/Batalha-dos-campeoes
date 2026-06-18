// utils/rankingUtils.js - VERSÃO CORRIGIDA COM MÉDIAS DA EQUIPE E DESEMPATE

export function processarEquipes(data) {
  const equipes = {}

  data.forEach(item => {
    const eq = item.equipe_nome
    if (!eq) return

    if (!equipes[eq]) {
      equipes[eq] = {
        // Dados para calcular MÉDIAS da equipe
        somaAbsenteismo: 0,
        somaReincidencia: 0,
        somaEngajamento: 0,
        somaMediaEquipe: 0,
        membrosCount: 0,
        membros: [],
        // Para controle
        temSugestao: false,
        mediaEquipeManual: 0
      }
    }

    // ✅ SOMA para calcular MÉDIAS (NÃO soma pontos individuais)
    equipes[eq].somaAbsenteismo += Number(item.absenteismo) || 0
    equipes[eq].somaReincidencia += Number(item.reincidencia) || 0
    equipes[eq].somaEngajamento += Number(item.engajamento) || 0
    equipes[eq].somaMediaEquipe += Number(item.media_equipe) || 0
    equipes[eq].membrosCount++
    
    // Verifica se tem sugestão (qualquer membro)
    if (item.sugestao && item.sugestao.trim() !== "") {
      equipes[eq].temSugestao = true
    }
    
    // Guarda membros para calcular MVP (melhor média individual)
    equipes[eq].membros.push({
      nome: item.membro_nome,
      mediaIndividual: Number(item.media_individual) || 0,
      pontos: Number(item.pontos) || 0  // apenas para referência
    })
  })

  // ✅ CALCULA PONTUAÇÃO FINAL BASEADA NAS MÉDIAS
  const resultado = Object.entries(equipes).map(([nome, dados]) => {
    // Calcula as MÉDIAS da equipe
    const mediaAbsenteismo = dados.somaAbsenteismo / dados.membrosCount
    const mediaReincidencia = dados.somaReincidencia / dados.membrosCount
    const mediaEngajamento = dados.somaEngajamento / dados.membrosCount
    const mediaEquipeManual = dados.somaMediaEquipe / dados.membrosCount
    
    let pontuacaoFinal = 0
    
    // REGRA 1: Reincidência (baseado na MÉDIA da equipe)
    if (mediaReincidencia === 0) {
      pontuacaoFinal += 20
    } else if (mediaReincidencia <= 0.5) {
      pontuacaoFinal += 10
    }
    
    // REGRA 2: Média Equipe (manual)
    if (mediaEquipeManual >= 95) {
      pontuacaoFinal += 40
    } else if (mediaEquipeManual >= 94) {
      pontuacaoFinal += 35
    } else if (mediaEquipeManual >= 93) {
      pontuacaoFinal += 30
    }
    
    // REGRA 3: Absenteísmo (baseado na MÉDIA da equipe)
    if (mediaAbsenteismo === 0) {
      pontuacaoFinal += 20
    } else if (mediaAbsenteismo <= 0.5) {
      pontuacaoFinal += 15
    } else if (mediaAbsenteismo <= 1) {
      pontuacaoFinal += 10
    }
    
    // REGRA 4: Engajamento (baseado na MÉDIA da equipe)
    if (mediaEngajamento >= 0.7) {
      pontuacaoFinal += 10
    } else if (mediaEngajamento >= 0.4) {
      pontuacaoFinal += 5
    }
    
    // REGRA 5: Sugestão (se QUALQUER membro tiver)
    if (dados.temSugestao) {
      pontuacaoFinal += 10
    }
    
    // MVP: maior média individual
    const mvp = [...dados.membros].sort((a, b) => b.mediaIndividual - a.mediaIndividual)[0]
    
    // Status de engajamento baseado na média
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
      temSugestao: dados.temSugestao
    }
  })
  
  // ✅ ORDENAÇÃO COM CRITÉRIOS DE DESEMPATE
  const ranking = resultado.sort((a, b) => {
    // 1º critério: Pontuação (maior primeiro)
    if (b.pontos !== a.pontos) {
      return b.pontos - a.pontos
    }
    
    // 2º critério: Média da Equipe (maior primeiro)
    if (parseFloat(b.mediaEquipe) !== parseFloat(a.mediaEquipe)) {
      return parseFloat(b.mediaEquipe) - parseFloat(a.mediaEquipe)
    }
    
    // 3º critério: Menor Absenteísmo
    if (parseFloat(a.mediaAbsenteismo) !== parseFloat(b.mediaAbsenteismo)) {
      return parseFloat(a.mediaAbsenteismo) - parseFloat(b.mediaAbsenteismo)
    }
    
    // 4º critério: Menor Reincidência
    if (parseFloat(a.mediaReincidencia) !== parseFloat(b.mediaReincidencia)) {
      return parseFloat(a.mediaReincidencia) - parseFloat(b.mediaReincidencia)
    }
    
    // 5º critério: Maior Engajamento
    return parseFloat(b.mediaEngajamento) - parseFloat(a.mediaEngajamento)
  })
  
  return ranking
}