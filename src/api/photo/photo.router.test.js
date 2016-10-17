import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import { User } from '../user'
import routes, { Photo } from '.'

const app = () => express(routes)

let userSession, adminSession, photo

beforeEach(async () => {
  const user = await User.create({ email: 'a@a.com', password: '123456' })
  const admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  userSession = signSync(user.id)
  adminSession = signSync(admin.id)
  photo = await Photo.create({ title: 'test' })
})

test('GET /photos 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /photos/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${photo.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(photo.id)
})

test('GET /photos/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /photos/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${photo.id}`)
    .send({ access_token: adminSession, title: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(photo.id)
  expect(body.title).toBe('test2')
})

test('PUT /photos/:id 401 (user)', async () => {
  const { status } = await request(app())
    .put(`/${photo.id}`)
    .send({ access_token: userSession })
  expect(status).toBe(401)
})

test('PUT /photos/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${photo.id}`)
  expect(status).toBe(401)
})

test('PUT /photos/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, title: 'test2' })
  expect(status).toBe(404)
})

test('DELETE /photos/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${photo.id}`)
    .query({ access_token: adminSession })
  expect(status).toBe(204)
})

test('DELETE /photos/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${photo.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(401)
})

test('DELETE /photos/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${photo.id}`)
  expect(status).toBe(401)
})

test('DELETE /photos/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  expect(status).toBe(404)
})
