import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { useAuth } from '@/hooks/useAuth'
import { useProfile } from '@/hooks/useProfile'
import { RequireAdminRoute } from '@/components/auth/RequireAdminRoute'
import { Header } from '@/components/layout/Header'
import { Sidebar } from '@/components/layout/Sidebar'
import { PageLayout } from '@/components/layout/PageLayout'

import { Login } from '@/pages/Login'
import { Register } from '@/pages/Register'
import { VerifyEmail } from '@/pages/VerifyEmail'
import { ForgotPassword } from '@/pages/ForgotPassword'
import { ResetPassword } from '@/pages/ResetPassword'
import { Dashboard } from '@/pages/Dashboard'
import { Trilhas } from '@/pages/Trilhas'
import { TrilhaDetalhe } from '@/pages/TrilhaDetalhe'
import { Aula } from '@/pages/Aula'
import { Quiz } from '@/pages/Quiz'
import { Flashcards } from '@/pages/Flashcards'
import { Progresso } from '@/pages/Progresso'
import { Admin } from '@/pages/Admin'
import { Mentor } from '@/pages/Mentor'

// ---------- Splash Screen ----------
function SplashScreen() {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#0A1628',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <img
        src="/logo-white.png"
        alt="Nathan Alves Group"
        style={{ height: '120px', width: 'auto', objectFit: 'contain' }}
      />
    </div>
  )
}

// ---------- Rotas protegidas com layout ----------
function AppRoutes({ session, isPasswordRecovery }: { session: Session; isPasswordRecovery: boolean }) {
  const { profile } = useProfile(session.user)
  const { role, loading: authLoading } = useAuth()

  return (
    <>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/"           element={<PageLayout><Dashboard profile={profile} /></PageLayout>} />
        <Route path="/trilhas"    element={<PageLayout><Trilhas /></PageLayout>} />
        <Route path="/trilhas/:id" element={<PageLayout><TrilhaDetalhe /></PageLayout>} />
        <Route path="/aula/:id"   element={<Aula />} />
        <Route path="/aula/:id/quiz" element={<Quiz />} />
        <Route path="/flashcards" element={<PageLayout><Flashcards /></PageLayout>} />
        <Route path="/progresso"  element={<PageLayout><Progresso /></PageLayout>} />
        <Route path="/mentor" element={<PageLayout><Mentor /></PageLayout>} />
        <Route
          path="/admin"
          element={
            <RequireAdminRoute role={role} loading={authLoading}>
              <PageLayout><Admin role={role} /></PageLayout>
            </RequireAdminRoute>
          }
        />
        {isPasswordRecovery && (
          <Route path="/reset-password" element={<ResetPassword />} />
        )}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

// ---------- Rotas públicas ----------
function PublicRoutes({ session }: { session: Session | null }) {
  if (session) return <Navigate to="/" replace />

  return (
    <Routes>
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/verify-email"    element={<VerifyEmail />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />
      <Route path="*"                element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

// ---------- Root ----------
export default function App() {
  const { session, loading, isPasswordRecovery } = useAuth()

  if (loading) return <SplashScreen />

  return (
    <BrowserRouter>
      {session && !isPasswordRecovery
        ? <AppRoutes session={session} isPasswordRecovery={isPasswordRecovery} />
        : <PublicRoutes session={session} />
      }
    </BrowserRouter>
  )
}
