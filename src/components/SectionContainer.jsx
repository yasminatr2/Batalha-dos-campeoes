import React from 'react'

export default function SectionContainer({ id, title, subtitle, children, className = '' }) {
  return (
    <section id={id} className={`section ${className}`}>
      <div className="section-content">
        {title && (
          <>
            <p className="section-tag reveal">✦ {subtitle || title} ✦</p>
            <h2 className="section-title reveal">{title}</h2>
            <div className="section-ornament reveal">
              <span style={{ color: 'var(--rose)' }}>♥</span>
              {' '}◈{' '}
              <span style={{ color: 'var(--rose)' }}>♦</span>
            </div>
          </>
        )}
        {children}
      </div>
    </section>
  )
}