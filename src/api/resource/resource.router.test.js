import { stub } from 'sinon'
import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import * as meta from '../../services/meta'
import express from '../../config/express'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Resource } from '.'

const app = () => express(routes)
stub(watson, 'getKeywords', () => ['k1', 'k2'])
stub(meta, 'getMeta', () => Promise.resolve({ prop: 'value' }))

let user, anotherUser, userSession, anotherSession, challenge, resource

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  challenge = await Challenge.create({ user, title: 'test' })
  resource = await Resource.create({ user, challenge, title: 'test' })
})

test('POST /resources 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({
      access_token: userSession,
      title: 'test',
      description: 'test',
      url: 'test.com',
      mediaType: 'website',
      image: 'test.jpg'
    })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.title).toBe('test')
  expect(body.description).toBe('test')
  expect(body.url).toBe('test.com')
  expect(body.mediaType).toBe('website')
  expect(body.image).toBe('test.jpg')
})

test('POST /resources 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /resources/meta 200', async () => {
  const { status, body } = await request(app())
    .get('/meta')
    .query({ url: 'test.com' })
  expect(status).toBe(200)
  expect(body.prop).toBe('value')
})

test('GET /resources/meta 400 - missing url', async () => {
  const { status } = await request(app())
    .get('/meta')
  expect(status).toBe(400)
})

test('GET /resources 200 - inexistent users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /resources 200 - users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /resources 200 - inexistent challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /resources 200 - challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /resources 200 - inexistent guides', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /resources 200 - guides', async () => {
  const anotherResource = await Resource.create({ user, title: 'test' })
  await resource.update({ $addToSet: { guides: anotherResource } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherResource.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('POST /resources 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /resources 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /resources/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${resource.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(resource.id)
})

test('GET /resources/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /resources/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: userSession, title: 'test2', description: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(resource.id)
  expect(body.title).toBe('test2')
  expect(body.description).toBe('test2')
  expect(typeof body.user).toBe('object')
})

test('PUT /resources/:id 200 (user) - add guide', async () => {
  const anotherResource = await Resource.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: userSession, guides: anotherResource.id })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(resource.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length).toBe(1)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherResource.id.toString())
})

test('PUT /resources/:id 200 (user) - add guide with already 1 guide', async () => {
  const anotherResource = await Resource.create({ user, title: 'test' })
  const anotherResource2 = await Resource.create({ user, title: 'test', guides: [anotherResource] })
  const { status, body } = await request(app())
    .put(`/${anotherResource2.id}`)
    .send({ access_token: userSession, guides: `+${resource.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherResource2.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id === resource.id.toString()).toBe(true)
})

test('PUT /resources/:id 200 (user) - add 2 guides', async () => {
  const anotherResource = await Resource.create({ user, title: 'test' })
  const anotherResource2 = await Resource.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: userSession, guides: `${anotherResource.id},${anotherResource2.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(resource.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherResource.id.toString())
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id).toBe(anotherResource2.id.toString())
})

test('PUT /resources/:id 200 (user) - remove guide', async () => {
  const anotherResource = await Resource.create({ user, title: 'test', guides: [resource] })
  expect(Array.isArray(anotherResource.view().guides)).toBe(true)
  expect(anotherResource.view().guides.length).toBe(1)
  const { status, body } = await request(app())
    .put(`/${anotherResource.id}`)
    .send({ access_token: userSession, guides: `-${resource.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherResource.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 0).toBe(true)
})

test('PUT /resources/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(401)
})

test('PUT /resources/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${resource.id}`)
  expect(status).toBe(401)
})

test('PUT /resources/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(404)
})

test('DELETE /resources/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${resource.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /resources/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${resource.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /resources/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${resource.id}`)
  expect(status).toBe(401)
})

test('DELETE /resources/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
