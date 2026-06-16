import React from 'react'

const deckCards = [
  { rank: 'Q', suit: '♥', color: 'red', rotate: '-8deg', translateY: '4px' },
  { rank: 'K', suit: '♠', color: 'black', rotate: '-3deg', translateY: '0' },
  { rank: 'A', suit: '♦', color: 'red', rotate: '1deg', translateY: '-6px' },
  { rank: 'J', suit: '♣', color: 'black', rotate: '5deg', translateY: '-2px' },
  { rank: '10', suit: '♥', color: 'red', rotate: '9deg', translateY: '3px' }
]

function DeckStrip() {
  return (
    <div style={{ 
      background: 'var(--bg-2)', 
      borderTop: '0.5px solid var(--border)', 
      padding: '2.5rem 0 1.5rem', 
      overflow: 'hidden' 
    }}>
      <div className="deck-strip">
        {deckCards.map((card, i) => (
          <div 
            key={i} 
            className={`deck-card ${card.color}`} 
            style={{
              transform: `rotate(${card.rotate}) translateY(${card.translateY})`
            }}
          >
  
            
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeckStrip