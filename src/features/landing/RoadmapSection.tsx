import { colors, containerStyle, fonts, useScrollReveal } from './shared'

const steps = [
  { time: 'Day 1-30', title: 'Clear structure', desc: 'Legal entity & compliance guardrails established.' },
  { time: 'Day 30-45', title: 'Athlete engagement', desc: 'Branding + fundamentals sessions with players/guardians.' },
  { time: 'Day 45-60', title: 'Secured commitments', desc: 'Initial donor and sponsor pledges locked.' },
  { time: 'Day 60+', title: 'Market leadership', desc: 'Public launch and repeatable NIL playbook.' },
]

export function RoadmapSection() {
  return (
    <section id="roadmap" style={{ background: colors.offWhite, padding: '90px 0' }}>
      <div style={containerStyle}>
        <Heading title="Launch Roadmap" subtitle="The next 60 days" />
        <div style={{ position: 'relative', marginTop: 48 }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              width: 2,
              background: '#e5e7eb',
              transform: 'translateX(-50%)',
            }}
          />
          <div style={{ display: 'grid', gap: 32 }}>
            {steps.map((step, index) => (
              <TimelineCard key={step.title} step={step} mirror={index % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const Heading = ({ title, subtitle }: { title: string; subtitle: string }) => {
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
          color: colors.slate900,
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

const TimelineCard = ({
  step,
  mirror,
}: {
  step: { time: string; title: string; desc: string }
  mirror: boolean
}) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
      gap: 18,
      alignItems: 'center',
    }}
  >
    <div style={{ justifySelf: mirror ? 'end' : 'start', textAlign: mirror ? 'right' : 'left' }}>
      <div
        style={{
          background: colors.slate800,
          borderTop: `4px solid ${mirror ? colors.carolina : colors.red}`,
          padding: 24,
          borderRadius: 12,
          boxShadow: '0 18px 35px rgba(5,7,13,0.35)',
          maxWidth: 360,
        }}
      >
        <p style={{ margin: 0, textTransform: 'uppercase', color: colors.slate500, letterSpacing: '0.16em', fontSize: 12 }}>{step.time}</p>
        <h4 style={{ margin: '8px 0 6px', fontFamily: fonts.display, textTransform: 'uppercase', color: colors.white }}>{step.title}</h4>
        <p style={{ margin: 0, color: colors.slate400 }}>{step.desc}</p>
      </div>
    </div>
  </div>
)
