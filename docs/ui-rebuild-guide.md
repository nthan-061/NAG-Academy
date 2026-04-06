# Guia de Rebuild de UI — Nathan Academy

Este documento registra os aprendizados do processo de reconstrução da aba Mentor e estabelece os critérios e protocolos para futuras correções de UI neste projeto.

Serve como guia operacional permanente — não como documentação de design genérica.

---

## 1. O problema que existia antes

### Por que ajustes pequenos não funcionavam

A aba Mentor passou por múltiplas rodadas de ajuste incremental (6+) sem resultado satisfatório. Os patches falhavam porque tratavam sintomas em vez de causas:

- Trocar `px-4` por `px-6` não resolve uma composição que não tem hierarquia
- Aumentar `gap` não resolve um hero que collapsa por não ter `min-height`
- Ajustar `font-size` não resolve um grid que ativa no breakpoint errado
- Nenhum remendo em Tailwind corrige uma estrutura de markup que distribui conteúdo e ações no mesmo container

**Regra:** quando uma UI tem problemas em múltiplos patches consecutivos, o problema é estrutural. Ajuste incremental piora — não melhora — porque acumula hacks em cima de uma base ruim.

### Sinais de que a UI estava estruturalmente ruim

Esses sinais apareceram na aba Mentor e devem ser reconhecidos rapidamente no futuro:

| Sintoma visual | O que indica estruturalmente |
|---|---|
| Hero "achatado" ou parecendo banner | Sem min-height real; padding insuficiente; ausência de hierarquia interna |
| Texto encostando nas bordas do card | Padding interno inadequado ou ausente em alguma zona |
| Conteúdo e CTAs disputando espaço | Sem separação explícita entre zona de conteúdo e zona de ação |
| Sidebar parecendo estreita/densa | `grid-template-columns` mal calibrado; largura de sidebar insuficiente para o conteúdo |
| Sensação de "patch" em vez de layout | Markup acumulou workarounds; estrutura não foi pensada do zero |
| Grid quebrando em viewports inesperadas | Breakpoint sem levar em conta largura do sidebar (sidebar consome ~240px do viewport) |
| Cards sem hierarchy clara | Sem separação visual entre header, body e footer do card |
| Chat parecendo uma caixa funcional | Sem separação entre zona de mensagens e zona de composer |

### A raiz do problema específico (Mentor)

O problema raiz era que **cada componente usava Tailwind com valores que não eram verificados contra a Home**. Valores como `px-12` geravam 48px teoricamente, mas quando havia containers intermediários, max-widths ou gaps não contabilizados, o resultado no render era diferente do esperado.

A correção definitiva foi usar **os mesmos valores em pixel que a Home usa**, escritos como inline styles — eliminando toda ambiguidade de compilação/cascata de Tailwind.

---

## 2. A decisão de rebuild

### Quando abandonar ajuste incremental e optar por rebuild

Faça rebuild visual completo quando:

- [ ] O mesmo problema reapareceu após 3+ patches consecutivos
- [ ] Cada patch adicionou classes de workaround sem resolver a estrutura
- [ ] O markup atual tem múltiplos containers intermediários sem função clara
- [ ] Os breakpoints usados não correspondem ao espaço real disponível (ex: esquecer sidebar)
- [ ] A UI parece visivelmente pior depois de patches do que antes
- [ ] O gap entre a qualidade da página problema e a página de referência continua igual após ajustes

### Como preservar lógica durante o rebuild visual

O split correto é:

```
PRESERVAR                         REESCREVER
─────────────────────────────     ─────────────────────────────
hooks (useMentor, etc.)           MentorScreen.tsx (layout)
types (MentorRecommendation, etc) MentorNextStepHero.tsx (hero)
lógica de negócio                 MentorChat.tsx (chat)
handlers (sendMessage, etc.)      MentorDecisionPanel.tsx (sidebar)
integrações Supabase              MentorQuickActionCard.tsx (cards)
estado local (useState)           MentorQuickActions.tsx (se necessário)
props interfaces                  Qualquer wrapper intermediário ruim
```

**Prática:** ler os arquivos atuais apenas para extrair as props, handlers e lógica. Descartar o JSX/TSX. Reescrever o JSX do zero usando a página de referência como template estrutural.

---

## 3. Os princípios da aba Início (Home) como referência

A aba Início (`src/pages/Dashboard.tsx`) é a referência permanente de qualidade visual neste projeto. Os valores abaixo são extraídos diretamente do código dela.

### Valores exatos de referência

```typescript
// Card base — copiar exatamente estes valores
const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  border: '1px solid #E8ECF2',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}

// Card header
padding: '20px 20px 16px 20px'
borderBottom: '1px solid #E8ECF2'

// Card body
padding: '24px'

// Card footer / action area
borderTop: '1px solid #E8ECF2'
padding: '14px 20px 20px'

// Section label (fora do card)
fontSize: '13px'
fontWeight: 600
color: '#6B7280'
letterSpacing: '0.05em'
textTransform: 'uppercase'
margin: '0 0 16px 0'

// Root page container
display: 'flex'
flexDirection: 'column'
gap: '32px'  // equivale ao gap-8 do Tailwind (32px)
```

