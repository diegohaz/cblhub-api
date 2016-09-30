import test from 'ava'
import { stub } from 'sinon'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import * as watson from '../../services/watson'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Activity } from '.'

const app = () => express(routes)

test.before(async (t) => {
  watson.getKeywords.restore || stub(watson, 'getKeywords', () => ['k1', 'k2'])
  await mockgoose(mongoose)
  await mongoose.connect('')
})

test.beforeEach(async (t) => {
  const [ user, anotherUser, admin ] = await User.create([
    { email: 'a@a.com', password: '123456' },
    { email: 'b@b.com', password: '123456' },
    { email: 'c@c.com', password: '123456', role: 'admin' }
  ])
  const [ userSession, anotherSession, adminSession ] = [
    signSync(user.id), signSync(anotherUser.id), signSync(admin.id)
  ]
  const challenge = await Challenge.create({ user, title: 'test' })
  const activity = await Activity.create({ user, challenge, title: 'test' })
  t.context = {
    ...t.context,
    anotherUser,
    userSession,
    anotherSession,
    adminSession,
    activity,
    user,
    challenge
  }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Activity.remove(), Challenge.remove()])
})

test.serial('POST /activities 201 (user)', async (t) => {
  const { userSession } = t.context
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, title: 'test', description: 'test', date: '2016-05-01' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.title === 'test')
  t.true(body.description === 'test')
  t.true(body.date === new Date('2016-05-01').toISOString())
})

test.serial('POST /activities 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /activities 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /activities 200 - inexistent users', async (t) => {
  const { anotherUser } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /activities 200 - users', async (t) => {
  const { user } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /activities 200 - inexistent challenges', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /activities 200 - challenges', async (t) => {
  const { challenge } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /activities 200 - inexistent guides', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /activities 200 - guides', async (t) => {
  const { user, activity } = t.context
  const anotherActivity = await Activity.create({ user, title: 'test' })
  await activity.update({ $addToSet: { guides: anotherActivity } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherActivity.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /activities/:id 200', async (t) => {
  const { activity } = t.context
  const { status, body } = await request(app())
    .get(`/${activity.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === activity.id)
})

test.serial('GET /activities/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /activities/:id 200 (user)', async (t) => {
  const { userSession, activity } = t.context
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, title: 'test', description: 'test', date: '2016-05-01' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === activity.id)
  t.true(body.title === 'test')
  t.true(body.description === 'test')
  t.true(body.date === new Date('2016-05-01').toISOString())
})

test.serial('PUT /activities/:id 200 (user) - add guide', async (t) => {
  const { userSession, user, activity } = t.context
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, guides: anotherActivity.id })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === activity.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 1)
  t.true(typeof body.guides[0] === 'object')
  t.true(body.guides[0].id === anotherActivity.id.toString())
})

test.serial('PUT /activities/:id 200 (user) - add guide with already 1 guide', async (t) => {
  const { userSession, user, activity } = t.context
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const anotherActivity2 = await Activity.create({ user, title: 'test', guides: [anotherActivity] })
  const { status, body } = await request(app())
    .put(`/${anotherActivity2.id}`)
    .send({ access_token: userSession, guides: `+${activity.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === anotherActivity2.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 2)
  t.true(typeof body.guides[1] === 'object')
  t.true(body.guides[1].id === activity.id.toString())
})

test.serial('PUT /activities/:id 200 (user) - add 2 guides', async (t) => {
  const { userSession, user, activity } = t.context
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const anotherActivity2 = await Activity.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, guides: `${anotherActivity.id},${anotherActivity2.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === activity.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 2)
  t.true(typeof body.guides[0] === 'object')
  t.true(body.guides[0].id === anotherActivity.id.toString())
  t.true(typeof body.guides[1] === 'object')
  t.true(body.guides[1].id === anotherActivity2.id.toString())
})

test.serial('PUT /activities/:id 200 (user) - remove guide', async (t) => {
  const { userSession, user, activity } = t.context
  const anotherActivity = await Activity.create({ user, title: 'test', guides: [activity] })
  t.true(Array.isArray(anotherActivity.view().guides))
  t.true(anotherActivity.view().guides.length === 1)
  const { status, body } = await request(app())
    .put(`/${anotherActivity.id}`)
    .send({ access_token: userSession, guides: `-${activity.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === anotherActivity.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 0)
})

test.serial('PUT /activities/:id 401 (user) - another user', async (t) => {
  const { anotherSession, activity } = t.context
  const { status } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: anotherSession, title: 'test', description: 'test' })
  t.true(status === 401)
})

test.serial('PUT /activities/:id 401', async (t) => {
  const { activity } = t.context
  const { status } = await request(app())
    .put(`/${activity.id}`)
  t.true(status === 401)
})

test.serial('PUT /activities/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test', description: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /activities/:id 204 (user)', async (t) => {
  const { userSession, activity } = t.context
  const { status } = await request(app())
    .delete(`/${activity.id}`)
    .query({ access_token: userSession })
  t.true(status === 204)
})

test.serial('DELETE /activities/:id 401 (user) - another user', async (t) => {
  const { anotherSession, activity } = t.context
  const { status } = await request(app())
    .delete(`/${activity.id}`)
    .send({ access_token: anotherSession })
  t.true(status === 401)
})

test.serial('DELETE /activities/:id 401', async (t) => {
  const { activity } = t.context
  const { status } = await request(app())
    .delete(`/${activity.id}`)
  t.true(status === 401)
})

test.serial('DELETE /activities/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  t.true(status === 404)
})
