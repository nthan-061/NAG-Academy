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
      className="fixed bottom-8 right-8 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-xl font-bold text-white"
      style={{
        backgroundColor: '#D97706',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.95)',
        transition: 'opacity 0.4s ease, transform 0.4s ease',
        boxShadow: '0 8px 32px rgba(212, 160, 23, 0.4)',
      }}
    >
      <Star size={24} strokeWidth={1.5} />
      <div>
        <p style={{ fontSize: '20px', lineHeight: 1 }}>+{xp} XP</p>
        <p style={{ fontSize: '12px', fontWeight: 400, opacity: 0.85 }}>
          Parabéns pelo progresso!
        </p>
      </div>
    </div>
  )
}