### Princípios extraídos da Home

**Ritmo vertical:** cada seção tem gap de 32px do próximo. Nenhum bloco principal usa menos de 24px de padding interno.

**Hierarquia de card:** todo card tem três zonas explícitas: header (com label/título), body (conteúdo), footer (CTA). Separadas por `border-bottom` ou `border-top`. Nunca misturadas no mesmo container.

**Section label fora do card:** o label de seção ("Continue aprendendo", "Domínio por tema") fica fora do card, acima dele. Nunca dentro como primeiro filho.

**CTAs têm área própria:** nenhum botão aparece misturado com texto descritivo no mesmo padding zone. CTAs ficam no footer do card, separados por border-top.

**Contenção de texto:** títulos principais têm `maxWidth` explícito. Textos descritivos usam `lineHeight: 1.8` ou maior. Nenhum parágrafo ultrapassa 640px de largura.

**Grid simples:** Home usa `gridTemplateColumns: '1fr 1fr'` para dois blocos de mesmo peso. Nenhum grid complexo.

**Cores literais:** a Home usa valores hex literais (`#1A1F2E`, `#6B7280`, `#E8ECF2`) — não tokens CSS variáveis. Em rebuild, usar os mesmos valores hex garante paridade visual exata.

---

## 4. Arquitetura visual final da aba Mentor

Esta é a composição que foi validada como "resolvida" após o rebuild.

### Estrutura de página

```
MentorScreen
├── MentorHeader          (command bar: título + status + atualizar)
├── Error banner          (condicional, border #E8ECF2/danger)
├── MentorNextStepHero    (hero dark, full width)
└── Grid xl:[1fr_400px]
    ├── MentorChat        (coluna dominante)
    └── MentorDecisionPanel (sidebar 400px)
```

### Hero (`MentorNextStepHero`)

```
┌─────────────────────────────────────────────────┐
│ Content zone (padding: 56px 48px 48px)          │
│   eyebrow: "Seu próximo passo agora"            │
│   h2: título grande (clamp 28px–42px)           │
│   p:  descrição (max-width 520px)               │
├─────────────────────────────────────────────────┤  border-top
│ Action bar (padding: 28px 48px 36px)            │
│   LEFT: badges urgência + tópico               │
│   RIGHT: CTA primário (branco) + CTA ghost     │
└─────────────────────────────────────────────────┘
```

**Regra do hero:** a altura vem do conteúdo + padding real. Não use `min-height` como substituto de padding adequado.

### Chat (`MentorChat`)

```
Section label (fora do card)
┌─────────────────────────────────────────────────┐
│ Zone A: Messages (bg #F7F9FD, padding: 32px)    │
│   [Avatar] Bubble inicial (px-24 py-20)         │
│            Quick prompts com label própria      │
│   [Avatar] Mensagens do histórico               │
│   Estado vazio (dashed border)                  │
│   Indicador de envio                            │
├─────────────────────────────────────────────────┤  border-top
│ Zone B: Composer (bg white, padding: 28px 32px) │
│   Textarea (min-height: 120px)                  │
│   Footer: hint text esquerda | botão direita    │
└─────────────────────────────────────────────────┘
```

### Cards laterais (`MentorQuickActionCard`)

```
┌─────────────────────────────────────────────────┐
│ Header (padding: 20px 20px 16px, border-bottom) │
│   dot + label de prioridade                     │
│   título do card                                │
├─────────────────────────────────────────────────┤
│ Body (padding: 16px 20px)                       │
│   descrição (line-height: 1.75)                 │
├─────────────────────────────────────────────────┤  border-top
│ Footer (padding: 14px 20px 20px)               │
│   CTA full-width (#EBF0FA → hover #2E5FD4)     │
└─────────────────────────────────────────────────┘
```

### Grid principal

- `xl:grid-cols-[minmax(0,1fr)_400px]` — sidebar 400px (mínimo funcional para cards com texto)
- Ativa em `xl` (1280px) — não em `lg` (1024px), pois com sidebar do layout global (~240px) o viewport disponível em 1024px é ~736px — insuficiente para dois blocos
- Abaixo de xl: coluna única, sidebar empilha abaixo do chat

---

## 5. Checklist para futuras correções de UI

### Antes de qualquer correção, diagnosticar

- [ ] Qual é a página de referência? (→ usar a Home como benchmark)
- [ ] Quanto do problema é estrutural vs cosmético?
- [ ] Quantos patches já foram feitos sem resolver?
- [ ] O markup atual tem containers desnecessários?
- [ ] Os breakpoints levam em conta a sidebar do layout global (~240px)?
- [ ] Os valores de spacing/padding foram verificados contra a Home?

### Quando insistir em ajuste incremental (refino)

