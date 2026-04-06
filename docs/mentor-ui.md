# Mentor IA — Composição Visual

Este documento descreve a camada visual da página **Mentor IA** após o rebuild completo.
Não cobre lógica de negócio, backend ou regras de recomendação.

Para o guia de como e quando fazer rebuild de UI neste projeto, veja: `docs/ui-rebuild-guide.md`

---

## Referência de qualidade

A página **Início** (`src/pages/Dashboard.tsx`) é a referência permanente de qualidade visual.
Os valores de padding, border, shadow, radius e cores usados abaixo são extraídos diretamente dela.

---

## Estrutura da página

Arquivo principal: `src/features/mentor/components/MentorScreen.tsx`

```
MentorScreen (flex column, gap: 32px)
├── MentorHeader
├── Error banner (condicional)
├── MentorNextStepHero
└── Grid xl:[1fr_400px]
    ├── MentorChat
    └── MentorDecisionPanel
```

O container externo é `PageLayout` com `variant="wide"` (`max-w-7xl`, `px-4 lg:px-6`, `py-8`).
`MentorScreen` não adiciona padding próprio — usa apenas `gap: 32px` entre seções.

---

## Header da página

Componente: `src/features/mentor/components/MentorHeader.tsx`

- Linha horizontal: ícone Brain + "Mentor IA" + Badge de status + "Atualizado agora"
- Botão "Atualizar" alinhado à direita
- Sem card externo — bloco solto no fluxo da página

---

## Hero principal

Componente: `src/features/mentor/components/MentorNextStepHero.tsx`

### Estrutura interna

```
Dark card (gradient #0B1B4D → #1E3A8A → #2563EB, borderRadius: 16px)
├── Content zone (padding: 56px 48px 48px)
│   ├── Eyebrow: "Seu próximo passo agora" (11px, uppercase, branco/38%)
│   ├── h2: título (clamp 28px–42px, bold, branco)
│   └── p: descrição (15px, line-height 1.85, branco/60%, max-width 520px)
└── Action bar (border-top branco/10%, padding: 28px 48px 36px)
    ├── LEFT: UrgencyBadge + topic badge
    └── RIGHT: CTA primário (branco, shadow) + CTA ghost (border branco/22%)
```

### Regras do hero

- A altura vem de conteúdo + padding real. Não usar `min-height` como substituto
- Conteúdo e ações nunca ficam no mesmo container (sempre border-top separando)
- Título usa `clamp(28px, 3.5vw, 42px)` — escala fluida, nunca pequeno demais
- `maxWidth: 640px` no título, `maxWidth: 520px` na descrição

---

## Chat

Componente: `src/features/mentor/components/MentorChat.tsx`

### Estrutura interna

```
Section label (fora do card — padrão Home)
White card (borderRadius: 12px, border: #E8ECF2, shadow: 0 2px 8px)
├── Zone A: Messages (bg: #F7F9FD, padding: 32px, gap: 28px)
│   ├── Opening message
│   │   ├── Avatar (36x36, #EBF0FA)
│   │   └── Bubble (bg white, border #E8ECF2, padding: 20px 24px)
│   │       + Quick prompts (label "Atalhos rápidos" + chips)
│   ├── Conversation history (role === 'assistant' → white bubble | role === 'user' → #0D1B3E)
│   ├── Empty state (dashed border, padding: 18px 22px)
│   └── Sending indicator (bounce dots)
└── Zone B: Composer (bg white, border-top: #E8ECF2, padding: 28px 32px 32px)
    ├── Textarea (min-height: 120px, bg #F7F9FD, focus → bg white + border #2E5FD4)
    └── Footer (hint text esquerda | botão "Enviar" direita)
```

### Section label

```typescript
// Fora do card, acima dele — igual à Home
{
  fontSize: '13px',
  fontWeight: 600,
  color: '#6B7280',
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  margin: '0 0 16px 0',
}
```

### Avatares

- 36×36px, `borderRadius: 50%`, `backgroundColor: #EBF0FA`, `color: #2E5FD4`
- Brain icon para o mentor, UserRound para o usuário

### Quick prompts (chips)

- `borderRadius: 999px`, `border: 1px solid #E8ECF2`, `backgroundColor: #FFFFFF`
- `padding: 8px 16px`, `fontSize: 12px`, `fontWeight: 600`
- Hover: border → `rgba(46,95,212,0.35)`, color → `#2E5FD4`, translateY(-1px)

### Mensagens

- Max-width: 80% da coluna
- Assistente: `backgroundColor: #FFFFFF`, `border: 1px solid #E8ECF2`, `padding: 16px 20px`
- Usuário: `backgroundColor: #0D1B3E`, cor do texto `#FFFFFF`, sem border

