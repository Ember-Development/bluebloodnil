import { useState } from 'react'
import { colors, fonts } from './shared'

interface PrimaryButtonProps {
  label: string
  icon?: React.ReactNode
}

export function PrimaryButton({ label, icon }: PrimaryButtonProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        padding: '16px 28px',
        borderRadius: 999,
        background: hovered ? colors.white : colors.carolina,
        color: hovered ? colors.slate900 : '#0a1628',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: fonts.display,
        boxShadow: '0 18px 30px rgba(98,183,255,0.25)',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 200ms ease',
      }}
    >
      {label}
      {icon}
    </button>
  )
}

export function SecondaryButton({ label }: { label: string }) {
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '16px 28px',
        borderRadius: 999,
        border: `1px solid ${hovered ? colors.carolina : 'rgba(255,255,255,0.3)'}`,
        color: hovered ? colors.carolina : colors.white,
        background: 'transparent',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        fontWeight: 700,
        fontFamily: fonts.display,
        cursor: 'pointer',
        transition: 'color 200ms ease, border 200ms ease',
      }}
    >
      {label}
    </button>
  )
}
