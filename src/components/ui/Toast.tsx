import { useEffect, useState } from 'react'
import { Star } from 'lucide-react'

interface XPToastProps {
  xp: number
  onDone: () => void
}

export function XPToast({ xp, onDone }: XPToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 2500)

    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      className="fixed z-50 flex items-center gap-4 text-white"
      style={{
        right: '24px',
        bottom: '24px',
        minWidth: '320px',
        maxWidth: 'min(420px, calc(100vw - 32px))',
        padding: '16px 18px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        border: '1px solid rgba(255,255,255,0.22)',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        boxShadow: '0 18px 40px rgba(217, 119, 6, 0.35)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255,255,255,0.16)',
          border: '1px solid rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Star size={24} strokeWidth={1.8} />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <p style={{ fontSize: '16px', lineHeight: 1.2, fontWeight: 700, margin: '0 0 4px 0' }}>
          Recompensa recebida
        </p>
        <p style={{ fontSize: '30px', lineHeight: 1, fontWeight: 800, margin: '0 0 4px 0' }}>
          +{xp} XP
        </p>
        <p style={{ fontSize: '13px', lineHeight: 1.35, fontWeight: 500, opacity: 0.92, margin: 0 }}>
          Parabens pelo progresso!
        </p>
      </div>
    </div>
  )
}
