export interface CardState {
  intervalo: number
  facilidade: number
  repeticoes: number
}

export type Qualidade = 0 | 1 | 2 // 0=difícil, 1=médio, 2=fácil

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function calcularProximaRevisao(
  card: CardState,
  q: Qualidade
): CardState & { proxima_data: Date } {
  if (q === 0) {
    return { ...card, intervalo: 1, repeticoes: 0, proxima_data: addDays(new Date(), 1) }
  }

  const novaFacilidade = Math.max(
    1.3,
    card.facilidade + (0.1 - (2 - q) * (0.08 + (2 - q) * 0.02))
  )

  let novoIntervalo: number
  if (card.repeticoes === 0) novoIntervalo = 1
  else if (card.repeticoes === 1) novoIntervalo = 6
  else novoIntervalo = Math.round(card.intervalo * novaFacilidade)

  return {
    intervalo: novoIntervalo,
    facilidade: novaFacilidade,
    repeticoes: card.repeticoes + 1,
    proxima_data: addDays(new Date(), novoIntervalo),
  }
}
