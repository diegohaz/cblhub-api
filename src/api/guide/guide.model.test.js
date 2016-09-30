import test from 'ava'
import { stub } from 'sinon'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import * as watson from '../../services/watson'
import { schema } from '.'
import { schema as userSchema } from '../user'
import { schema as challengeSchema } from '../challenge'
import { schema as tagSchema } from '../tag'

let getKeywords

test.before((t) => {
  getKeywords = watson.getKeywords.restore
    ? watson.getKeywords
    : stub(watson, 'getKeywords', () => ['k1', 'k2'])
})

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const User = mongo.model('User', userSchema)
  const Challenge = mongo.model('Challenge', challengeSchema)
  const Tag = mongo.model('Tag', tagSchema)
  const Guide = mongo.model('Guide', schema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const challenge = await Challenge.create({ user, title: 'test' })
  getKeywords.reset()
  const guide = await Guide.create({ user, challenge, title: 'test', description: 'test' })

  t.context = { ...t.context, Guide, User, Challenge, Tag, guide, challenge, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { guide, user, challenge } = t.context
  const view = guide.view()
  t.true(typeof view === 'object')
  t.true(view.id === guide.id)
  t.true(typeof view.user === 'object')
  t.true(view.user.id === user.id)
  t.true(typeof view.challenge === 'object')
  t.true(view.challenge.id === challenge.id)
  t.true(Array.isArray(view.tags))
  t.true(view.tags.length === 2)
  t.true(Array.isArray(view.guides))
  t.true(view.title === guide.title)
  t.true(view.description === guide.description)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('pre save - add guide to challenge', async (t) => {
  const { guide, Challenge } = t.context
  const challenge = await Challenge.findById(guide.challenge.id)
  t.true(Array.isArray(challenge.guides))
  t.true(challenge.guides.length === 1)
  t.true(typeof challenge.guides[0] === 'object')
  t.true(challenge.guides[0].toString() === guide.id)
})

test('pre save - add guide to guide', async (t) => {
  const { Guide, guide, user } = t.context
  const anotherGuide = await Guide.create({ user, title: 'test', guides: [guide] })
  const updatedGuide = await Guide.findById(guide.id)
  t.true(typeof updatedGuide === 'object')
  t.true(Array.isArray(updatedGuide.guides))
  t.true(updatedGuide.guides.length === 1)
  t.true(updatedGuide.guides[0].toString() === anotherGuide.id)
})

test('pre remove - remove guide from challenge', async (t) => {
  const { Challenge, challenge, guide } = t.context
  await guide.remove()
  const updatedChallenge = await Challenge.findById(challenge.id)
  t.true(typeof updatedChallenge === 'object')
  t.true(Array.isArray(updatedChallenge.guides))
  t.true(updatedChallenge.guides.length === 0)
})

test('pre remove - remove guide from guide', async (t) => {
  const { Guide, guide, user } = t.context
  let anotherGuide = await Guide.create({ user, title: 'test', guides: [guide] })
  await guide.remove()
  anotherGuide = await Guide.findById(anotherGuide.id)
  t.true(typeof anotherGuide === 'object')
  t.true(Array.isArray(anotherGuide.guides))
  t.true(anotherGuide.guides.length === 0)
})

test.serial('call getKeywords', (t) => {
  t.true(getKeywords.calledOnce)
})

test.serial('assignTags', async (t) => {
  const { guide } = t.context
  await guide.assignTags()
  const { tags } = guide
  t.true(Array.isArray(tags))
  t.true(tags.length === 2)
})
