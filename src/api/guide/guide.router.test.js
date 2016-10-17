import { stub } from 'sinon'
import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import express from '../../config/express'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Guide } from '.'

const app = () => express(routes)
stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, anotherUser, userSession, anotherSession, challenge, guide

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  challenge = await Challenge.create({ user, title: 'test' })
  guide = await Guide.create({ user, challenge, title: 'test' })
})

test('POST /guides 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, title: 'test', description: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.title).toBe('test')
  expect(body.description).toBe('test')
})

test('POST /guides 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /guides 200 - inexistent users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /guides 200 - users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /guides 200 - inexistent challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /guides 200 - challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /guides 200 - inexistent guides', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /guides 200 - guides', async () => {
  const anotherGuide = await Guide.create({ user, title: 'test' })
  await guide.update({ $addToSet: { guides: anotherGuide } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherGuide.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('POST /guides 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /guides 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /guides/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${guide.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(guide.id)
})

test('GET /guides/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /guides/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${guide.id}`)
    .send({ access_token: userSession, title: 'test2', description: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(guide.id)
  expect(body.title).toBe('test2')
  expect(body.description).toBe('test2')
  expect(typeof body.user).toBe('object')
})

test('PUT /guides/:id 200 (user) - add guide', async () => {
  const anotherGuide = await Guide.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${guide.id}`)
    .send({ access_token: userSession, guides: anotherGuide.id })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(guide.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length).toBe(1)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherGuide.id.toString())
})

test('PUT /guides/:id 200 (user) - add guide with already 1 guide', async () => {
  const anotherGuide = await Guide.create({ user, title: 'test' })
  const anotherGuide2 = await Guide.create({ user, title: 'test', guides: [anotherGuide] })
  const { status, body } = await request(app())
    .put(`/${anotherGuide2.id}`)
    .send({ access_token: userSession, guides: `+${guide.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherGuide2.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id === guide.id.toString()).toBe(true)
})

test('PUT /guides/:id 200 (user) - add 2 guides', async () => {
  const anotherGuide = await Guide.create({ user, title: 'test' })
  const anotherGuide2 = await Guide.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${guide.id}`)
    .send({ access_token: userSession, guides: `${anotherGuide.id},${anotherGuide2.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(guide.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherGuide.id.toString())
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id).toBe(anotherGuide2.id.toString())
})

test('PUT /guides/:id 200 (user) - remove guide', async () => {
  const anotherGuide = await Guide.create({ user, title: 'test', guides: [guide] })
  expect(Array.isArray(anotherGuide.view().guides)).toBe(true)
  expect(anotherGuide.view().guides.length).toBe(1)
  const { status, body } = await request(app())
    .put(`/${anotherGuide.id}`)
    .send({ access_token: userSession, guides: `-${guide.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherGuide.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 0).toBe(true)
})

test('PUT /guides/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${guide.id}`)
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(401)
})

test('PUT /guides/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${guide.id}`)
  expect(status).toBe(401)
})

test('PUT /guides/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(404)
})

test('DELETE /guides/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${guide.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /guides/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${guide.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /guides/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${guide.id}`)
  expect(status).toBe(401)
})

test('DELETE /guides/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
