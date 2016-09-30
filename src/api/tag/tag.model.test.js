import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const Tag = mongo.model('Tag', schema)
  const tag = await Tag.createUnique({ name: 'test' })

  t.context = { ...t.context, Tag, tag }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { tag } = t.context
  const view = tag.view()
  t.true(typeof view === 'object')
  t.true(view.id === tag.id)
  t.true(view.name === tag.name)
})

test('combine tags with same name', async (t) => {
  const { Tag, tag } = t.context
  const anotherTag = await Tag.createUnique({ name: tag.name })
  t.true(anotherTag.id === tag.id)
  t.true(anotherTag.name === tag.name)
})

test('increment', async (t) => {
  const { Tag, tag } = t.context
  t.true(tag.count === 0)
  await Tag.increment([tag])
  t.true((await Tag.findById(tag.id)).count === 1)
  await Tag.increment([tag], 3)
  t.true((await Tag.findById(tag.id)).count === 4)
  t.falsy(await Tag.increment([]))
})
