# Mentor IA UI

## Objetivo

Este documento descreve exclusivamente a camada visual da pagina **Mentor IA**. O foco aqui e registrar a UI atual, seus padroes de espacamento, hierarquia, componentes, microinteracoes e a relacao com o design system do produto.

Nao cobre backend, logica de negocio ou regras de recomendacao. O objetivo e servir como referencia de interface para refinamentos futuros e manter consistencia com o restante do sistema.

## Referencia de qualidade visual

A pagina **Meu Progresso** foi usada como referencia principal de qualidade visual. A pagina do mentor foi ajustada para compartilhar o mesmo vocabulario de:

- cards com borda suave
- cantos arredondados amplos
- padding generoso
- sombra leve
- ritmo vertical estavel entre blocos
- tipografia clara e compacta

## Estrutura da pagina

A composicao visual da pagina esta em `src/features/mentor/components/MentorScreen.tsx`.

Hierarquia atual:

1. Header da pagina
2. Estado de erro, quando necessario
3. Chat do mentor
4. Acoes rapidas

Padrao do container principal:

- `max-w-6xl`
- `mx-auto`
- `px-6 lg:px-8`
- `py-4`
- `flex flex-col gap-6`

Esse container define o limite horizontal e garante que a pagina nao encoste nas bordas.

## Header

Componente: `src/features/mentor/components/MentorHeader.tsx`

Responsabilidade visual:

- introduzir a pagina
- exibir o titulo principal
- resumir o estado atual em badges

Padroes:

- `space-y-6` no bloco geral
- `max-w-4xl`
- titulo principal em `text-[28px] md:text-[34px]`
- badges com `gap-3.5`

Elementos visuais:

- label superior `Mentor IA`
- titulo principal: `Converse e aja no proximo passo certo.`
- badges:
  - status geral
  - problema principal
  - foco atual

O header nao usa card. Ele funciona como abertura leve da tela.

## Botao de atualizar

Local: `MentorScreen.tsx`

Padrao visual:

- variante `outline`
- `shadow-sm`
- `transition-all duration-200`
- hover com leve elevacao
- hover com leve ganho de brilho
- active com pequena reducao de escala

Objetivo:

- transmitir interatividade sem competir com o chat

## Estado de erro

Local: `MentorScreen.tsx`

Padroes:

- `rounded-[20px]`
- `border border-danger/20`
- `bg-danger-soft`
- `px-7 py-6`
- `shadow-[0_16px_40px_rgba(10,22,40,0.05)]`

Tipografia:

- titulo do erro em `text-sm font-semibold`
- descricao com `leading-relaxed`

## Chat do mentor

Componente: `src/features/mentor/components/MentorChat.tsx`

O chat e o bloco dominante da pagina.

### Cabecalho do chat

Padroes:

- `section` com `mt-10 space-y-5`
- label da secao
- subtitulo do bloco em `text-[20px] md:text-[24px]`

Esse cabecalho diferencia o chat das acoes rapidas sem competir com o header principal da pagina.

### Card externo do chat

Padroes:

- `rounded-[20px]`
- `border border-border`
- `bg-white`
- `p-7 lg:p-8`
- `gap-6`
- `shadow-[0_16px_40px_rgba(10,22,40,0.05)]`

Esse card define o bloco principal da experiencia.

### Area de mensagens

Padroes:

- `min-h-[620px]`
- `rounded-[20px]`
- `border border-border`
- `bg-[#FCFDFF]`
- `p-7 lg:p-8`
- `shadow-[0_16px_40px_rgba(10,22,40,0.04)]`

Organizacao interna:

- `flex flex-col gap-6`
- mensagens sempre com respiro vertical claro

### Primeira mensagem do mentor

Comportamento:

- sempre comeca preenchida
- usa diagnostico resumido derivado do historico do usuario

Visual:

- avatar em circulo suave com `bg-secondary-soft`
- balao da mensagem com:
  - `rounded-[16px]`
  - `border border-border`
  - `bg-white`
  - `px-6 py-5`
  - `lg:px-7 lg:py-6`
  - sombra leve

### Chips de acao rapida no chat

Uso:

- atalhos iniciais para orientar a conversa

Padrao visual:

- `rounded-full`
- `border-border`
- `bg-white`
- `px-4 py-2.5`
- `text-xs`
- `shadow-sm`

Microinteracoes:

- `transition-all duration-200`
- hover com leve elevacao
- hover com sombra maior
- active com pequena reducao de escala

### Mensagens do chat

As mensagens do historico seguem o mesmo padrao da primeira mensagem.

Padroes:

- `max-w-[85%]`
- `rounded-[16px]`
- `px-6 py-5`
- `lg:px-7 lg:py-6`
- sombra leve

Mensagem do assistente:

- `border border-border`
- `bg-white`
- texto em `text-text-secondary`

Mensagem do usuario:

- `bg-primary`
- texto branco

Tipografia:

- `text-sm`
- `leading-relaxed`
- `md:text-[15px]`

### Estado vazio

Quando ainda nao ha historico de conversa:

- bloco com `border-dashed`
- `rounded-[16px]`
- `bg-white`
- `px-6 py-5`

Funcao:

- reduzir o vazio inicial
- manter orientacao sem parecer erro ou ausencia de dados

### Estado de envio

Enquanto o mentor responde:

