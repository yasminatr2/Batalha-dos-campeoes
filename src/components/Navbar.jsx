import React from 'react'

function Navbar() {
  return (
    <nav id="navbar">
      <div className="nav-brand">
        {/* Bandeira Azul Ondulante */}
        <div className="nav-flag">
          <div className="nav-flag-pole"></div>
          <div className="nav-flag-cloth"></div>
        </div>
        
        <div className="nav-shield">⚔</div>
        <div className="nav-title">
          BATALHA DOS CAMPEÕES
          <span> 1°Edição 2026 </span>
        </div>
      </div>

      <ul className="nav-links">
        <li><a href="#ranking">Crônica</a></li>
        <li><a href="#regras">Decretos</a></li>
        <li><a href="#recompensas">Glórias</a></li>
      </ul>

      <span className="nav-badge">⚔ EM CURSO</span>
    </nav>
  )
}

export default Navbar