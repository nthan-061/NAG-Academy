export const XP = {
  assistir_aula: 20,
  quiz_completado: 30,
  por_acerto: 10,
  flashcard_revisado: 5,
  streak_bonus: 15,
  quiz_perfeito: 50,
} as const

export const NIVEIS = [
  { nivel: 1, nome: 'Aprendiz',     xp_min: 0,    xp_max: 199 },
  { nivel: 2, nome: 'Praticante',   xp_min: 200,  xp_max: 499 },
  { nivel: 3, nome: 'Estrategista', xp_min: 500,  xp_max: 999 },
  { nivel: 4, nome: 'Especialista', xp_min: 1000, xp_max: 1999 },
  { nivel: 5, nome: 'Elite',        xp_min: 2000, xp_max: Infinity },
] as const

export function getNivel(xp: number) {
  return [...NIVEIS].reverse().find((n) => xp >= n.xp_min) ?? NIVEIS[0]
}