- replica a linguagem visual das mensagens do assistente
- usa o mesmo espacamento e bordas para evitar quebra de contexto

## Area de input do chat

Componente: `MentorChat.tsx`

### Container do input

Padroes:

- `rounded-[20px]`
- `border border-border`
- `bg-white`
- `p-7 lg:p-8`
- `shadow-[0_16px_40px_rgba(10,22,40,0.04)]`

Organizacao interna:

- `flex flex-col gap-6`

### Textarea

Padroes:

- `min-h-[168px]`
- `rounded-[16px]`
- `border border-border`
- `bg-background-elevated`
- `px-5 py-4`
- `lg:px-6 lg:py-5`
- `leading-relaxed`

Focus state:

- `focus:border-secondary`
- `focus:ring-2`
- `focus:ring-secondary/15`

Objetivo:

- parecer confortavel
- evitar sensacao de input achatado

### Rodape do input

Elementos:

- texto auxiliar
- botao enviar

Padrao:

- `flex flex-wrap items-end justify-between`
- `gap-6`

### Botao enviar

Padroes:

- `size="lg"`
- sombra de botao
- transicoes suaves

Microinteracoes:

- hover com elevacao leve
- hover com sombra maior
- hover com brilho discreto
- active com `scale-95`

## Acoes rapidas

Componente: `src/features/mentor/components/MentorQuickActions.tsx`

Funcao:

- exibir atalhos secundarios logo abaixo do chat
- manter continuidade de acao sem competir com a conversa

Padroes:

- `section` com `space-y-5`
- titulo em `text-[20px] md:text-[24px]`
- grid com `gap-6 lg:gap-8`

### Grid

Configuracao:

- `md:grid-cols-2`
- `xl:grid-cols-4`

Objetivo:

- manter boa leitura
- evitar cards comprimidos

### Estado sem acoes

Padroes:

- `rounded-[20px]`
- `border border-border`
- `bg-surface`
- `p-7 lg:p-8`
- sombra leve

## Card de acao rapida

Componente: `src/features/mentor/components/MentorQuickActionCard.tsx`

Padrao visual:

- `rounded-[20px]`
- `border border-border`
- `bg-white`
- `p-7 lg:p-8`
- `gap-6`
- `shadow-[0_16px_40px_rgba(10,22,40,0.05)]`

Hierarquia interna:

1. titulo
2. descricao
3. acao

Organizacao:

- bloco de texto com `space-y-4`
- botao com `mt-4`

Tipografia:

- titulo em `text-base font-semibold`
- descricao em `text-sm leading-relaxed`

Microinteracoes:

- `transition-all duration-200`
- `hover:-translate-y-1`
- `hover:shadow-md`

## Botoes e microinteracoes

Padrao recorrente na pagina:

- `transition-all duration-200`
- hover com leve elevacao
- hover com sombra maior
- hover com brilho discreto
- active com `scale-95`

Essas microinteracoes aparecem em:

- botao atualizar
- chips de prompt
- botoes dos cards de acao
- botao enviar

## Escala de espacamento

Padroes recorrentes na pagina:

- espacamento entre secoes principais: `mt-10`, `mt-12`
- espacamento interno de cards: `p-7`, `p-8`
- espacamento entre blocos internos: `gap-6`
- espacamento entre texto e acao: `space-y-4`

Regra geral:

- blocos principais nunca usam padding abaixo de `p-6`
- mensagens nao encostam nas bordas
- textos usam `leading-relaxed`

## Raios e bordas

Padroes visuais usados:

- cards principais: `rounded-[20px]`
- baloes e subcards: `rounded-[16px]`
- chips: `rounded-full`
- bordas sempre suaves com `border-border`

## Sombras

Camadas visuais atuais:

- cards principais: sombra mais longa e suave
- subcards internos: sombra mais leve
- botoes e chips: `shadow-sm` ou `shadow-button`

Objetivo:

- criar profundidade sem pesar a tela

## Cores principais da UI

Baseadas nos tokens do design system:

- `bg-white`
- `bg-background-elevated`
- `bg-secondary-soft`
- `bg-danger-soft`
- `text-foreground`
- `text-text-secondary`
- `text-muted-foreground`
- `bg-primary`

## Arquivos que compoem a UI do Mentor

- `src/features/mentor/components/MentorScreen.tsx`
- `src/features/mentor/components/MentorHeader.tsx`
- `src/features/mentor/components/MentorChat.tsx`
- `src/features/mentor/components/MentorQuickActions.tsx`
- `src/features/mentor/components/MentorQuickActionCard.tsx`

## Diretrizes para futuras alteracoes

- manter o chat como bloco dominante
- preservar padding generoso em cards e subcards
- evitar introduzir containers principais com `p-4` ou menor
- manter o mesmo raio visual usado em Meu Progresso
- toda nova acao visual deve respeitar a hierarquia:
  - header
  - chat
  - acoes rapidas
- toda nova interacao deve usar transicoes suaves e consistentes

## Resumo

A pagina do Mentor IA hoje usa uma linguagem visual baseada em:

- cards claros
- espacamento generoso
- hierarquia curta e direta
- conversa como foco principal
- microinteracoes discretas
- consistencia com a pagina Meu Progresso

Esse documento deve ser atualizado sempre que houver alteracoes relevantes na camada visual da pagina.
