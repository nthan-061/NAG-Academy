export function getAuthErrorMessage(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : ''
  const normalized = message.toLowerCase()

  if (!message) return fallback

  if (normalized.includes('invalid login credentials')) {
    return 'Email ou senha incorretos. Se esta conta nao existir neste ambiente, crie uma nova conta.'
  }

  if (normalized.includes('email not confirmed')) {
    return 'Confirme seu email antes de fazer login. Verifique sua caixa de entrada e a pasta de spam.'
  }

  if (normalized.includes('failed to fetch') || normalized.includes('network') || normalized.includes('fetch failed')) {
    return 'Nao foi possivel conectar ao servidor de autenticacao. Verifique a configuracao do Supabase e tente novamente.'
  }

  if (normalized.includes('redirect')) {
    return 'A configuracao de redirecionamento do email esta incompleta. Revise as URLs permitidas no Supabase Auth.'
  }

  if (normalized.includes('rate limit')) {
    return 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.'
  }

  if (normalized.includes('signup is disabled')) {
    return 'O cadastro por email esta desativado no Supabase Auth.'
  }

  return message || fallback
}
