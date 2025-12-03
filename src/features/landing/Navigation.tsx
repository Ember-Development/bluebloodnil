import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { colors, containerStyle, fonts } from './shared'

const links = ['Mission', 'Pathways', 'Landscape', 'Roadmap']

export function Navigation() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav
      style={{
        position: 'fixed',
        inset: '0 0 auto 0',
        zIndex: 50,
        width: '100%',
        transition: 'all 300ms ease',
        padding: scrolled ? '14px 0' : '26px 0',
        background: scrolled ? 'rgba(8,11,20,0.95)' : 'transparent',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        boxShadow: scrolled ? '0 12px 30px rgba(0,0,0,0.35)' : 'none',
      }}
    >
      <div
        style={{
          ...containerStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: `linear-gradient(135deg, ${colors.carolinaSoft}, ${colors.carolinaDark})`,
              color: '#041023',
              fontFamily: fonts.display,
              fontWeight: 800,
              fontSize: 20,
              display: 'grid',
              placeItems: 'center',
              boxShadow: '0 12px 28px rgba(0,0,0,0.35)',
            }}
          >
            BB
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div
              style={{
                color: colors.white,
                fontFamily: fonts.display,
                fontWeight: 700,
                letterSpacing: '0.04em',
              }}
            >
              BOMBERS
            </div>
            <small
              style={{
                color: colors.carolina,
                fontFamily: fonts.body,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
              }}
            >
              Collective
            </small>
          </div>
        </div>

        <div className="landing-nav-desktop" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                color: colors.slate400,
                textTransform: 'uppercase',
                letterSpacing: '0.12em',
                fontWeight: 700,
                fontSize: 12,
                transition: 'color 160ms ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = colors.carolina)}
              onMouseLeave={(e) => (e.currentTarget.style.color = colors.slate400)}
            >
              {item}
            </a>
          ))}
          <Link
            to="/login"
            style={{
              color: colors.carolina,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontWeight: 700,
              fontSize: 12,
              textDecoration: 'none',
              transition: 'color 160ms ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = colors.carolinaSoft)}
            onMouseLeave={(e) => (e.currentTarget.style.color = colors.carolina)}
          >
            Login
          </Link>
          <button
            type="button"
            style={{
              background: colors.red,
              color: colors.white,
              border: 'none',
              padding: '10px 24px',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'transform 160ms ease, background 160ms ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.background = '#c73131'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.background = colors.red
            }}
          >
            Partner with us
          </button>
        </div>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.white,
            display: 'none',
          }}
          className="landing-nav-mobile"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div
          className="landing-nav-mobile-panel"
          style={{
            display: 'none',
            flexDirection: 'column',
            gap: 16,
            padding: 24,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {links.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              onClick={() => setOpen(false)}
              style={{
                color: colors.white,
                fontFamily: fonts.display,
                fontSize: 24,
                textTransform: 'uppercase',
                textDecoration: 'none',
              }}
            >
              {item}
            </a>
          ))}
          <Link
            to="/login"
            onClick={() => setOpen(false)}
            style={{
              color: colors.carolina,
              fontFamily: fonts.display,
              fontSize: 24,
              textTransform: 'uppercase',
              textDecoration: 'none',
              marginTop: 8,
              paddingTop: 16,
              borderTop: '1px solid rgba(255,255,255,0.08)',
            }}
          >
            Login
          </Link>
        </div>
      )}
    </nav>
  )
}
