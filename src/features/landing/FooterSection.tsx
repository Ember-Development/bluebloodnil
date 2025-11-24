import { colors, containerStyle, fonts } from './shared'

const footerLinks = [
  { title: 'Links', links: ['About BlueBloods', 'Athlete Pathways', 'Sponsorships', 'Compliance'] },
  { title: 'Legal', links: ['Terms of Service', 'Privacy Policy', 'NIL Disclosure'] },
]

export function LandingFooter() {
  return (
    <footer
      style={{
        background: '#04060b',
        color: colors.white,
        padding: '72px 0 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div style={containerStyle}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            marginBottom: 32,
          }}
        >
          <div>
            <h3 style={{ fontFamily: fonts.display, margin: 0 }}>
              BOMBERS <span style={{ color: colors.carolina }}>COLLECTIVE</span>
            </h3>
            <p style={{ color: colors.slate500 }}>Developing champions on and off the field.</p>
          </div>
          {footerLinks.map((block) => (
            <div key={block.title}>
              <p style={{ textTransform: 'uppercase', letterSpacing: '0.2em', color: colors.slate400 }}>{block.title}</p>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                {block.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      style={{ color: colors.slate500, textDecoration: 'none' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = colors.carolina)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = colors.slate500)}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            color: colors.slate500,
            fontSize: 14,
          }}
        >
          <p style={{ margin: 0 }}>© 2025 Bombers Fastpitch. All rights reserved.</p>
          <p style={{ margin: 0 }}>Built for the game.</p>
        </div>
      </div>
    </footer>
  )
}
