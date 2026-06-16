import React, { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Stats from '../components/Stats'
import Ranking from '../components/Ranking'
import Rules from '../components/Rules'
import Rewards from '../components/Rewards'
import Footer from '../components/Footer'
import ThemeToggle from '../components/ThemeToggle'
import HousesShowcase from '../components/HousesShowcase'

function Home() {
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    /* Audio setup */
    audioRef.current = new Audio('/imagens/MedievalSong.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = 0.4

    /* Reveal on scroll */
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

    /* Navbar scroll class */
    const handleScroll = () => {
      const nav = document.getElementById('navbar')
      if (nav) nav.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [])

  const playMusicAndScroll = () => {
    audioRef.current?.play().catch(() => {})
    setIsPlaying(true)
    document.getElementById('ranking')?.scrollIntoView({ behavior: 'smooth' })
  }

  const toggleSound = () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  return (
    <div className="app">
      <ThemeToggle />
      <Navbar />

      <main>
        <Hero onPlayMusic={playMusicAndScroll} />
        <Stats />
        <HousesShowcase />
        <Ranking />
        <Rules />
        <Rewards />
        <Footer />
      </main>

      {/* Sound toggle */}
      <button
        className={`sound-toggle ${isPlaying ? 'playing' : ''}`}
        onClick={toggleSound}
        title={isPlaying ? 'Desligar música épica' : 'Ligar música épica (Clique em "Ver ranking" para começar)'}
        aria-label={isPlaying ? 'Desligar música' : 'Ligar música (Clique em "Ver ranking" para começar)'}
      >
        {isPlaying ? '🔊' : '🔈'}
      </button>
    </div>
  )
}

export default Home