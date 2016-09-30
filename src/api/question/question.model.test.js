import test from 'ava'
import { stub } from 'sinon'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import * as watson from '../../services/watson'
import { schema } from '.'
import { schema as userSchema } from '../user'
import { schema as guideSchema } from '../guide'
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
  const Tag = mongo.model('Tag', tagSchema)
  const Guide = mongo.model('Guide', guideSchema)
  schema.remove('__t')
  const Question = Guide.discriminator('Question', schema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  getKeywords.reset()
  const question = await Question.create({ user, title: 'test' })

  t.context = { ...t.context, Question, User, Tag, question, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { question, user } = t.context
  const view = question.view()
  t.true(typeof view === 'object')
  t.true(view.id === question.id)
  t.true(typeof view.user === 'object')
  t.true(view.user.id === user.id)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
