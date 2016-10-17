import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import { User } from '../user'
import routes, { Tag } from '.'

const app = () => express(routes)

let userSession, adminSession, tag

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  tag = await Tag.create({ name: 'test' })
})

test('POST /tags 201 (admin)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: adminSession, name: 'test2' })
  expect(status).toEqual(201)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test2')
})

test('POST /tags 401 (user)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: userSession })
  expect(status).toEqual(401)
})

test('POST /tags 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toEqual(401)
})

test('GET /tags 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toEqual(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /tags/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${tag.id}`)
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(tag.id)
})

test('GET /tags/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toEqual(404)
})

test('PUT /tags/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${tag.id}`)
    .send({ access_token: adminSession, name: 'test2' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(tag.id)
  expect(body.name).toEqual('test2')
})

test('PUT /tags/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`/${tag.id}`)
    .send({ access_token: userSession })
  expect(status).toEqual(401)
})

test('PUT /tags/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${tag.id}`)
  expect(status).toEqual(401)
})

test('PUT /tags/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test2' })
  expect(status).toEqual(404)
})

test('DELETE /tags/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${tag.id}`)
    .query({ access_token: adminSession })
  expect(status).toEqual(204)
})

test('DELETE /tags/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${tag.id}`)
    .query({ access_token: userSession })
  expect(status).toEqual(401)
})

test('DELETE /tags/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${tag.id}`)
  expect(status).toEqual(401)
})

test('DELETE /tags/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toEqual(404)
})
