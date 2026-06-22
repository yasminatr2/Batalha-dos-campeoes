// utils/rankingUtils.js - VERSÃO CORRIGIDA COM MÉDIA DOS PONTOS INDIVIDUAIS

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
        temSugestao: false,
        // Soma dos pontos individuais
        somaPontosIndividuais: 0
      }
    }

    // SOMA para calcular MÉDIAS
    equipes[eq].somaAbsenteismo += Number(item.absenteismo) || 0
    equipes[eq].somaReincidencia += Number(item.reincidencia) || 0
    equipes[eq].somaEngajamento += Number(item.engajamento) || 0
    equipes[eq].somaMediaEquipe += Number(item.media_equipe) || 0
    equipes[eq].membrosCount++
    
    // SOMA OS PONTOS INDIVIDUAIS
    equipes[eq].somaPontosIndividuais += Number(item.pontos) || 0
    
    // Verifica se tem sugestão
    if (item.sugestao && item.sugestao.trim() !== "") {
      equipes[eq].temSugestao = true
    }
    
    // Guarda membros para MVP
    equipes[eq].membros.push({
      nome: item.membro_nome,
      mediaIndividual: Number(item.media_individual) || 0,
      pontos: Number(item.pontos) || 0
    })
  })

  // CALCULA PONTUAÇÃO FINAL
  const resultado = Object.entries(equipes).map(([nome, dados]) => {
    // Calcula as MÉDIAS
    const mediaAbsenteismo = dados.somaAbsenteismo / dados.membrosCount
    const mediaReincidencia = dados.somaReincidencia / dados.membrosCount
    const mediaEngajamento = dados.somaEngajamento / dados.membrosCount
    const mediaEquipeManual = dados.somaMediaEquipe / dados.membrosCount
    
    // CALCULA A MÉDIA DOS PONTOS INDIVIDUAIS
    const mediaPontosIndividuais = dados.somaPontosIndividuais / dados.membrosCount
    
    // USA A MÉDIA dos pontos (70, 80, 90 → média 80)
    const pontuacaoFinal = Math.round(mediaPontosIndividuais * 100) / 100
    
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
      temSugestao: dados.temSugestao,
      // Dados extras para debug
      somaPontos: dados.somaPontosIndividuais,
      mediaPontos: mediaPontosIndividuais.toFixed(2)
    }
  })
  
  // ORDENAÇÃO COM CRITÉRIOS DE DESEMPATE
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