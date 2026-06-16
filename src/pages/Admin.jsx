import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import * as XLSX from 'xlsx'

// Estrutura das equipes
const equipesData = {
  "The Jokers": {
    lideres: ["Rayara", "Lindsey"],
    membros: ["Tatiane", "Maria Clara", "Felipe G", "Julia"]
  },
  "Blackwolff": {
    lideres: ["Maria Eduarda", "Lindsey", "Mariana"],
    membros: ["Frederico", "Cauane", "Felipe P"]
  },
  "Carmesim de Neshão": {
    lideres: ["Matheus","Sara"],
    membros: ["Aline", "Arthur", "Gustavo"]
  },
  "Reis Templários": {
    lideres: ["Hugo","Mariana"],
    membros: ["Daniel", "Samuel"]
  }
}

function Admin() {
  const [equipeAtual, setEquipeAtual] = useState("The Jokers")
  const [membroAtual, setMembroAtual] = useState("Tatiane")
  const [mesAtual, setMesAtual] = useState("Junho")
  const [formData, setFormData] = useState({
    media_individual: '',
    media_suprema: '',
    media_equipe: '',
    reincidencia: '',
    absenteismo: '',
    engajamento: '',
    data_engajamento: '',
    sugestao: ''
  })
  const [pontosMembro, setPontosMembro] = useState(0)
  const [usuarioLogado, setUsuarioLogado] = useState('')
  const [dataCriacao, setDataCriacao] = useState('')
  const [cardsData, setCardsData] = useState({
    posicao: '-',
    pontos: 0,
    totalEquipes: 0,
    diffPrimeiro: 0,
    lider: '-'
  })
  const [showPopup, setShowPopup] = useState(false)
  const [popupMessage, setPopupMessage] = useState('')
  const [popupPontos, setPopupPontos] = useState(0)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [pontosParaDescontar, setPontosParaDescontar] = useState('')
  const [pontosParaAdicionar, setPontosParaAdicionar] = useState('')
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const usuario = localStorage.getItem("usuario_logado") || localStorage.getItem("usuario") || "Admin"
    setUsuarioLogado(usuario)
  }, [])

  useEffect(() => {
    if (isFirstLoad) {
      setFormData({
        media_individual: '',
        media_suprema: '',
        media_equipe: '',
        reincidencia: '',
        absenteismo: '',
        engajamento: '',
        data_engajamento: '',
        sugestao: ''
      })
      setPontosMembro(0)
      setDataCriacao('')
      setIsFirstLoad(false)
      console.log('🧹 Admin carregado - todos os inputs foram limpos!')
    }
  }, [isFirstLoad])

  useEffect(() => {
    if (!isFirstLoad) {
      carregarDados()
    }
    atualizarCards()
  }, [membroAtual, equipeAtual, mesAtual, isFirstLoad])

  const meses = ["Junho", "Julho", "Agosto"]
  const mobile = width <= 768
  const tablet = width <= 1024 && width > 768
  const verySmall = width <= 380

  const getLimitesData = () => {
    const limites = {
      'Junho': { min: '2026-06-01', max: '2026-06-30', mesNumero: 5, ano: 2026, nome: 'Junho' },
      'Julho': { min: '2026-07-01', max: '2026-07-31', mesNumero: 6, ano: 2026, nome: 'Julho' },
      'Agosto': { min: '2026-08-01', max: '2026-08-31', mesNumero: 7, ano: 2026, nome: 'Agosto' }
    }
    return limites[mesAtual] || { min: '', max: '', mesNumero: null, ano: null, nome: mesAtual }
  }

  const validarDataNoPeriodo = () => {
    if (!formData.data_engajamento) return { valido: true }
    
    const data = new Date(formData.data_engajamento)
    const ano = data.getFullYear()
    const mes = data.getMonth()
    
    const periodo = getLimitesData()
    
    if (ano !== periodo.ano) {
      return { 
        valido: false, 
        mensagem: `⚠️ A data de engajamento deve ser no ano ${periodo.ano} (período de ${periodo.nome})` 
      }
    }
    
    if (mes !== periodo.mesNumero) {
      const mesesNomes = { 5: 'Junho', 6: 'Julho', 7: 'Agosto' }
      const mesCorreto = mesesNomes[periodo.mesNumero]
      return { 
        valido: false, 
        mensagem: `⚠️ A data de engajamento deve ser em ${mesCorreto}/2026 (você está avaliando ${mesAtual})` 
      }
    }
    
    return { valido: true }
  }

  const validarCamposObrigatorios = () => {
    const camposObrigatorios = [
      { campo: 'media_individual', nome: 'Média Individual SX' },
      { campo: 'media_suprema', nome: 'Média Suprema' },
      { campo: 'media_equipe', nome: 'Média Equipe' },
      { campo: 'reincidencia', nome: 'Reincidência' },
      { campo: 'absenteismo', nome: 'Absenteísmo' },
      { campo: 'engajamento', nome: 'Engajamento' }
    ]

    for (const item of camposObrigatorios) {
      const valor = formData[item.campo]
      if (valor === '' || valor === null || valor === undefined) {
        return { valido: false, mensagem: `⚠️ Campo obrigatório: ${item.nome}` }
      }
    }

    if (Number(formData.engajamento) === 1) {
      if (!formData.data_engajamento || formData.data_engajamento === '') {
        return { 
          valido: false, 
          mensagem: `⚠️ Engajamento marcado como SIM.\nInforme a DATA ENGAJAMENTO (última atividade de engajamento)` 
        }
      }
      
      const validacaoData = validarDataNoPeriodo()
      if (!validacaoData.valido) {
        return validacaoData
      }
    }

    return { valido: true, mensagem: '' }
  }

  // ✅ NOVA FUNÇÃO: Calcular médias da equipe
  const calcularMediasEquipe = async (equipeNome, mes) => {
    const { data, error } = await supabase
      .from("avaliacoes")
      .select("absenteismo, reincidencia, engajamento, media_equipe")
      .eq("equipe_nome", equipeNome)
      .eq("mes", mes)

    if (error || !data || data.length === 0) {
      return {
        mediaAbsenteismo: 0,
        mediaReincidencia: 0,
        mediaEngajamento: 0,
        mediaEquipeManual: 0,
        totalMembros: 0
      }
    }

    const totalMembros = data.length
    
    const somaAbsenteismo = data.reduce((acc, curr) => acc + (Number(curr.absenteismo) || 0), 0)
    const somaReincidencia = data.reduce((acc, curr) => acc + (Number(curr.reincidencia) || 0), 0)
    const somaEngajamento = data.reduce((acc, curr) => acc + (Number(curr.engajamento) || 0), 0)
    
    const mediaEquipeManual = data[0]?.media_equipe || 0

    console.log(`📊 MÉDIAS DA EQUIPE ${equipeNome} (${totalMembros} membros):`)
    console.log(`   Soma Absenteísmo: ${somaAbsenteismo} → Média: ${(somaAbsenteismo / totalMembros).toFixed(2)}`)
    console.log(`   Soma Reincidência: ${somaReincidencia} → Média: ${(somaReincidencia / totalMembros).toFixed(2)}`)
    console.log(`   Soma Engajamento: ${somaEngajamento} → Média: ${(somaEngajamento / totalMembros).toFixed(2)}`)

    return {
      mediaAbsenteismo: somaAbsenteismo / totalMembros,
      mediaReincidencia: somaReincidencia / totalMembros,
      mediaEngajamento: somaEngajamento / totalMembros,
      mediaEquipeManual: Number(mediaEquipeManual),
      totalMembros
    }
  }

  // ✅ NOVA FUNÇÃO: Calcular pontos baseado nas MÉDIAS DA EQUIPE
  const calcularPontosPorEquipe = async (equipeNome, mes, sugestao) => {
    const medias = await calcularMediasEquipe(equipeNome, mes)
    let pontos = 0

    console.log(`\n🎯 CALCULANDO PONTOS PARA ${equipeNome}:`)
    console.log(`   Média Equipe Manual: ${medias.mediaEquipeManual}`)
    console.log(`   Média Reincidência: ${medias.mediaReincidencia.toFixed(2)}`)
    console.log(`   Média Absenteísmo: ${medias.mediaAbsenteismo.toFixed(2)}`)
    console.log(`   Média Engajamento: ${medias.mediaEngajamento.toFixed(2)}`)

    if (medias.mediaReincidencia === 0) {
      pontos += 20
      console.log(`   ✅ Reincidência média = 0 → +20 pontos`)
    } else if (medias.mediaReincidencia <= 0.5) {
      pontos += 10
      console.log(`   ⚠️ Reincidência média ≤ 0.5 → +10 pontos`)
    } else {
      console.log(`   ❌ Reincidência média > 0.5 → 0 pontos`)
    }

    if (medias.mediaEquipeManual >= 95) {
      pontos += 40
      console.log(`   ✅ Média Equipe ≥ 95 → +40 pontos`)
    } else if (medias.mediaEquipeManual >= 94) {
      pontos += 35
      console.log(`   ✅ Média Equipe ≥ 94 → +35 pontos`)
    } else if (medias.mediaEquipeManual >= 93) {
      pontos += 30
      console.log(`   ✅ Média Equipe ≥ 93 → +30 pontos`)
    } else {
      console.log(`   ❌ Média Equipe < 93 → 0 pontos`)
    }

    if (medias.mediaAbsenteismo === 0) {
      pontos += 20
      console.log(`   ✅ Absenteísmo médio = 0 → +20 pontos`)
    } else if (medias.mediaAbsenteismo <= 0.5) {
      pontos += 15
      console.log(`   ⚠️ Absenteísmo médio ≤ 0.5 → +15 pontos`)
    } else if (medias.mediaAbsenteismo <= 1) {
      pontos += 10
      console.log(`   ⚠️ Absenteísmo médio ≤ 1 → +10 pontos`)
    } else {
      console.log(`   ❌ Absenteísmo médio > 1 → 0 pontos`)
    }

    if (medias.mediaEngajamento >= 0.7) {
      pontos += 10
      console.log(`   ✅ Engajamento médio ≥ 0.7 → +10 pontos`)
    } else if (medias.mediaEngajamento >= 0.4) {
      pontos += 5
      console.log(`   ⚠️ Engajamento médio ≥ 0.4 → +5 pontos`)
    } else {
      console.log(`   ❌ Engajamento médio < 0.4 → 0 pontos`)
    }

    if (sugestao && sugestao.trim() !== "") {
      pontos += 10
      console.log(`   💡 Sugestão preenchida → +10 pontos`)
    }

    console.log(`   🏆 TOTAL: ${pontos} pontos\n`)
    return pontos
  }

  const atualizarCards = async () => {
    const { data, error } = await supabase
      .from("avaliacoes")
      .select("equipe_nome, sugestao, mes")
      .eq("mes", mesAtual)

    if (error) {
      console.error("Erro cards:", error)
      return
    }

    const equipesMap = new Map()
    
    for (const item of data) {
      const equipe = item.equipe_nome
      if (!equipesMap.has(equipe)) {
        equipesMap.set(equipe, [])
      }
      equipesMap.get(equipe).push(item)
    }

    const pontuacoesEquipes = []
    
    for (const [equipe, membros] of equipesMap) {
      const temSugestao = membros.some(m => m.sugestao && m.sugestao.trim() !== "")
      const pontosEquipe = await calcularPontosPorEquipe(equipe, mesAtual, temSugestao ? "tem sugestão" : "")
      
      pontuacoesEquipes.push({
        equipe,
        pontos: pontosEquipe
      })
    }

    const ranking = pontuacoesEquipes.sort((a, b) => b.pontos - a.pontos)
    
    const atualIndex = ranking.findIndex(r => r.equipe === equipeAtual)
    const atual = ranking[atualIndex] || { equipe: equipeAtual, pontos: 0 }
    const lider = ranking[0] || { equipe: "-", pontos: 0 }
    const diff = lider.pontos - atual.pontos

    setCardsData({
      posicao: atualIndex >= 0 ? `${atualIndex + 1}°` : '-',
      pontos: atual.pontos,
      totalEquipes: ranking.length,
      diffPrimeiro: diff <= 0 ? "Líder" : `+${diff}`,
      lider: lider.equipe
    })
  }

  const getHorarioBrasilia = () => {
    const agora = new Date()
    const offsetBrasilia = -3
    const utc = agora.getTime() + (agora.getTimezoneOffset() * 60000)
    const dataBrasilia = new Date(utc + (3600000 * offsetBrasilia))
    
    const ano = dataBrasilia.getFullYear()
    const mes = String(dataBrasilia.getMonth() + 1).padStart(2, '0')
    const dia = String(dataBrasilia.getDate()).padStart(2, '0')
    const hora = String(dataBrasilia.getHours()).padStart(2, '0')
    const minuto = String(dataBrasilia.getMinutes()).padStart(2, '0')
    const segundo = String(dataBrasilia.getSeconds()).padStart(2, '0')
    
    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`
  }

  const formatarDataBrasilia = (dataISO) => {
    if (!dataISO) return ''
    let data
    if (typeof dataISO === 'string' && dataISO.includes(' ')) {
      data = new Date(dataISO.replace(' ', 'T') + '-03:00')
    } else {
      data = new Date(dataISO)
    }
    return data.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // ✅ FUNÇÃO PARA DESCONTAR PONTOS GERAIS DO MEMBRO
  const descontarPontosGerais = async () => {
    const pontosDesconto = Number(pontosParaDescontar)
    if (!pontosParaDescontar || isNaN(pontosDesconto) || pontosDesconto <= 0) {
      setPopupMessage('⚠️ Informe quantos pontos deseja descontar (valor positivo)')
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const { data: registroAtual, error: buscaError } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)
      .maybeSingle()

    if (buscaError || !registroAtual) {
      setPopupMessage('⚠️ Nenhum registro encontrado para descontar pontos!')
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    if (registroAtual.pontos < pontosDesconto) {
      setPopupMessage(`⚠️ Pontuação insuficiente!\nAtual: ${registroAtual.pontos} pts\nDesconto: ${pontosDesconto} pts`)
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const novaPontuacao = registroAtual.pontos - pontosDesconto

    const historicoPayload = {
      membro_nome: registroAtual.membro_nome,
      equipe_nome: registroAtual.equipe_nome,
      mes: registroAtual.mes,
      media_individual: registroAtual.media_individual,
      media_suprema: registroAtual.media_suprema,
      media_equipe: registroAtual.media_equipe,
      reincidencia: registroAtual.reincidencia,
      absenteismo: registroAtual.absenteismo,
      engajamento: registroAtual.engajamento,
      data_engajamento: registroAtual.data_engajamento,
      sugestao: registroAtual.sugestao,
      pontos: registroAtual.pontos,
      usuario_responsavel: registroAtual.usuario_responsavel,
      created_at: registroAtual.created_at,
      alterado_em: getHorarioBrasilia()
    }

    const { error: historicoError } = await supabase
      .from("avaliacoes_historico")
      .insert([historicoPayload])

    if (historicoError) {
      console.error('❌ Erro histórico:', historicoError)
    }

    const { error: updateError } = await supabase
      .from("avaliacoes")
      .update({
        pontos: novaPontuacao,
        usuario_responsavel: usuarioLogado
      })
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)

    if (updateError) {
      setPopupMessage(`❌ Erro ao descontar: ${updateError.message}`)
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    await atualizarCards()
    await carregarDados()
    setPontosParaDescontar('')

    setPopupMessage(`✅ ${pontosDesconto} pontos descontados!\nNova pontuação: ${novaPontuacao} pts`)
    setPopupPontos(-pontosDesconto)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 4000)
  }

  // ✅ FUNÇÃO PARA ADICIONAR PONTOS GERAIS DO MEMBRO
  const adicionarPontosGerais = async () => {
    const pontosAdicionar = Number(pontosParaAdicionar)
    if (!pontosParaAdicionar || isNaN(pontosAdicionar) || pontosAdicionar <= 0) {
      setPopupMessage('⚠️ Informe quantos pontos deseja adicionar (valor positivo)')
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const { data: registroAtual, error: buscaError } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)
      .maybeSingle()

    if (buscaError || !registroAtual) {
      setPopupMessage('⚠️ Nenhum registro encontrado para adicionar pontos!')
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const novaPontuacao = registroAtual.pontos + pontosAdicionar

    const historicoPayload = {
      membro_nome: registroAtual.membro_nome,
      equipe_nome: registroAtual.equipe_nome,
      mes: registroAtual.mes,
      media_individual: registroAtual.media_individual,
      media_suprema: registroAtual.media_suprema,
      media_equipe: registroAtual.media_equipe,
      reincidencia: registroAtual.reincidencia,
      absenteismo: registroAtual.absenteismo,
      engajamento: registroAtual.engajamento,
      data_engajamento: registroAtual.data_engajamento,
      sugestao: registroAtual.sugestao,
      pontos: registroAtual.pontos,
      usuario_responsavel: registroAtual.usuario_responsavel,
      created_at: registroAtual.created_at,
      alterado_em: getHorarioBrasilia()
    }

    const { error: historicoError } = await supabase
      .from("avaliacoes_historico")
      .insert([historicoPayload])

    if (historicoError) {
      console.error('❌ Erro histórico:', historicoError)
    }

    const { error: updateError } = await supabase
      .from("avaliacoes")
      .update({
        pontos: novaPontuacao,
        usuario_responsavel: usuarioLogado
      })
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)

    if (updateError) {
      setPopupMessage(`❌ Erro ao adicionar: ${updateError.message}`)
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    await atualizarCards()
    await carregarDados()
    setPontosParaAdicionar('')

    setPopupMessage(`✅ ${pontosAdicionar} pontos adicionados!\nNova pontuação: ${novaPontuacao} pts`)
    setPopupPontos(pontosAdicionar)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 4000)
  }

  // Salvar dados
  const salvarDados = async () => {
    const validacao = validarCamposObrigatorios()
    if (!validacao.valido) {
      setPopupMessage(validacao.mensagem)
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const pontos = await calcularPontosPorEquipe(equipeAtual, mesAtual, formData.sugestao)
    const agoraBrasilia = getHorarioBrasilia()
    
    console.log('🔍 ===== DEBUG =====')
    console.log('📅 Horário:', agoraBrasilia)
    console.log('👤 Usuário:', usuarioLogado)
    console.log('👤 Membro:', membroAtual)
    console.log('📅 Mês:', mesAtual)
    console.log('💰 Pontos calculados (baseado na equipe):', pontos)

    const { data: atual } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)
      .maybeSingle()

    if (atual) {
      console.log('📝 Salvando histórico')
      
      const historicoPayload = {
        membro_nome: atual.membro_nome,
        equipe_nome: atual.equipe_nome,
        mes: atual.mes,
        media_individual: atual.media_individual,
        media_suprema: atual.media_suprema,
        media_equipe: atual.media_equipe,
        reincidencia: atual.reincidencia,
        absenteismo: atual.absenteismo,
        engajamento: atual.engajamento,
        data_engajamento: atual.data_engajamento,
        sugestao: atual.sugestao,
        pontos: atual.pontos,
        usuario_responsavel: atual.usuario_responsavel,
        created_at: atual.created_at,
        alterado_em: agoraBrasilia
      }
      
      const { error: historicoError } = await supabase
        .from("avaliacoes_historico")
        .insert([historicoPayload])
      
      if (historicoError) {
        console.error('❌ Erro histórico:', historicoError)
      } else {
        console.log('✅ Histórico salvo')
      }
    }

    const dataEngajamentoFinal = Number(formData.engajamento) === 1 
      ? formData.data_engajamento 
      : null

    const payload = {
      membro_nome: membroAtual,
      equipe_nome: equipeAtual,
      mes: mesAtual,
      media_individual: Number(formData.media_individual) || 0,
      media_suprema: Number(formData.media_suprema) || 0,
      media_equipe: Number(formData.media_equipe) || 0,
      reincidencia: Number(formData.reincidencia) || 0,
      absenteismo: Number(formData.absenteismo) || 0,
      engajamento: Number(formData.engajamento) || 0,
      data_engajamento: dataEngajamentoFinal,
      sugestao: formData.sugestao || '',
      pontos: pontos,
      usuario_responsavel: usuarioLogado
    }

    if (!atual) {
      payload.created_at = agoraBrasilia
    }

    console.log('📤 Payload final:', payload)

    const { error } = await supabase
      .from("avaliacoes")
      .upsert([payload], { onConflict: "membro_nome,equipe_nome,mes" })

    if (error) {
      console.error('❌ Erro:', error)
      setPopupMessage(`Erro: ${error.message}`)
      setPopupPontos(0)
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    console.log('✅ Salvo com sucesso!')

    setPontosMembro(pontos)
    await atualizarCards()
    await carregarDados()
    
    setPopupMessage(`✅ Avaliação salva!\n📅 ${agoraBrasilia}`)
    setPopupPontos(pontos)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 4000)
  }

  // Carregar dados do membro
  const carregarDados = async () => {
    const { data } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("membro_nome", membroAtual)
      .eq("equipe_nome", equipeAtual)
      .eq("mes", mesAtual)
      .maybeSingle()

    if (!data) {
      setFormData({
        media_individual: '',
        media_suprema: '',
        media_equipe: '',
        reincidencia: '',
        absenteismo: '',
        engajamento: '',
        data_engajamento: '',
        sugestao: ''
      })
      setPontosMembro(0)
      setDataCriacao('')
      return
    }

    setFormData({
      media_individual: data.media_individual || '',
      media_suprema: data.media_suprema || '',
      media_equipe: data.media_equipe || '',
      reincidencia: data.reincidencia || '',
      absenteismo: data.absenteismo || '',
      engajamento: data.engajamento || '',
      data_engajamento: data.data_engajamento || '',
      sugestao: data.sugestao || ''
    })
    setPontosMembro(data.pontos || 0)
    
    if (data.created_at) {
      setDataCriacao(formatarDataBrasilia(data.created_at))
    }
  }

  // Exportar Excel
  const exportarExcel = async () => {
    const { data, error } = await supabase
      .from("avaliacoes")
      .select("*")
      .eq("mes", mesAtual)

    if (error) {
      setPopupMessage("Erro ao buscar dados")
      setShowPopup(true)
      setTimeout(() => setShowPopup(false), 3000)
      return
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Avaliacoes")
    XLSX.writeFile(workbook, `avaliacoes_${mesAtual}.xlsx`)
    
    setPopupMessage(`📜 Exportado!`)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 3000)
  }

  const limparInputs = () => {
    setFormData({
      media_individual: '',
      media_suprema: '',
      media_equipe: '',
      reincidencia: '',
      absenteismo: '',
      engajamento: '',
      data_engajamento: '',
      sugestao: ''
    })
    setPontosMembro(0)
    setDataCriacao('')
    setPontosParaDescontar('')
    setPontosParaAdicionar('')
    setPopupMessage('🧹 Todos os campos foram limpos!')
    setPopupPontos(0)
    setShowPopup(true)
    setTimeout(() => setShowPopup(false), 2000)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (name === 'engajamento' && Number(value) === 0) {
      setFormData({ ...formData, [name]: value, data_engajamento: '' })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const isDataEngajamentoObrigatoria = Number(formData.engajamento) === 1
  const limitesData = getLimitesData()

  return (
    <div style={{
      background: '#000000',
      minHeight: '100vh',
      padding: mobile ? '1rem' : '2rem',
      position: 'relative'
    }}>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(1px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {showPopup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(26, 26, 46, 0.95)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${popupPontos > 0 ? '#D4A83A' : popupPontos < 0 ? '#E85068' : '#4acc50'}`,
            padding: mobile ? '1.5rem 1.5rem' : '2rem 3rem',
            minWidth: mobile ? '280px' : '320px',
            maxWidth: '90vw',
            textAlign: 'center',
            borderRadius: '16px'
          }}>
            <div style={{
              fontSize: mobile ? '2.5rem' : '3rem',
              marginBottom: '1rem',
              color: popupPontos > 0 ? '#F5D488' : popupPontos < 0 ? '#E85068' : '#4acc50'
            }}>
              {popupPontos > 0 ? '⚔️' : popupPontos < 0 ? '💀' : '🧹'}
            </div>
            <h3 style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: mobile ? '1rem' : '1.2rem',
              color: popupPontos > 0 ? '#F5D488' : popupPontos < 0 ? '#E85068' : '#4acc50',
              marginBottom: '1rem'
            }}>
              {popupPontos > 0 ? 'VITÓRIA!' : popupPontos < 0 ? 'PENALIDADE!' : 'ATENÇÃO'}
            </h3>
            <p style={{
              fontFamily: "'IM Fell English', serif",
              fontSize: mobile ? '0.9rem' : '1rem',
              color: '#F5F0E0',
              whiteSpace: 'pre-line'
            }}>
              {popupMessage}
            </p>
            {(popupPontos > 0 && popupMessage.includes('salva')) && (
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                borderTop: '1px solid rgba(212, 175, 90, 0.3)',
                borderBottom: '1px solid rgba(212, 175, 90, 0.3)'
              }}>
                <span style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: mobile ? '1.5rem' : '2rem',
                  background: 'linear-gradient(135deg, #F5D488, #D4A83A)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  +{popupPontos} pts
                </span>
              </div>
            )}
            {(popupPontos > 0 && popupMessage.includes('adicionados')) && (
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                borderTop: '1px solid rgba(74, 158, 110, 0.3)',
                borderBottom: '1px solid rgba(74, 158, 110, 0.3)'
              }}>
                <span style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: mobile ? '1.5rem' : '2rem',
                  color: '#4a9e6e'
                }}>
                  +{popupPontos} pts
                </span>
              </div>
            )}
            {popupPontos < 0 && (
              <div style={{
                marginTop: '1rem',
                padding: '0.5rem',
                borderTop: '1px solid rgba(232, 80, 104, 0.3)',
                borderBottom: '1px solid rgba(232, 80, 104, 0.3)'
              }}>
                <span style={{
                  fontFamily: "'Cinzel Decorative', serif",
                  fontSize: mobile ? '1.5rem' : '2rem',
                  color: '#E85068'
                }}>
                  {popupPontos} pts
                </span>
              </div>
            )}
            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: '1.5rem',
                background: 'rgba(212, 175, 90, 0.2)',
                border: '1px solid rgba(212, 175, 90, 0.6)',
                padding: mobile ? '0.4rem 1.2rem' : '0.5rem 1.5rem',
                fontFamily: "'Cinzel', serif",
                fontSize: mobile ? '0.6rem' : '0.7rem',
                color: '#F5D488',
                cursor: 'pointer',
                borderRadius: '8px'
              }}
            >
              FECHAR
            </button>
          </div>
        </div>
      )}

      <div style={{
        position: 'relative',
        zIndex: 2,
        maxWidth: '1400px',
        margin: '0 auto',
        paddingTop: mobile ? '0.5rem' : '2rem'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: mobile ? '1rem' : '2rem',
          flexWrap: 'wrap',
          gap: mobile ? '0.5rem' : '1rem'
        }}>
          <button
            onClick={() => window.location.href = "/"}
            style={{
              background: 'rgba(26, 26, 46, 0.8)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(212, 175, 90, 0.6)',
              padding: mobile ? '0.4rem 0.8rem' : '0.6rem 1.2rem',
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: mobile ? '0.55rem' : '0.7rem',
              color: '#F5D488',
              cursor: 'pointer',
              borderRadius: '12px'
            }}
          >
            ← VOLTAR
          </button>

          <div style={{
            background: 'rgba(26, 26, 46, 0.8)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(212, 175, 90, 0.4)',
            padding: mobile ? '0.4rem 0.8rem' : '0.6rem 1.2rem',
            borderRadius: '12px',
            fontFamily: "'Cinzel', serif",
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{
              width: mobile ? '6px' : '8px',
              height: mobile ? '6px' : '8px',
              borderRadius: '50%',
              background: '#D4A83A',
              boxShadow: '0 0 8px #D4A83A'
            }} />
            <span style={{ fontSize: mobile ? '0.55rem' : '0.7rem', color: '#F5D488' }}>⚔️ {usuarioLogado}</span>
          </div>
        </div>

        <div style={{
          textAlign: 'center',
          marginBottom: mobile ? '1.5rem' : '3rem',
          paddingBottom: mobile ? '0.5rem' : '1rem',
          borderBottom: '1px solid rgba(212, 175, 90, 0.3)'
        }}>
          <h1 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: mobile ? '1.2rem' : tablet ? '1.6rem' : '2rem',
            fontWeight: 900,
            background: 'linear-gradient(160deg, #FAE8B0 0%, #F5D488 30%, #D4A83A 75%, #FAE8B0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: mobile ? '0.05em' : '0.1em',
            marginBottom: '0.3rem'
          }}>
            ARENA DOS CAMPEÕES
          </h1>
          <div style={{
            fontFamily: "'IM Fell English SC', serif",
            fontSize: mobile ? '0.5rem' : '0.7rem',
            letterSpacing: mobile ? '0.2em' : '0.4em',
            color: '#D4A83A'
          }}>
            AVALIAÇÃO TRIMESTRAL — T2 2026
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: mobile ? '1fr' : tablet ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)',
          gap: mobile ? '0.8rem' : '1.5rem',
          marginBottom: mobile ? '1.5rem' : '2.5rem'
        }}>
          {[
            { label: 'POSIÇÃO ATUAL', value: cardsData.posicao, footer: `de ${cardsData.totalEquipes} equipes ativas` },
            { label: 'PONTUAÇÃO TOTAL', value: cardsData.pontos, footer: 'pontuação acumulada' },
            { label: 'PARA O 1º LUGAR', value: cardsData.diffPrimeiro, footer: `Equipe ${cardsData.lider}` }
          ].map((card, idx) => (
            <div key={idx} style={{
              background: 'rgba(18, 18, 32, 0.7)',
              backdropFilter: 'blur(4px)',
              border: '1px solid rgba(212, 175, 90, 0.4)',
              padding: mobile ? '1rem' : '1.5rem',
              borderRadius: mobile ? '12px' : '20px'
            }}>
              <h4 style={{
                fontFamily: "'IM Fell English SC', serif",
                fontSize: mobile ? '0.5rem' : '0.65rem',
                color: '#D4A83A',
                marginBottom: mobile ? '0.5rem' : '1rem'
              }}>
                {card.label}
              </h4>
              <div style={{
                fontFamily: "'Cinzel Decorative', serif",
                fontSize: mobile ? '2rem' : tablet ? '2.5rem' : '3rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #FAE8B0, #D4A83A)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                {card.value}
              </div>
              <div style={{
                marginTop: mobile ? '0.4rem' : '0.8rem',
                fontFamily: "'IM Fell English', serif",
                fontSize: mobile ? '0.55rem' : '0.7rem',
                color: '#A89870'
              }}>
                {card.footer}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: mobile ? '0.5rem' : '1rem',
          marginBottom: mobile ? '1rem' : '2rem',
          justifyContent: 'center'
        }}>
          {meses.map(mes => (
            <button
              key={mes}
              onClick={() => setMesAtual(mes)}
              style={{
                background: mesAtual === mes ? 'linear-gradient(135deg, #D4A83A, #F5D488)' : 'rgba(26, 26, 46, 0.5)',
                border: `1px solid ${mesAtual === mes ? '#F5D488' : 'rgba(212, 175, 90, 0.3)'}`,
                color: mesAtual === mes ? '#1a1410' : '#D4A83A',
                padding: mobile ? '0.4rem 0.8rem' : '0.7rem 1.8rem',
                fontFamily: "'Cinzel', serif",
                fontSize: mobile ? '0.55rem' : '0.7rem',
                cursor: 'pointer',
                borderRadius: '12px',
                flex: mobile ? '1' : 'auto',
                minWidth: mobile ? '60px' : 'auto',
                textAlign: 'center'
              }}
            >
              {mes}
            </button>
          ))}
          <button
            onClick={exportarExcel}
            style={{
              background: 'linear-gradient(135deg, #1e831d, #24e942)',
              color: '#1a1410',
              padding: mobile ? '0.4rem 0.8rem' : '0.7rem 1.8rem',
              fontFamily: "'Cinzel', serif",
              fontSize: mobile ? '0.55rem' : '0.7rem',
              cursor: 'pointer',
              borderRadius: '12px',
              flex: mobile ? '1' : 'auto',
              minWidth: mobile ? '60px' : 'auto',
              textAlign: 'center'
            }}
          >
            📜 EXPORTAR
          </button>
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: mobile ? '0.4rem' : '1rem',
          marginBottom: mobile ? '1rem' : '2rem',
          justifyContent: 'center'
        }}>
          {Object.keys(equipesData).map(nome => (
            <button
              key={nome}
              onClick={() => {
                setEquipeAtual(nome)
                const primeiroMembro = equipesData[nome].membros[0]
                setMembroAtual(primeiroMembro)
              }}
              style={{
                background: equipeAtual === nome ? 'linear-gradient(135deg, #D4A83A, #F5D488)' : 'rgba(26, 26, 46, 0.5)',
                border: `1px solid ${equipeAtual === nome ? '#F5D488' : 'rgba(212, 175, 90, 0.3)'}`,
                color: equipeAtual === nome ? '#1a1410' : '#D4A83A',
                padding: mobile ? '0.3rem 0.6rem' : '0.7rem 1.5rem',
                fontFamily: "'Cinzel', serif",
                fontSize: mobile ? '0.5rem' : '0.7rem',
                cursor: 'pointer',
                borderRadius: '12px',
                flex: mobile ? '1' : 'auto',
                minWidth: mobile ? '70px' : 'auto',
                textAlign: 'center',
                wordBreak: 'break-word'
              }}
            >
              {mobile && nome.length > 12 ? nome.substring(0, 10) + '…' : nome}
            </button>
          ))}
        </div>

        <div style={{
          background: 'rgba(14, 14, 27, 0.6)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(212, 175, 90, 0.4)',
          padding: mobile ? '1rem' : tablet ? '1.5rem' : '2rem',
          borderRadius: mobile ? '16px' : '24px'
        }}>
          <h2 style={{
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: mobile ? '0.9rem' : '1.2rem',
            color: '#F5D488',
            textAlign: 'center'
          }}>
            {equipeAtual}
          </h2>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: mobile ? '0.4rem' : '0.8rem',
            justifyContent: 'center',
            marginBottom: mobile ? '1rem' : '2rem',
            marginTop: mobile ? '0.5rem' : '1rem'
          }}>
            {equipesData[equipeAtual]?.membros.map(membro => (
              <button
                key={membro}
                onClick={() => setMembroAtual(membro)}
                style={{
                  background: membroAtual === membro ? 'linear-gradient(135deg, #D4A83A, #F5D488)' : 'rgba(26, 26, 46, 0.4)',
                  border: `1px solid ${membroAtual === membro ? '#F5D488' : 'rgba(212, 175, 90, 0.3)'}`,
                  color: membroAtual === membro ? '#1a1410' : '#D4A83A',
                  padding: mobile ? '0.3rem 0.6rem' : '0.6rem 1.2rem',
                  fontFamily: "'Cinzel', serif",
                  fontSize: mobile ? '0.55rem' : '0.7rem',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  flex: mobile ? '1' : 'auto',
                  minWidth: mobile ? '60px' : 'auto',
                  textAlign: 'center'
                }}
              >
                {membro}
              </button>
            ))}
          </div>

          <h3 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: mobile ? '0.8rem' : '1rem',
            color: '#F5D488',
            textAlign: 'center',
            borderBottom: '1px solid rgba(212, 175, 90, 0.3)',
            paddingBottom: '0.5rem',
            marginBottom: mobile ? '1rem' : '1.5rem'
          }}>
            ⚔️ {membroAtual} ⚔️
          </h3>

          {dataCriacao && (
            <div style={{
              textAlign: 'center',
              marginBottom: '1rem',
              padding: '0.3rem',
              background: 'rgba(212, 175, 90, 0.1)',
              borderRadius: '8px',
              fontSize: mobile ? '0.5rem' : '0.65rem',
              color: '#A89870'
            }}>
              📅 Registro criado em: {dataCriacao}
            </div>
          )}

          <div style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : tablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: mobile ? '0.8rem' : '1.5rem'
          }}>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>MÉDIA INDIVIDUAL SX *</label>
              <input type="number" step="any" name="media_individual" value={formData.media_individual} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
            </div>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>MÉDIA SUPREMA *</label>
              <input type="number" step="any" name="media_suprema" value={formData.media_suprema} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
            </div>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>MÉDIA EQUIPE *</label>
              <input type="number" step="any" name="media_equipe" value={formData.media_equipe} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
              <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870' }}>≥95(40) 94(35) 93(30) &lt;93(0)</small>
            </div>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>REINCIDÊNCIA *</label>
              <input type="number" step="any" name="reincidencia" value={formData.reincidencia} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
              <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870' }}>0(20) 1(10) ≥2(0)</small>
            </div>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>ABSENTEÍSMO *</label>
              <input type="number" step="any" name="absenteismo" value={formData.absenteismo} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
              <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870' }}>0(20) 1(15) 2(10) ≥3(0)</small>
            </div>
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>ENGAJAMENTO *</label>
              <input type="number" step="1" name="engajamento" min="0" max="1" value={formData.engajamento} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', fontSize: mobile ? '0.8rem' : '1rem' }} />
              <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870' }}>1(10) 0(0)</small>
            </div>

            {/* DATA ENGAJAMENTO */}
            <div style={{ gridColumn: mobile ? '1' : tablet ? '1 / -1' : '1 / -1' }}>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>
                DATA ENGAJAMENTO {isDataEngajamentoObrigatoria && <span style={{ color: '#E85068' }}>*</span>}
              </label>
              <input 
                type="date" 
                name="data_engajamento" 
                value={formData.data_engajamento} 
                onChange={handleInputChange}
                min={limitesData.min}
                max={limitesData.max}
                disabled={Number(formData.engajamento) === 0}
                style={{ 
                  width: '100%',
                  background: 'rgba(26, 26, 46, 0.5)', 
                  border: isDataEngajamentoObrigatoria && !formData.data_engajamento 
                    ? '1px solid #E85068' 
                    : '1px solid rgba(212, 175, 90, 0.3)', 
                  color: Number(formData.engajamento) === 0 ? '#A89870' : '#F5F0E0',
                  padding: mobile ? '0.5rem' : '0.8rem', 
                  borderRadius: '10px',
                  cursor: Number(formData.engajamento) === 0 ? 'not-allowed' : 'pointer',
                  fontSize: mobile ? '0.8rem' : '1rem'
                }} 
              />
              {Number(formData.engajamento) === 0 && (
                <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870', display: 'block', marginTop: '4px' }}>
                  ℹ️ Campo desabilitado porque Engajamento = NÃO
                </small>
              )}
              {isDataEngajamentoObrigatoria && !formData.data_engajamento && (
                <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#E85068', display: 'block', marginTop: '4px' }}>
                  ⚠️ Obrigatório quando Engajamento = SIM
                </small>
              )}
              {isDataEngajamentoObrigatoria && formData.data_engajamento && (
                <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#4a9e6e', display: 'block', marginTop: '4px' }}>
                  ✅ Data dentro do período de {mesAtual}/2026
                </small>
              )}
            </div>

            {/* SUGESTÃO DE MELHORIA COM BOTÃO LIMPAR CAMPOS ABAIXO */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.65rem', color: '#D4A83A' }}>SUGESTÃO DE MELHORIA</label>
              <textarea name="sugestao" rows={mobile ? 2 : 3} value={formData.sugestao} onChange={handleInputChange} style={{ width: '100%', background: 'rgba(26, 26, 46, 0.5)', border: '1px solid rgba(212, 175, 90, 0.3)', color: '#F5F0E0', padding: mobile ? '0.5rem' : '0.8rem', borderRadius: '10px', resize: 'vertical', fontSize: mobile ? '0.8rem' : '1rem' }} />
              <small style={{ fontSize: mobile ? '0.45rem' : '0.6rem', color: '#A89870' }}>Preenchida ganha +10 pontos</small>
              
              {/* BOTÃO LIMPAR CAMPOS - AGORA AQUI */}
              <button
                onClick={limparInputs}
                style={{
                  width: '100%',
                  marginTop: '0.8rem',
                  background: 'rgba(232, 80, 104, 0.3)',
                  border: '1px solid rgba(232, 80, 104, 0.4)',
                  padding: mobile ? '0.6rem' : '0.8rem',
                  fontFamily: "'Cinzel', serif",
                  fontSize: mobile ? '0.55rem' : '0.7rem',
                  color: '#f5d48a',
                  cursor: 'pointer',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(232, 80, 104, 0.5)'
                  e.target.style.borderColor = 'rgba(232, 80, 104, 0.7)'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(232, 80, 104, 0.3)'
                  e.target.style.borderColor = 'rgba(232, 80, 104, 0.4)'
                }}
              >
                🧹 LIMPAR CAMPOS
              </button>
            </div>
          </div>

          <button
            onClick={salvarDados}
            style={{
              width: '100%',
              marginTop: mobile ? '1rem' : '2rem',
              background: 'linear-gradient(135deg, #D4A83A, #F5D488)',
              padding: mobile ? '0.7rem' : '1rem',
              fontFamily: "'Cinzel', serif",
              fontSize: mobile ? '0.65rem' : '0.8rem',
              letterSpacing: mobile ? '0.15em' : '0.3em',
              color: '#1a1410',
              fontWeight: 'bold',
              cursor: 'pointer',
              borderRadius: '12px',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.02)'
              e.target.style.boxShadow = '0 8px 30px rgba(212, 175, 90, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)'
              e.target.style.boxShadow = 'none'
            }}
          >
            SALVAR AVALIAÇÃO
          </button>

          {/* SEÇÃO DE ADICIONAR E DESCONTAR PONTOS - DEPOIS DO BOTÃO SALVAR */}
          <div style={{
            marginTop: mobile ? '1rem' : '1.5rem',
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
            gap: mobile ? '0.8rem' : '1rem',
            background: 'rgba(26, 26, 46, 0.3)',
            border: '1px solid rgba(212, 175, 90, 0.2)',
            padding: mobile ? '0.8rem' : '1rem',
            borderRadius: '16px'
          }}>
            {/* DESCONTAR PONTOS */}
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.6rem', color: '#E85068', display: 'block', marginBottom: '0.3rem' }}>
                💀 DESCONTAR PONTOS
              </label>
              <div style={{
                display: 'flex',
                gap: '0.3rem',
                alignItems: 'center'
              }}>
                <input
                  type="number"
                  value={pontosParaDescontar}
                  onChange={(e) => setPontosParaDescontar(e.target.value)}
                  min="1"
                  style={{
                    flex: 1,
                    background: 'rgba(26, 26, 46, 0.5)',
                    border: '1px solid rgba(232, 80, 104, 0.5)',
                    color: '#F5F0E0',
                    padding: mobile ? '0.5rem' : '0.7rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: mobile ? '0.7rem' : '0.9rem'
                  }}
                />
                <button
                  onClick={descontarPontosGerais}
                  title="Descontar pontos gerais do membro"
                  style={{
                    background: '#E85068',
                    border: '1px solid #E85068',
                    color: '#FFFFFF',
                    padding: mobile ? '0.5rem 0.8rem' : '0.7rem 1.2rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: "'Cinzel', serif",
                    fontSize: mobile ? '0.55rem' : '0.7rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#c0392b'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#E85068'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  {mobile ? '💀' : 'DESCONTAR'}
                </button>
              </div>
              {pontosParaDescontar && Number(pontosParaDescontar) > 0 && (
                <small style={{ fontSize: mobile ? '0.4rem' : '0.80rem', color: '#E85068', display: 'block', marginTop: '4px' }}>
                  ⚠️ Descontará {pontosParaDescontar} pontos
                </small>
              )}
            </div>

            {/* ADICIONAR PONTOS */}
            <div>
              <label style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.6rem', color: '#4a9e6e', display: 'block', marginBottom: '0.3rem' }}>
                ⭐ ADICIONAR PONTOS
              </label>
              <div style={{
                display: 'flex',
                gap: '0.3rem',
                alignItems: 'center'
              }}>
                <input
                  type="number"
                  placeholder="quantos pts?"
                  value={pontosParaAdicionar}
                  onChange={(e) => setPontosParaAdicionar(e.target.value)}
                  min="1"
                  style={{
                    flex: 1,
                    background: 'rgba(26, 26, 46, 0.5)',
                    border: '1px solid rgba(74, 158, 110, 0.5)',
                    color: '#F5F0E0',
                    padding: mobile ? '0.5rem' : '0.7rem',
                    borderRadius: '10px',
                    textAlign: 'center',
                    fontSize: mobile ? '0.7rem' : '0.9rem'
                  }}
                />
                <button
                  onClick={adicionarPontosGerais}
                  title="Adicionar pontos gerais ao membro"
                  style={{
                    background: '#2d7a3b',
                    border: '1px solid #4a9e6e',
                    color: '#FFFFFF',
                    padding: mobile ? '0.5rem 0.8rem' : '0.7rem 1.2rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontFamily: "'Cinzel', serif",
                    fontSize: mobile ? '0.55rem' : '0.7rem',
                    fontWeight: 'bold',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1e6b2e'
                    e.target.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2d7a3b'
                    e.target.style.transform = 'scale(1)'
                  }}
                >
                  {mobile ? '⭐' : 'ADICIONAR'}
                </button>
              </div>
              {pontosParaAdicionar && Number(pontosParaAdicionar) > 0 && (
                <small style={{ fontSize: mobile ? '0.4rem' : '0.55rem', color: '#4a9e6e', display: 'block', marginTop: '4px' }}>
                  ✨ Adicionará {pontosParaAdicionar} pontos
                </small>
              )}
            </div>
          </div>

          <div style={{
            marginTop: mobile ? '1rem' : '2rem',
            background: 'rgba(26, 26, 46, 0.4)',
            border: '1px solid rgba(212, 175, 90, 0.3)',
            padding: mobile ? '1rem' : '1.5rem',
            textAlign: 'center',
            borderRadius: '16px'
          }}>
            <span style={{ fontFamily: "'IM Fell English SC', serif", fontSize: mobile ? '0.5rem' : '0.7rem', color: '#D4A83A' }}>PONTUAÇÃO TOTAL DO MEMBRO</span>
            <br />
            <span style={{
              fontFamily: "'Cinzel Decorative', serif",
              fontSize: mobile ? '2rem' : tablet ? '2.5rem' : '3rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FAE8B0, #D4A83A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              {pontosMembro}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin