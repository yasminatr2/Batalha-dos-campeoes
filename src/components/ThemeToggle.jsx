import React from 'react'

function ThemeToggle() {
  const handleClick = () => {
    window.location.href = "/login"
  }

  return (
    <button 
      className="theme-toggle" 
      id="loginBtn" 
      title="Área de Login"
      onClick={handleClick}
    >
      ♥
    </button>
  )
}

export default ThemeToggle