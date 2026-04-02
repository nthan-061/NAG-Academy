# Feature-Based Migration Guide

## Estrutura adotada

```text
src/features/
├── admin/
├── aula/
├── auth/
├── flashcards/
├── mentor/
├── progresso/
├── quiz/
└── trilhas/
```

Cada dominio segue o contrato:

```text
feature-name/
├── components/
├── hooks/
├── services/
├── types.ts
└── utils.ts
```

## Refatoracao concluida nesta etapa

### `aula`

- `components/`
  - `AulaScreen.tsx`
  - `AulaHeader.tsx`
  - `AulaPlayer.tsx`
  - `AulaTabs.tsx`
  - `AulaSummaryPanel.tsx`
  - `AulaChatPanel.tsx`
  - `AulaNotesPanel.tsx`
- `hooks/`
  - `useAula.ts`
  - `useAulaNotes.ts`
- `services/`
  - `aulaService.ts`
  - `progressoService.ts`
  - `chatService.ts`

### `quiz`

- `components/`
  - `QuizScreen.tsx`
  - `QuizHeader.tsx`
  - `QuizOption.tsx`
  - `QuizFeedback.tsx`
  - `QuizResult.tsx`
- `hooks/`
  - `useQuiz.ts`
- `services/`
  - `quizService.ts`

## Padrão de migração para os demais domínios

1. Identificar o que hoje pertence ao dominio.
2. Extrair tipos e funcoes puras para `types.ts` e `utils.ts`.
3. Mover acesso ao Supabase e regras de negocio para `services/`.
4. Criar um hook principal que orquestra estado, loading, efeitos e handlers.
5. Transformar a page em um container fino que so renderiza o componente de tela da feature.
6. Substituir estilos inline por utilitarios Tailwind progressivamente.

## Convenções recomendadas

- Componentes nao acessam Supabase diretamente.
- Hooks nao fazem mapeamento visual.
- Services retornam dados prontos para consumo e encapsulam side-effects.
- Pages em `src/pages/` devem virar apenas adaptadores de rota.
- Componentes compartilhados entram em `src/components/ui/`.

## Ordem sugerida da proxima leva

1. `trilhas`
2. `flashcards`
3. `progresso`
4. `auth`
5. `admin`

## Observacoes operacionais

- O build local em Windows pode falhar por causa do binario `@tailwindcss/oxide`.
- O lint segue sendo a validacao local principal.
- O deploy em Vercel permanece a referencia de build real do projeto.
