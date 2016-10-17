import { stub } from 'sinon'
import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import express from '../../config/express'
import { User } from '../user'
import routes, { Challenge } from '.'

const app = () => express(routes)
stub(watson, 'getKeywords', () => ['k1', 'k2'])

let userSession, anotherSession, challenge

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  challenge = await Challenge.create({ user, title: 'test' })
})

test('POST /challenges 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: userSession,
      title: 'test',
      bigIdea: 'test',
      essentialQuestion: 'test',
      description: 'test'
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.title).toBe('test')
  expect(body.bigIdea).toBe('test')
  expect(body.essentialQuestion).toBe('test')
  expect(body.description).toBe('test')
  expect(typeof body.user).toBe('object')
})

test('POST /challenges 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /challenges 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /challenges 200 - inexistent users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /challenges 200 - users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: challenge.user.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /challenges/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${challenge.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(challenge.id)
})

test('GET /challenges/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /challenges/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${challenge.id}`)
    .send({ access_token: userSession, title: 'test2', description: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(challenge.id)
  expect(body.title).toBe('test2')
  expect(body.description).toBe('test2')
  expect(typeof body.user).toBe('object')
})

test('PUT /challenges/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${challenge.id}`)
    .send({ access_token: anotherSession, photo: 'test', title: 'test', bigIdea: 'test', essentialQuestion: 'test', description: 'test' })
  expect(status).toBe(401)
})

test('PUT /challenges/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${challenge.id}`)
  expect(status).toBe(401)
})

test('PUT /challenges/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, photo: 'test', title: 'test', bigIdea: 'test', essentialQuestion: 'test', description: 'test' })
  expect(status).toBe(404)
})

test('DELETE /challenges/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /challenges/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /challenges/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${challenge.id}`)
  expect(status).toBe(401)
})

test('DELETE /challenges/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
