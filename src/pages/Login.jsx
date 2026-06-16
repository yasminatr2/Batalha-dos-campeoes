import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

function Login() {
  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [carregando, setCarregando] = useState(false)

  const fazerLogin = async () => {
    if (!usuario || !senha) {
      setMensagem("Preencha usuário e senha")
      return
    }

    setCarregando(true)
    setMensagem("Verificando credenciais...")

    try {
      // Buscar usuário diretamente na tabela (sem Auth)
      const { data: user, error: userError } = await supabase
        .from("usuarios_qualidade")
        .select("*")
        .eq("usuario", usuario)
        .eq("senha", senha)
        .single()

      if (userError || !user) {
        setMensagem("Usuário ou senha inválidos")
        setCarregando(false)
        return
      }

      // Login bem sucedido - salvar na sessão
      setMensagem("Login realizado! Redirecionando...")
      
      // Salvar dados do usuário no localStorage
      localStorage.setItem("usuario_logado", user.usuario)
      localStorage.setItem("usuario_id", user.id)
      localStorage.setItem("usuario_nome", user.nome || user.usuario)
      localStorage.setItem("usuario_role", user.role || 'user')
      localStorage.setItem("auth_token", btoa(`${user.id}:${Date.now()}`))

      // Redirecionar para admin
      setTimeout(() => {
        window.location.href = "/admin"
      }, 1000)
      
    } catch (error) {
      console.error("Erro inesperado:", error)
      setMensagem("Erro inesperado. Tente novamente.")
      setCarregando(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fazerLogin()
    }
  }

  const voltarParaHome = () => {
    window.location.href = "/"
  }

  return (
    <div style={{
      background: 'url(/imagens/dia.png) center/cover fixed no-repeat',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative'
    }}>
      {/* Overlay glass */}
      <div style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Botão Voltar */}
      <button
        onClick={voltarParaHome}
        style={{
          position: 'fixed',
          top: '2rem',
          left: '2rem',
          zIndex: 100,
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          border: '1px solid rgba(212, 175, 90, 0.6)',
          padding: '0.7rem 1.5rem',
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: '#F5D488',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(212, 175, 90, 0.15)'
          e.currentTarget.style.borderColor = '#F5D488'
          e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 175, 90, 0.25)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(0, 0, 0, 0.55)'
          e.currentTarget.style.borderColor = 'rgba(212, 175, 90, 0.6)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        ← VOLTAR
      </button>

      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '420px'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.55)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          border: '1px solid rgba(212, 175, 90, 0.6)',
          padding: '2.5rem 2rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Linha de brilho superior */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(90deg, transparent, #F5D488, #D4A83A, #E8C060, transparent)',
            animation: 'shineBorder 4s ease-in-out infinite'
          }} />
          
          {/* Linha de brilho inferior */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            right: '-100%',
            width: '100%',
            height: '2px',
            background: 'linear-gradient(270deg, transparent, #F5D488, #D4A83A, #E8C060, transparent)',
            animation: 'shineBorderReverse 4s ease-in-out infinite'
          }} />

          <h1 style={{
            textAlign: 'center',
            fontFamily: "'Cinzel Decorative', serif",
            fontSize: '1.8rem',
            fontWeight: 900,
            background: 'linear-gradient(160deg, #FAE8B0 0%, #F5D488 30%, #E8C060 55%, #D4A83A 75%, #FAE8B0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.06em',
            marginBottom: '0.3rem'
          }}>
            ROYAL POKER
          </h1>
          
          <div style={{
            textAlign: 'center',
            fontFamily: "'IM Fell English SC', serif",
            fontSize: '0.7rem',
            letterSpacing: '0.4em',
            color: '#D4A83A',
            marginBottom: '2rem'
          }}>
            ACESSO RESTRITO
          </div>

          {/* Ornamento */}
          <div style={{
            textAlign: 'center',
            fontSize: '0.8rem',
            letterSpacing: '0.5rem',
            color: '#D4A83A',
            marginBottom: '1.5rem',
            opacity: 0.5
          }}>
            ◇ ◆ ◇
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              color: '#D4A83A',
              marginBottom: '0.5rem'
            }}>
              USUÁRIO
            </label>
            <input
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="digite seu usuário"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(2px)',
                border: '1px solid rgba(212, 175, 90, 0.3)',
                fontFamily: "'IM Fell English', serif",
                fontSize: '1rem',
                color: '#F5F0E0',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D4A83A'
                e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 90, 0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 90, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{
              display: 'block',
              fontFamily: "'IM Fell English SC', serif",
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              color: '#D4A83A',
              marginBottom: '0.5rem'
            }}>
              SENHA
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.8rem 1rem',
                background: 'rgba(0, 0, 0, 0.35)',
                backdropFilter: 'blur(2px)',
                border: '1px solid rgba(212, 175, 90, 0.3)',
                fontFamily: "'IM Fell English', serif",
                fontSize: '1rem',
                color: '#F5F0E0',
                outline: 'none',
                transition: 'all 0.3s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D4A83A'
                e.currentTarget.style.boxShadow = '0 0 10px rgba(212, 175, 90, 0.3)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(212, 175, 90, 0.3)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            />
          </div>

          <button
            onClick={fazerLogin}
            disabled={carregando}
            style={{
              width: '100%',
              background: carregando 
                ? 'linear-gradient(135deg, #8B6914 0%, #8B6914 100%)' 
                : 'linear-gradient(135deg, #D4A83A 0%, #E8C060 50%, #F5D488 100%)',
              border: 'none',
              padding: '0.8rem',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.3em',
              color: '#1a1410',
              cursor: carregando ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'all 0.3s',
              clipPath: 'polygon(8px 0%, calc(100% - 8px) 0%, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0% calc(100% - 8px), 0% 8px)',
              position: 'relative'
            }}
            onMouseEnter={(e) => {
              if (!carregando) {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(212, 175, 90, 0.4)'
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            {carregando ? 'ENTRANDO...' : 'ENTRAR'}
          </button>

          <div style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#E85068',
            minHeight: '40px',
            fontFamily: "'IM Fell English', serif"
          }}>
            {mensagem}
          </div>

          <div style={{
            textAlign: 'center',
            marginTop: '1rem',
            fontSize: '0.65rem',
            color: '#A89870',
            fontFamily: "'IM Fell English SC', serif",
            letterSpacing: '0.3em'
          }}>
            ⚔️ ACESSO RESTRITO A CAVALEIROS ⚔️
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shineBorder {
          0% { left: -100%; opacity: 0; }
          50% { left: 100%; opacity: 1; }
          100% { left: 200%; opacity: 0; }
        }
        
        @keyframes shineBorderReverse {
          0% { right: -100%; opacity: 0; }
          50% { right: 100%; opacity: 1; }
          100% { right: 200%; opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default Login