- O problema está isolado em 1-2 classes específicas
- A composição geral está correta e visualmente estável
- O feedback é sobre detalhe ("esse texto poderia ser um pouco maior")
- Menos de 3 tentativas de patch foram feitas

### Quando partir para rebuild completo

- 3+ patches consecutivos sem resolver o problema central
- O problema afeta hero, chat E sidebar ao mesmo tempo (sistêmico)
- A composição visual da página parece fundamentalmente diferente da Home
- Cada patch adiciona workaround em vez de resolver causa
- O markup tem múltiplos wrappers intermediários sem função

### Sinais de compressão visual

- Texto tocando a borda de um card (padding insuficiente)
- Hero com altura menor que ~200px no desktop
- Grid ativando em viewport onde chat fica com menos de 400px
- Botões com `padding < 10px` vertical
- Line-height abaixo de 1.6 em texto de parágrafo

### Sinais de hierarchy ruim

- CTA no mesmo container que texto descritivo, sem separação
- Section label dentro do card em vez de fora
- Título e descrição sem gap entre si
- Card sem header/body/footer definidos

### Sinais de grid mal calibrado

- Sidebar com menos de 360px (cards ficam espremidos)
- Grid ativando em `lg:` sem considerar sidebar global de 240px
- `grid-cols` com valores fixos pequenos em vez de `minmax(0, 1fr)`
- Coluna de chat sem `minWidth: 0` (causa overflow silencioso)

---

## 6. Playbook de prompt para rebuild de UI

Use este bloco como template de instrução para futuros agentes quando for necessário reconstruir uma página:

```
Quero que você reconstrua a UI da página [X] do zero.

Regras obrigatórias:
1. Preserve lógica, hooks, handlers, estado e integrações existentes
2. Leia src/pages/Dashboard.tsx como referência de qualidade — copie seus
   valores de padding, border, borderRadius, shadow, gap e cores literalmente
3. Descarte a composição visual atual se ela estiver impedindo uma solução real
4. Não faça patch incremental — reconstrua o markup de ponta a ponta
5. Use inline styles para valores críticos (padding, border, shadow, color)
   para eliminar ambiguidade de Tailwind vs render real

Arquivos para ler antes de implementar:
- src/pages/Dashboard.tsx      ← benchmark de qualidade
- src/components/layout/PageLayout.tsx  ← entender container externo
- [arquivos da feature]        ← extrair lógica/props/handlers

Estrutura de página que quero:
- [header da seção]
- [hero ou bloco principal]
- [grid com coluna dominante + sidebar]
- [componente principal]
- [componente secundário]

Critérios de aceitação:
- Hero não achatado (altura vem de conteúdo + padding real, não min-height hack)
- Textos com respiro (padding mínimo 20px nas bordas dos cards)
- Cards com header/body/footer separados por border
- Section labels fora dos cards
- CTAs em zona própria, separados de texto por border
- Grid ativa apenas em viewport onde ambas as colunas têm largura confortável
- Aparência consistente com a Home
```

---

## 7. Critérios de aceitação visual para este projeto

Uma UI é considerada **resolvida** quando atende todos estes critérios:

### Hero
- [ ] Não parece um banner baixo
- [ ] Título tem pelo menos 28px e espaço para respirar acima e abaixo
- [ ] Conteúdo textual não compete visualmente com os CTAs
- [ ] Badges/contexto têm área separada dos botões de ação
- [ ] Padding lateral mínimo de 40px no desktop

### Cards
- [ ] Header, body e footer são zonas visualmente distintas
- [ ] Texto não encosta nas bordas (padding mínimo 16px horizontal, 14px vertical)
- [ ] CTA tem border-top separando do body
- [ ] Largura suficiente para texto de 2-3 linhas sem quebra excessiva

### Chat
- [ ] Section label fora do card
- [ ] Zona de mensagens e zona de composer são claramente separadas (border-top)
- [ ] Textarea tem altura suficiente para o usuário se sentir confortável (min 100px)
- [ ] Botão de envio alinhado, não "encaixado de última hora"
- [ ] Quick prompts têm espaço próprio e label identificando o grupo

### Sidebar
- [ ] Largura mínima de 360px (400px preferível)
- [ ] Ativa apenas quando há espaço real disponível
- [ ] Cards não ficam espremidos na largura disponível

### Página geral
- [ ] Gap entre seções principais de 28-32px
- [ ] Section labels seguem o padrão da Home (fora do card, uppercase, 13px, #6B7280)
- [ ] Nenhum elemento visualmente "perdido" em área grande vazia
- [ ] Aparência equivalente à aba Início em termos de acabamento

---

## Referências cruzadas

- **Benchmark de qualidade:** `src/pages/Dashboard.tsx`
- **Composição atual da Mentor:** `docs/mentor-ui.md`
- **Container de layout:** `src/components/layout/PageLayout.tsx`
- **Componentes da feature Mentor:** `src/features/mentor/components/`
