import type { Session, User } from '@supabase/supabase-js'

export type UserRole = 'user' | 'admin'

export interface AuthState {
  session: Session | null
  user: User | null
  role: UserRole | null
  loading: boolean
  isPasswordRecovery: boolean
  signOut: () => Promise<{ error: Error | null }>
}
