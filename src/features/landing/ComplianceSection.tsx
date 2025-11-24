import { BookOpen, Lock, Shield, Target } from 'lucide-react'
import { colors, containerStyle, fonts } from './shared'

const complianceHighlights = [
  { icon: <Lock size={16} color={colors.red} />, title: 'Full transparency', desc: 'Contracts reviewed with guardians – no hidden terms.' },
  { icon: <BookOpen size={16} color={colors.red} />, title: 'Multi-level alignment', desc: 'UIL, NCAA, and Texas law compliant frameworks.' },
  { icon: <Target size={16} color={colors.red} />, title: 'Brand control', desc: 'Program oversight protecting reputation and tone.' },
]

export function ComplianceSection() {
  return (
    <section style={{ background: colors.carolina, padding: '80px 0' }}>
      <div style={containerStyle}>
        <div
          style={{
            background: '#0b1020',
            padding: '48px 40px',
            transform: 'skewX(-2deg)',
            borderRight: `8px solid ${colors.red}`,
            boxShadow: '0 32px 50px rgba(0,0,0,0.45)',
          }}
        >
          <div style={{ transform: 'skewX(2deg)', display: 'grid', gap: 32, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            <div>
              <Shield size={52} color={colors.carolina} />
              <h2
                style={{
                  color: colors.white,
                  fontFamily: fonts.display,
                  textTransform: 'uppercase',
                  margin: '12px 0',
                }}
              >
                Ironclad compliance
              </h2>
              <p style={{ color: colors.slate400 }}>Zero payouts until eligibility. Full transparency. We protect the athlete’s future above all else.</p>
            </div>
            <div style={{ display: 'grid', gap: 18 }}>
              {complianceHighlights.map((item) => (
                <div key={item.title}>
                  <p style={{ margin: 0, color: colors.white, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', gap: 8, alignItems: 'center' }}>
                    {item.icon}
                    {item.title}
                  </p>
                  <p style={{ color: colors.slate400, margin: '6px 0 0', fontSize: 14 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
