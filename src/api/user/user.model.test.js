import test from 'ava'
import crypto from 'crypto'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const User = mongo.model('User', schema)
  const user = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })

  t.context = { ...t.context, User, user }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { user } = t.context
  const fullView = user.view(true)
  t.true(fullView.id === user.id)
  t.true(fullView.name === user.name)
  t.true(fullView.email === user.email)
  t.true(fullView.picture === user.picture)
  t.true(fullView.createdAt === user.createdAt)
})

test('name', (t) => {
  t.context.user.name = ''
  t.context.user.email = 'test@example.com'
  t.true(t.context.user.name === 'test')
})

test('picture', async (t) => {
  const { user } = t.context
  const hash = crypto.createHash('md5').update(user.email).digest('hex')
  t.true(user.picture === `https://gravatar.com/avatar/${hash}?d=identicon`)

  user.picture = 'test.jpg'
  user.email = 'test@example.com'
  await user.save()
  t.true(user.picture === 'test.jpg')
})

test('authenticate', async (t) => {
  t.truthy(await t.context.user.authenticate('123456'))
  t.falsy(await t.context.user.authenticate('blah'))
})

const serviceUser = {
  id: '123',
  name: 'Test Name',
  email: 'test@test.com',
  picture: 'test.jpg'
}

test('createFromService (facebook) - email already registered', async (t) => {
  const { User, user } = t.context
  const updatedUser = await User.createFromService({
    ...serviceUser,
    service: 'facebook',
    email: 'a@a.com'
  })
  t.true(updatedUser.id === user.id)
  t.true(updatedUser.services.facebook === serviceUser.id)
  t.true(updatedUser.name === serviceUser.name)
  t.true(updatedUser.email === user.email)
  t.true(updatedUser.picture === serviceUser.picture)
})

test('createFromService (facebook) - service id already registered', async (t) => {
  const { User, user } = t.context
  await user.set({ services: { facebook: serviceUser.id } }).save()
  const updatedUser = await User.createFromService({ ...serviceUser, service: 'facebook' })
  t.true(updatedUser.id === user.id)
  t.true(updatedUser.services.facebook === serviceUser.id)
  t.true(updatedUser.name === serviceUser.name)
  t.true(updatedUser.email === user.email)
  t.true(updatedUser.picture === serviceUser.picture)
})

test('createFromService (facebook) - new user', async (t) => {
  const { User, user } = t.context
  const createdUser = await User.createFromService({ ...serviceUser, service: 'facebook' })
  t.true(createdUser.id !== user.id)
  t.true(createdUser.services.facebook === '123')
  t.true(createdUser.name === serviceUser.name)
  t.true(createdUser.email === serviceUser.email)
  t.true(createdUser.picture === serviceUser.picture)
})

test('createFromService (github) - email already registered', async (t) => {
  const { User, user } = t.context
  const updatedUser = await User.createFromService({
    ...serviceUser,
    service: 'github',
    email: 'a@a.com'
  })
  t.true(updatedUser.id === user.id)
  t.true(updatedUser.services.github === serviceUser.id)
  t.true(updatedUser.name === serviceUser.name)
  t.true(updatedUser.email === user.email)
  t.true(updatedUser.picture === serviceUser.picture)
})

test('createFromService (github) - service id already registered', async (t) => {
  const { User, user } = t.context
  await user.set({ services: { github: serviceUser.id } }).save()
  const updatedUser = await User.createFromService({ ...serviceUser, service: 'github' })
  t.true(updatedUser.id === user.id)
  t.true(updatedUser.services.github === serviceUser.id)
  t.true(updatedUser.name === serviceUser.name)
  t.true(updatedUser.email === user.email)
  t.true(updatedUser.picture === serviceUser.picture)
})

test('createFromService (github) - new user', async (t) => {
  const { User, user } = t.context
  const createdUser = await User.createFromService({ ...serviceUser, service: 'github' })
  t.true(createdUser.id !== user.id)
  t.true(createdUser.services.github === '123')
  t.true(createdUser.name === serviceUser.name)
  t.true(createdUser.email === serviceUser.email)
  t.true(createdUser.picture === serviceUser.picture)
})
