import React from 'react'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Login from './pages/Login'

function App() {
  const path = window.location.pathname

  // Rota de login
  if (path === '/login') {
    return <Login />
  }

  // Rota do painel administrativo
  if (path === '/admin') {
    return <Admin />
  }

  // Página principal
  return <Home />
}

export default App