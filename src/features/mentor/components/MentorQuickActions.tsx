import { Button } from '@/components/ui'
import { MENTOR_PRIORITY_ORDER } from '../constants'
import type { MentorRecommendation } from '../types'
import { MentorQuickActionCard } from './MentorQuickActionCard'

interface MentorQuickActionsProps {
  recommendations: MentorRecommendation[]
  onAskMentor: (prompt: string) => void
}

export function MentorQuickActions({
  recommendations,
  onAskMentor,
}: MentorQuickActionsProps) {
  const quickActions = [...recommendations]
    .sort((a, b) => MENTOR_PRIORITY_ORDER[b.priority] - MENTOR_PRIORITY_ORDER[a.priority])
    .slice(0, 4)

  return (
    <section className="space-y-4">
      <div className="max-w-2xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
          Acoes rapidas
        </p>
        <h2 className="text-xl font-bold tracking-[-0.03em] text-foreground">
          Atalhos inteligentes para agir agora
        </h2>
      </div>

      {quickActions.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((recommendation) => (
            <MentorQuickActionCard
              key={recommendation.id}
              recommendation={recommendation}
              onAskMentor={onAskMentor}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm leading-6 text-text-secondary">
              O mentor nao encontrou um atalho prioritario agora. Use a conversa para definir a proxima acao.
            </p>
            <Button
              variant="outline"
              onClick={() => onAskMentor('Quero que voce defina minha proxima acao com base no meu historico recente.')}
            >
              Pedir proximo passo
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
