import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

interface ServerAuthContext {
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceKey: string
  token: string
}

interface AuthenticatedRequest {
  user: {
    id: string
    email?: string
  }
  authClient: any
  serviceClient: any
  env: ServerAuthContext
}

function getServerAuthContext(req: VercelRequest, res: VercelResponse): ServerAuthContext | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : ''

  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
    res.status(500).json({ error: 'Configuracao Supabase ausente.' })
    return null
  }

  if (!token) {
    res.status(401).json({ error: 'Autenticacao obrigatoria.' })
    return null
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceKey,
    token,
  }
}

export async function requireAuthenticatedUser(
  req: VercelRequest,
  res: VercelResponse,
): Promise<AuthenticatedRequest | null> {
  const env = getServerAuthContext(req, res)
  if (!env) return null

  const authClient = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${env.token}` } },
  })

  const serviceClient = createClient(env.supabaseUrl, env.supabaseServiceKey)

  const { data: authData, error: authError } = await authClient.auth.getUser()
  if (authError || !authData.user) {
    res.status(401).json({ error: 'Sessao invalida ou expirada.' })
    return null
  }

  return {
    user: {
      id: authData.user.id,
      email: authData.user.email,
    },
    authClient,
    serviceClient,
    env,
  }
}

export async function requireAdmin(
  req: VercelRequest,
  res: VercelResponse,
): Promise<AuthenticatedRequest | null> {
  const auth = await requireAuthenticatedUser(req, res)
  if (!auth) return null

  const { data: profile, error } = await auth.serviceClient
    .from('profiles')
    .select('role')
    .eq('id', auth.user.id)
    .maybeSingle()

  if (error) {
    res.status(500).json({ error: 'Nao foi possivel validar as permissoes.' })
    return null
  }

  if (!profile || profile.role !== 'admin') {
    res.status(403).json({ error: 'Acesso restrito.' })
    return null
  }

  return auth
}

export async function logAdminAction(
  serviceClient: any,
  userId: string,
  action: string,
  context: Record<string, unknown>,
) {
  const { error } = await serviceClient.from('admin_audit_logs').insert({
    user_id: userId,
    action,
    context,
  })

  if (error) {
    console.error('[admin_audit_logs] failed to insert log:', error.message)
  }
}
