import test from 'ava'
import { stub } from 'sinon'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import routes, { Challenge } from './'

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
  t.context = { ...t.context, userSession, anotherSession, adminSession, user, challenge }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Challenge.remove()])
})

test.serial('POST /challenges 201 (user)', async (t) => {
  const { userSession } = t.context
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: userSession,
      title: 'test',
      bigIdea: 'test',
      essentialQuestion: 'test',
      description: 'test'
    })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.title === 'test')
  t.true(body.bigIdea === 'test')
  t.true(body.essentialQuestion === 'test')
  t.true(body.description === 'test')
})

test.serial('POST /challenges 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /challenges 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /challenges 200 - inexistent users', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: '123456789098765432123456' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /challenges 200 - users', async (t) => {
  const { user } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /challenges/:id 200', async (t) => {
  const { challenge } = t.context
  const { status, body } = await request(app())
    .get(`/${challenge.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === challenge.id)
})

test.serial('GET /challenges/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /challenges/:id 200 (user)', async (t) => {
  const { userSession, challenge } = t.context
  const { status, body } = await request(app())
    .put(`/${challenge.id}`)
    .send({
      access_token: userSession,
      title: 'test',
      bigIdea: 'test',
      essentialQuestion: 'test',
      description: 'test'
    })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === challenge.id)
  t.true(body.title === 'test')
  t.true(body.bigIdea === 'test')
  t.true(body.essentialQuestion === 'test')
  t.true(body.description === 'test')
})

test.serial('PUT /challenges/:id 401 (user) - another user', async (t) => {
  const { anotherSession, challenge } = t.context
  const { status } = await request(app())
    .put(`/${challenge.id}`)
    .send({ access_token: anotherSession, title: 'test' })
  t.true(status === 401)
})

test.serial('PUT /challenges/:id 401', async (t) => {
  const { challenge } = t.context
  const { status } = await request(app())
    .put(`/${challenge.id}`)
  t.true(status === 401)
})

test.serial('PUT /challenges/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /challenges/:id 204 (user)', async (t) => {
  const { userSession, challenge } = t.context
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
    .query({ access_token: userSession })
  t.true(status === 204)
})

test.serial('DELETE /challenges/:id 401 (user) - another user', async (t) => {
  const { anotherSession, challenge } = t.context
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
    .send({ access_token: anotherSession })
  t.true(status === 401)
})

test.serial('DELETE /challenges/:id 401', async (t) => {
  const { challenge } = t.context
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
  t.true(status === 401)
})

test.serial('DELETE /challenges/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  t.true(status === 404)
})
