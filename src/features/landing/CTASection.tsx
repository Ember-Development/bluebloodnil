import { PrimaryButton, SecondaryButton } from './Buttons'
import { colors, containerStyle, fonts } from './shared'

export function CTASection() {
  return (
    <section
      style={{
        background: '#080c18',
        padding: '96px 0',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={containerStyle}>
        <h2
          style={{
            margin: 0,
            fontFamily: fonts.display,
            fontSize: 'clamp(40px, 8vw, 84px)',
            color: colors.white,
            textTransform: 'uppercase',
            fontStyle: 'italic',
          }}
        >
          Become a{' '}
          <span
            style={{
              background: `linear-gradient(120deg, ${colors.red}, ${colors.carolinaDark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Founding partner
          </span>
        </h2>
        <p style={{ color: colors.slate400, maxWidth: 640, margin: '16px auto 32px', lineHeight: 1.7 }}>
          Gain exclusive recognition, brand exposure, and the ability to pledge future NIL funds for committed athletes.
          Invest in the future of fastpitch.
        </p>
        <div style={{ display: 'flex', gap: 18, justifyContent: 'center', flexWrap: 'wrap' }}>
          <PrimaryButton label="Contact NIL Coordinator" />
          <SecondaryButton label="Download Partner Deck" />
        </div>
      </div>
    </section>
  )
}
