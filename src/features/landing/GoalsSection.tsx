import { TrendingUp, Users, Target, Zap } from 'lucide-react'
import { colors, containerStyle, fonts, useScrollReveal } from './shared'
import type { ReactNode } from 'react'
import { useState } from 'react'

const cards = [
  { title: 'Player-first reputation', desc: 'Develop athletes beyond the field with NIL literacy.', icon: <Users size={24} /> },
  { title: 'Recruiting advantage', desc: 'Athletes arrive with polished brands and NIL assets.', icon: <TrendingUp size={24} /> },
  { title: 'Build personal brands', desc: 'Authentic positioning that reflects values and performance.', icon: <Target size={24} /> },
  { title: 'Attract partners', desc: 'Sponsor-ready pipeline with compliance guardrails.', icon: <Zap size={24} /> },
]

export function GoalsSection() {
  return (
    <section id="mission" style={{ background: '#080c18', padding: '96px 0' }}>
      <div style={containerStyle}>
        <SectionHeading title="Program Goals" subtitle="Why it matters" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 24,
          }}
        >
          {cards.map((card) => (
            <GoalCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  )
}

const SectionHeading = ({ title, subtitle }: { title: string; subtitle: string }) => {
  const [ref, visible] = useScrollReveal()
  return (
    <div
      ref={ref}
      style={{
        marginBottom: '3.5rem',
        textAlign: 'center',
        transition: 'transform 900ms ease, opacity 900ms ease',
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        opacity: visible ? 1 : 0,
      }}
    >
      <p
        style={{
          color: colors.red,
          fontWeight: 700,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          fontSize: '0.75rem',
          margin: '0 0 12px',
          fontFamily: fonts.body,
        }}
      >
        {subtitle}
      </p>
      <h2
        style={{
          margin: 0,
          color: colors.white,
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontFamily: fonts.display,
          fontWeight: 700,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          fontStyle: 'italic',
        }}
      >
        {title}
      </h2>
      <div style={{ height: 4, width: 96, background: colors.carolina, margin: '16px auto 0' }} />
    </div>
  )
}

interface GoalCardProps {
  title: string
  desc: string
  icon: ReactNode
}

const GoalCard = ({ title, desc, icon }: GoalCardProps) => {
  const [hovered, setHovered] = useState(false)
  const [ref, visible] = useScrollReveal()

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(17,23,39,0.85)',
        border: hovered ? `1px solid ${colors.carolina}` : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: 28,
        transition: 'transform 220ms ease, border 220ms ease, opacity 500ms ease',
        transform: hovered ? 'translateY(-8px)' : 'translateY(0)',
        boxShadow: hovered ? '0 24px 45px rgba(0,0,0,0.4)' : 'none',
        opacity: visible ? 1 : 0,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: hovered ? `linear-gradient(135deg, ${colors.red}, ${colors.carolinaDark})` : 'rgba(226,61,61,0.2)',
          display: 'grid',
          placeItems: 'center',
          color: colors.white,
          marginBottom: 16,
        }}
      >
        {icon}
      </div>
      <h3
        style={{
          margin: '0 0 12px',
          color: colors.white,
          fontFamily: fonts.display,
          fontSize: '1.35rem',
          textTransform: 'uppercase',
        }}
      >
        {title}
      </h3>
      <p style={{ margin: 0, color: colors.slate400, lineHeight: 1.6 }}>{desc}</p>
    </div>
  )
}
