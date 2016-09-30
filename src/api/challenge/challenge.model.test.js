import test from 'ava'
import { stub } from 'sinon'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import * as watson from '../../services/watson'
import { schema } from './'
import { schema as tagSchema } from '../tag'
import { schema as userSchema } from '../user'
import { schema as guideSchema } from '../guide'
import { schema as photoSchema } from '../photo'

let pickColor, getKeywords

test.before((t) => {
  pickColor = stub(photoSchema.methods, 'pickColor', () => '#000000')
  getKeywords = stub(watson, 'getKeywords', () => ['k1', 'k2'])
})

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const Tag = mongo.model('Tag', tagSchema)
  const Guide = mongo.model('Guide', guideSchema)
  const Photo = mongo.model('Photo', photoSchema)
  const User = mongo.model('User', userSchema)
  const Challenge = mongo.model('Challenge', schema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  pickColor.reset()
  getKeywords.reset()
  const challenge = await Challenge.create({
    user,
    title: 'test title',
    bigIdea: 'test big idea',
    essentialQuestion: 'test essential question',
    description: 'test description'
  })

  t.context = { ...t.context, Challenge, challenge, user, Tag, Guide, Photo }
})

test.cb.after.always((t) => {
  pickColor.restore()
  getKeywords.restore()
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { challenge, user } = t.context
  let view = challenge.view()
  t.true(typeof view === 'object')
  t.true(view.id === challenge.id)
  t.true(typeof view.user === 'object')
  t.true(Array.isArray(view.users))
  t.true(view.user.id === user.id)
  t.true(view.title === challenge.title)
  t.true(view.bigIdea === challenge.bigIdea)
  t.true(view.essentialQuestion === challenge.essentialQuestion)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('full view', (t) => {
  const { challenge, user } = t.context
  const view = challenge.view(true)
  t.true(typeof view === 'object')
  t.true(view.id === challenge.id)
  t.true(typeof view.user === 'object')
  t.true(Array.isArray(view.users))
  t.true(view.user.id === user.id)
  t.true(view.title === challenge.title)
  t.true(view.bigIdea === challenge.bigIdea)
  t.true(view.essentialQuestion === challenge.essentialQuestion)
  t.true(view.description === challenge.description)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('set user', (t) => {
  const { challenge } = t.context
  t.true(challenge.users.length === 1)
  challenge.user = null
  t.true(challenge.users.length === 0)
})

test('pre remove', async (t) => {
  const { Guide, challenge, user } = t.context
  await Guide.create({ user, challenge, title: 'test' })
  t.true((await Guide.find({ challenge })).length === 1)
  await challenge.remove()
  t.true((await Guide.find({ challenge })).length === 0)
})

test.serial('call getKeywords', (t) => {
  t.true(getKeywords.calledOnce)
})

test.serial('do not call pickColor', (t) => {
  t.false(pickColor.called)
})

test.serial('call pickColor', async (t) => {
  const { Photo, Challenge, user } = t.context
  const photo = await Photo.create({ title: 'test' })
  await Challenge.create({ user, photo, title: 'test' })
  t.true(pickColor.calledOnce)
})

test.serial('assignTags', async (t) => {
  const { challenge } = t.context
  await challenge.assignTags()
  const { tags } = challenge
  t.true(Array.isArray(tags))
  t.true(tags.length === 2)
})
