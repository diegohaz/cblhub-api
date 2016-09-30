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
  const Resource = Guide.discriminator('Resource', schema)
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  getKeywords.reset()
  const resource = await Resource.create({
    user,
    title: 'test',
    url: 'http://test.com',
    mediaType: 'website',
    image: 'http://test.com/test.jpg'
  })

  t.context = { ...t.context, Resource, User, Tag, resource, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { resource, user } = t.context
  const view = resource.view()
  t.true(typeof view === 'object')
  t.true(view.id === resource.id)
  t.true(typeof view.user === 'object')
  t.true(view.user.id === user.id)
  t.true(view.url === resource.url)
  t.true(view.mediaType === resource.mediaType)
  t.true(view.image === resource.image)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})
