import { getColor } from '@/lib/colors'

describe('getColor', () => {
  it('geeft een object terug met bg en text', () => {
    const color = getColor(0)
    expect(color).toHaveProperty('bg')
    expect(color).toHaveProperty('text')
  })

  it('wraps rond na 8 kleuren', () => {
    expect(getColor(0)).toEqual(getColor(8))
    expect(getColor(1)).toEqual(getColor(9))
  })

  it('geeft dezelfde kleur terug voor dezelfde index', () => {
    expect(getColor(3)).toEqual(getColor(3))
  })
})
