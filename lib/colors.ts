const PALETTE = [
  { bg: '#1a2438', text: '#4f7eff' },
  { bg: '#162216', text: '#4a8a4a' },
  { bg: '#221628', text: '#8a5a8a' },
  { bg: '#221e12', text: '#8a7040' },
  { bg: '#221414', text: '#8a4a4a' },
  { bg: '#12222e', text: '#4a8aaa' },
  { bg: '#1e1428', text: '#7a5aaa' },
  { bg: '#141e22', text: '#4a7a7a' },
]

export function getColor(index: number): { bg: string; text: string } {
  return PALETTE[index % PALETTE.length]
}
