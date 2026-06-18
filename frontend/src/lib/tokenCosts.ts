export const TOKEN_COSTS = {
  analysis: 20,
  simulation: 10,
  maxPotential: 20,
} as const

export function tokenCostLabel(cost: number) {
  return `${cost} tokens`
}
