import { NavLink } from 'react-router-dom'
import { Home, BookOpen, Layers, BarChart2, ShieldCheck } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { useFlashcards } from '@/hooks/useFlashcards'
import { getNivel, NIVEIS } from '@/lib/xp'

const NAV = [
  { to: '/',           label: 'Início',        icon: Home },
  { to: '/trilhas',    label: 'Trilhas',       icon: BookOpen },
  { to: '/flashcards', label: 'Flashcards',    icon: Layers },
  { to: '/progresso',  label: 'Meu Progresso', icon: BarChart2 },
]

export function Sidebar() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { pendingCount } = useFlashcards()

  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL

  const xp = profile?.xp ?? 0
  const nivel = getNivel(xp)
  const proximoNivel = NIVEIS.find((n) => n.nivel === nivel.nivel + 1)
  const progressoPct = proximoNivel
    ? Math.round(((xp - nivel.xp_min) / (proximoNivel.xp_min - nivel.xp_min)) * 100)
    : 100

  const nome = profile?.full_name ?? ''
  const initials = nome
    ? nome.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: isActive ? 500 : 400,
    cursor: 'pointer',
    backgroundColor: isActive ? '#EBF0FA' : 'transparent',
    color: isActive ? '#0D1B3E' : '#6B7280',
    transition: 'background-color 0.15s',
    textDecoration: 'none',
  })

  return (
    <aside style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100vh',
      zIndex: 40,
      display: 'flex',
      flexDirection: 'column',
      width: '240px',
      backgroundColor: '#FFFFFF',
      borderRight: '1px solid #E8ECF2',
      paddingTop: '56px',
    }}>
      {/* Navegação */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '16px 8px 12px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              {({ isActive }) => (
                <div
                  style={navItemStyle(isActive)}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F5F6FA'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <Icon size={18} strokeWidth={1.5} color={isActive ? '#0D1B3E' : '#9CA3AF'} />
                  <span style={{ flex: 1 }}>{label}</span>
                  {label === 'Flashcards' && pendingCount > 0 && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#0D1B3E',
                      color: '#FFFFFF',
                    }}>
                      {pendingCount > 9 ? '9+' : pendingCount}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}

          {isAdmin && (
            <NavLink to="/admin">
              {({ isActive }) => (
                <div
                  style={navItemStyle(isActive)}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = '#F5F6FA'
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <ShieldCheck size={18} strokeWidth={1.5} color={isActive ? '#0D1B3E' : '#9CA3AF'} />
                  <span>Admin</span>
                </div>
              )}
            </NavLink>
          )}
        </div>
      </nav>

      {/* Base — avatar + nome + XP */}
      <div style={{ padding: '16px', borderTop: '1px solid #E8ECF2', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#0D1B3E',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 600,
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '13px',
              fontWeight: 500,
              color: '#1A1F2E',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              margin: 0,
            }}>
              {nome || 'Usuário'}
            </p>
            <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>
              {xp} XP · {nivel.nome}
            </p>
          </div>
        </div>

        <div style={{
          width: '100%',
          height: '3px',
          borderRadius: '999px',
          backgroundColor: '#E8ECF2',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            borderRadius: '999px',
            backgroundColor: '#0D1B3E',
            width: `${progressoPct}%`,
            transition: 'width 0.5s ease',
          }} />
        </div>

        {proximoNivel && (
          <p style={{
            fontSize: '11px',
            color: '#9CA3AF',
            margin: '4px 0 0 0',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {proximoNivel.xp_min - xp} XP para {proximoNivel.nome}
          </p>
        )}
      </div>
    </aside>
  )
}
