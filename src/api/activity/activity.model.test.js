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
  const Activity = Guide.discriminator('Activity', schema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  getKeywords.reset()
  const activity = await Activity.create({ user, title: 'test', date: Date.now() })

  t.context = { ...t.context, Activity, User, Tag, activity, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { activity, user } = t.context
  const view = activity.view()
  t.true(typeof view === 'object')
  t.true(view.id === activity.id)
  t.true(typeof view.user === 'object')
  t.true(view.user.id === user.id)
  t.true(view.date.toISOString() === activity.date.toISOString())
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
