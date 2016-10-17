import { Tag } from '.'

let tag

beforeEach(async () => {
  tag = await Tag.create({ name: 'test' })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = tag.view()
    expect(typeof view).toEqual('object')
    expect(view.id).toEqual(tag.id)
    expect(view.name).toEqual(tag.name)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = tag.view(true)
    expect(typeof view).toEqual('object')
    expect(view.id).toEqual(tag.id)
    expect(view.name).toEqual(tag.name)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
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
