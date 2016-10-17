import { stub } from 'sinon'
import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import express from '../../config/express'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Activity } from '.'

const app = () => express(routes)
stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, anotherUser, userSession, anotherSession, challenge, activity

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  challenge = await Challenge.create({ user, title: 'test' })
  activity = await Activity.create({ user, challenge, title: 'test' })
})

test('POST /activities 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, title: 'test', description: 'test', date: '2016-05-01' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.title).toBe('test')
  expect(body.description).toBe('test')
  expect(body.date).toBe(new Date('2016-05-01').toISOString())
})

test('POST /activities 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /activities 200 - inexistent users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /activities 200 - users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /activities 200 - inexistent challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /activities 200 - challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /activities 200 - inexistent guides', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /activities 200 - guides', async () => {
  const anotherActivity = await Activity.create({ user, title: 'test' })
  await activity.update({ $addToSet: { guides: anotherActivity } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherActivity.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('POST /activities 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /activities 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /activities/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${activity.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(activity.id)
})

test('GET /activities/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /activities/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, title: 'test2', description: 'test2', date: '2016-05-01' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(activity.id)
  expect(body.title).toBe('test2')
  expect(body.description).toBe('test2')
  expect(typeof body.user).toBe('object')
  expect(body.date).toBe(new Date('2016-05-01').toISOString())
})

test('PUT /activities/:id 200 (user) - add guide', async () => {
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, guides: anotherActivity.id })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(activity.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length).toBe(1)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherActivity.id.toString())
})

test('PUT /activities/:id 200 (user) - add guide with already 1 guide', async () => {
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const anotherActivity2 = await Activity.create({ user, title: 'test', guides: [anotherActivity] })
  const { status, body } = await request(app())
    .put(`/${anotherActivity2.id}`)
    .send({ access_token: userSession, guides: `+${activity.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherActivity2.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id === activity.id.toString()).toBe(true)
})

test('PUT /activities/:id 200 (user) - add 2 guides', async () => {
  const anotherActivity = await Activity.create({ user, title: 'test' })
  const anotherActivity2 = await Activity.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: userSession, guides: `${anotherActivity.id},${anotherActivity2.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(activity.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherActivity.id.toString())
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id).toBe(anotherActivity2.id.toString())
})

test('PUT /activities/:id 200 (user) - remove guide', async () => {
  const anotherActivity = await Activity.create({ user, title: 'test', guides: [activity] })
  expect(Array.isArray(anotherActivity.view().guides)).toBe(true)
  expect(anotherActivity.view().guides.length).toBe(1)
  const { status, body } = await request(app())
    .put(`/${anotherActivity.id}`)
    .send({ access_token: userSession, guides: `-${activity.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherActivity.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 0).toBe(true)
})

test('PUT /activities/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${activity.id}`)
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(401)
})

test('PUT /activities/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${activity.id}`)
  expect(status).toBe(401)
})

test('PUT /activities/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(404)
})

test('DELETE /activities/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${activity.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /activities/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${activity.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /activities/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${activity.id}`)
  expect(status).toBe(401)
})

test('DELETE /activities/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
