# Design System Migration

## Estrutura

Nova base visual centralizada:

- `src/design/tokens.ts`
- `src/design/theme.ts`
- `src/components/ui/Button.tsx`
- `src/components/ui/Card.tsx`
- `src/components/ui/Badge.tsx`
- `src/components/ui/Input.tsx`
- `src/components/ui/Text.tsx`

## O que mudou

- Tailwind passou a ser a camada principal para os novos componentes de UI.
- Tokens semanticos agora vivem em `src/design/tokens.ts`.
- `src/design/theme.ts` concentra mapas de classes reutilizaveis para componentes e layout.
- `src/index.css` agora expõe tokens semanticos via `@theme` para manter o Tailwind alinhado com o design.
- `src/styles/tokens.ts` foi mantido como reexport para evitar quebra no codigo legado.

## Telas migradas

- `src/pages/Login.tsx`
- `src/pages/Register.tsx`
- `src/pages/VerifyEmail.tsx`
- `src/components/auth/AuthLeftColumn.tsx`

Essas telas agora usam:

- `Card` para superficie principal
- `Text` para hierarquia tipografica
- `Input` para campos padronizados
- `Button` para acoes
- `Badge` para destaque curto

## Como aplicar o padrao no restante do projeto

1. Remover `style={{}}` sempre que o bloco for apenas visual.
2. Trocar containers por `Card` e mover variacoes para `className`.
3. Trocar textos soltos por `Text` para manter hierarquia e tons.
4. Trocar campos manuais por `Input`.
5. Centralizar combinacoes repetidas em `src/design/theme.ts`.
6. Quando uma tela repetir uma secao inteira, criar um componente de dominio em vez de duplicar classes.

## Prioridade de migracao sugerida

1. `ForgotPassword.tsx`
2. `ResetPassword.tsx`
3. `Dashboard.tsx`
4. `Trilhas.tsx`
5. `TrilhaDetalhe.tsx`
6. `Aula` e `Quiz`, substituindo blocos inline por classes e componentes do sistema

## Regra pratica

Se um estilo aparecer mais de uma vez:

- vira token, classe compartilhada ou componente reutilizavel

Se um elemento for apenas texto:

- usar `Text`

Se for superficie:

- usar `Card`

Se for acao:

- usar `Button`
