# Access Control Hardening

## O que mudou

- `profiles.role` passa a ser a fonte oficial de permissao.
- A verificacao antiga baseada em `ADMIN_EMAIL` foi removida do frontend e das APIs administrativas.
- As APIs serverless agora validam autenticacao e permissao via banco.
- O banco agora possui funcoes auxiliares, RLS por role e logs para acoes administrativas.

## Arquivos principais

- `supabase/migrations/20260402_roles_rls.sql`
- `api/_lib/auth.ts`
- `src/hooks/useAuth.ts`
- `src/hooks/useIsAdmin.ts`
- `src/components/auth/RequireAdminRoute.tsx`

## Roles iniciais

- `user`
- `admin`

## Promover o primeiro admin

Depois de aplicar a migration, execute uma vez:

```sql
update public.profiles
set role = 'admin'
where id in (
  select id
  from auth.users
  where email = 'seu-email-admin@dominio.com'
);
```

## Funcoes SQL reutilizaveis

- `public.get_user_role(uuid)`
- `public.is_admin(uuid)`
- `public.log_admin_action(uuid, text, jsonb)`

## Politicas RLS

Cobertas na migration:

- `profiles`
- `trilhas`
- `modulos`
- `aulas`
- `quiz_perguntas`
- `flashcards`
- `user_progresso`
- `user_respostas`
- `user_dominio`
- `admin_audit_logs`

## Exemplo frontend

```tsx
import { useIsAdmin } from '@/hooks/useIsAdmin'

function AdminBadge() {
  const { isAdmin, loading } = useIsAdmin()

  if (loading || !isAdmin) return null
  return <span>Admin</span>
}
```

## Exemplo backend

```ts
import { requireAdmin } from './_lib/auth'

export default async function handler(req, res) {
  const auth = await requireAdmin(req, res)
  if (!auth) return

  // operacao sensivel segura
}
```

## Regra de ouro

- frontend esconde e redireciona
- backend valida
- banco protege

Sem essas tres camadas juntas, o controle de acesso nao e confiavel.
