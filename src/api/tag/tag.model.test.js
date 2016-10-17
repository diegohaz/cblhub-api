import { Tag } from '.'

let tag

beforeEach(async () => {
  tag = await Tag.create({ name: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = tag.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(tag.id)
    expect(view.name).toBe(tag.name)
  })

  it('returns full view', () => {
    const view = tag.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(tag.id)
    expect(view.name).toBe(tag.name)
  })
})

describe('increment', () => {
  it('increments tag count', async () => {
    expect(tag.count).toBe(0)
    await Tag.increment([tag])
    expect((await Tag.findById(tag.id)).count).toBe(1)
    await Tag.increment([tag], 3)
    expect((await Tag.findById(tag.id)).count).toBe(4)
  })

  it('returns nothing when tags has no length', async () => {
    expect(await Tag.increment([])).toBeFalsy()
  })
})