---

## Card de ação rápida

Componente: `src/features/mentor/components/MentorQuickActionCard.tsx`

### Estrutura (idêntica à Home)

```
White card (borderRadius: 12px, border: #E8ECF2, shadow: 0 2px 8px)
├── Header (padding: 20px 20px 16px, border-bottom: #E8ECF2)
│   ├── Dot de prioridade (8px, cor por tipo)
│   ├── Label de prioridade (11px, uppercase, #9CA3AF)
│   └── h3: título (14px, fontWeight 600, #1A1F2E)
├── Body (padding: 16px 20px)
│   └── p: descrição (13px, line-height 1.75, #6B7280)
└── Footer (padding: 14px 20px 20px, border-top: #E8ECF2)
    └── CTA full-width (#EBF0FA → hover #2E5FD4 com cor branca)
```

### Cores de prioridade

| Prioridade | Cor do dot |
|---|---|
| high | `#EF4444` |
| medium | `#F59E0B` |
| low | `#D1D5DB` |

### Card featured (ação principal)

- `border: 1px solid rgba(46,95,212,0.20)`
- `boxShadow: 0 4px 16px rgba(46,95,212,0.08)`
- Label exibe "Ação principal" em vez da prioridade

---

## Sidebar de ações (Decision Panel)

Componente: `src/features/mentor/components/MentorDecisionPanel.tsx`

- Section label idêntico ao Chat (fora do card, mesmo estilo)
- Cards empilhados verticalmente com `gap: 16px`
- Estado vazio: `border: 1px dashed #E8ECF2`, `borderRadius: 12px`, `padding: 28px 24px`
- Largura no grid: 400px fixos — mínimo funcional para texto de 2-3 linhas sem espreme

---

## Grid principal

Definido em `MentorScreen.tsx`:

```tsx
<div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_400px]">
```

- Ativa em `xl` (1280px), não em `lg` (1024px)
- Motivo: com sidebar global de ~240px, em 1024px o espaço disponível é ~736px — insuficiente para duas colunas funcionais
- Em xl (1280px): espaço disponível ~992px → chat fica com ~560px, sidebar com 400px
- `minmax(0, 1fr)` na coluna de chat evita overflow silencioso de conteúdo

---

## Escala de espaçamento

| Elemento | Valor |
|---|---|
| Gap entre seções principais | 32px |
| Padding do hero (conteúdo) | 56px top / 48px lateral / 48px bottom |
| Padding da action bar do hero | 28px top / 48px lateral / 36px bottom |
| Padding Zone A do chat | 32px todos os lados |
| Padding Zone B do chat | 28px top / 32px lateral / 32px bottom |
| Padding header do card | 20px top / 20px lateral / 16px bottom |
| Padding body do card | 16px top–bottom / 20px lateral |
| Padding footer do card | 14px top / 20px lateral / 20px bottom |
| Gap entre cards na sidebar | 16px |

---

## Cores literais usadas

| Elemento | Valor |
|---|---|
| Card background | `#FFFFFF` |
| Card border | `#E8ECF2` |
| Card shadow | `0 2px 8px rgba(0,0,0,0.06)` |
| Page background (Zone A chat) | `#F7F9FD` |
| Texto principal | `#1A1F2E` |
| Texto secundário | `#374151` |
| Texto de suporte | `#6B7280` |
| Texto placeholder/muted | `#9CA3AF` |
| Accent (azul) | `#2E5FD4` |
| Accent soft | `#EBF0FA` |
| Primary dark | `#0D1B3E` |

---

## Microinterações

Padrão recorrente em todos os elementos interativos:

```typescript
// Hover
transform: 'translateY(-1px)'
boxShadow: aumentado levemente

// Active
transform: 'scale(0.97)'

// Transição
transition: 'all 0.15s'
```

---

## Diretrizes para futuras alterações

1. Qualquer mudança de spacing deve ser verificada contra os valores da Home
2. Não adicionar `min-height` artificial — se o conteúdo parece vazio, o problema é de conteúdo ou de padding insuficiente
3. Novos cards devem sempre ter header/body/footer como zonas distintas
4. Section labels sempre fora do card, nunca como primeiro filho
5. CTAs nunca misturados com texto descritivo — sempre em zona própria separada por border
6. Grid de duas colunas só ativa em `xl:` para preservar espaço mínimo de 560px para o chat
7. Se a UI parecer comprimida após 3 patches: consultar `docs/ui-rebuild-guide.md`
