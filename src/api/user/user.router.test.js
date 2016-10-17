import request from 'supertest-as-promised'
import { masterKey } from '../../config'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import routes, { User } from '.'

const app = () => express(routes)

let user1, user2, admin, session1, session2, adminSession

beforeEach(async () => {
  user1 = await User.create({ name: 'user', email: 'a@a.com', password: '123456' })
  user2 = await User.create({ name: 'user', email: 'b@b.com', password: '123456' })
  admin = await User.create({ email: 'c@c.com', password: '123456', role: 'admin' })
  session1 = signSync(user1.id)
  session2 = signSync(user2.id)
  adminSession = signSync(admin.id)
})

test('GET /users 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession })
  expect(status).toEqual(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /users?page=2&limit=1 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, page: 2, limit: 1 })
  expect(status).toEqual(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toEqual(1)
})

test('GET /users?q=user 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, q: 'user' })
  expect(status).toEqual(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toEqual(2)
})

test('GET /users?fields=name 200 (admin)', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ access_token: adminSession, fields: 'name' })
  expect(status).toEqual(200)
  expect(Array.isArray(body)).toBe(true)
  expect(Object.keys(body[0])).toEqual(['id', 'name'])
})

test('GET /users 401 (user)', async () => {
  const { status } = await request(app())
    .get('/')
    .query({ access_token: session1 })
  expect(status).toEqual(401)
})

test('GET /users 401', async () => {
  const { status } = await request(app())
    .get('/')
  expect(status).toEqual(401)
})

test('GET /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .get('/me')
    .query({ access_token: session1 })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(user1.id)
})

test('GET /users/me 401', async () => {
  const { status } = await request(app())
    .get('/me')
  expect(status).toEqual(401)
})

test('GET /users/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${user1.id}`)
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.id).toEqual(user1.id)
})

test('GET /users/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toEqual(404)
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456' })
  expect(status).toEqual(201)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('d@d.com')
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'user' })
  expect(status).toEqual(201)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('d@d.com')
})

test('POST /users 201 (master)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'admin' })
  expect(status).toEqual(201)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('d@d.com')
})

test('POST /users 409 (master) - duplicated email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'a@a.com', password: '123456' })
  expect(status).toEqual(409)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('email')
})

test('POST /users 400 (master) - invalid email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'invalid', password: '123456' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('email')
})

test('POST /users 400 (master) - missing email', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, password: '123456' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('email')
})

test('POST /users 400 (master) - invalid password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('POST /users 400 (master) - missing password', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('POST /users 400 (master) - invalid role', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: masterKey, email: 'd@d.com', password: '123456', role: 'invalid' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toBe('role')
})

test('POST /users 401 (admin)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: adminSession, email: 'd@d.com', password: '123456' })
  expect(status).toEqual(401)
})

test('POST /users 401 (user)', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ access_token: session1, email: 'd@d.com', password: '123456' })
  expect(status).toEqual(401)
})

test('POST /users 401', async () => {
  const { status } = await request(app())
    .post('/')
    .send({ email: 'd@d.com', password: '123456' })
  expect(status).toEqual(401)
})

test('PUT /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, name: 'test' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
})

test('PUT /users/me 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me')
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('a@a.com')
})

test('PUT /users/me 401', async () => {
  const { status } = await request(app())
    .put('/me')
    .send({ name: 'test' })
  expect(status).toEqual(401)
})

test('PUT /users/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${user1.id}`)
    .send({ access_token: session1, name: 'test' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
})

test('PUT /users/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${user1.id}`)
    .send({ access_token: session1, email: 'test@test.com' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('a@a.com')
})

test('PUT /users/:id 200 (admin)', async () => {
  const { status, body } = await request(app())
    .put(`/${user1.id}`)
    .send({ access_token: adminSession, name: 'test' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.name).toEqual('test')
})

test('PUT /users/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${user1.id}`)
    .send({ access_token: session2, name: 'test' })
  expect(status).toEqual(401)
})

test('PUT /users/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${user1.id}`)
    .send({ name: 'test' })
  expect(status).toEqual(401)
})

test('PUT /users/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test' })
  expect(status).toEqual(404)
})

const passwordMatch = async (password, userId) => {
  const user = await User.findById(userId)
  return !!await user.authenticate(password)
}

test('PUT /users/me/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/me/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put('/me/password')
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('PUT /users/me/password 401 (user) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ access_token: session1, password: '654321' })
  expect(status).toEqual(401)
})

test('PUT /users/me/password 401', async () => {
  const { status } = await request(app())
    .put('/me/password')
    .send({ password: '654321' })
  expect(status).toEqual(401)
})

test('PUT /users/:id/password 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${user1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toEqual(200)
  expect(typeof body).toEqual('object')
  expect(body.email).toEqual('a@a.com')
  expect(await passwordMatch('654321', body.id)).toBe(true)
})

test('PUT /users/:id/password 400 (user) - invalid password', async () => {
  const { status, body } = await request(app())
    .put(`/${user1.id}/password`)
    .auth('a@a.com', '123456')
    .send({ password: '321' })
  expect(status).toEqual(400)
  expect(typeof body).toEqual('object')
  expect(body.param).toEqual('password')
})

test('PUT /users/:id/password 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${user1.id}/password`)
    .auth('b@b.com', '123456')
    .send({ password: '654321' })
  expect(status).toEqual(401)
})

test('PUT /users/:id/password 401 (user) - invalid authentication method', async () => {
  const { status } = await request(app())
    .put(`/${user1.id}/password`)
    .send({ access_token: session1, password: '654321' })
  expect(status).toEqual(401)
})

test('PUT /users/:id/password 401', async () => {
  const { status } = await request(app())
    .put(`/${user1.id}/password`)
    .send({ password: '654321' })
  expect(status).toEqual(401)
})

test('PUT /users/:id/password 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456/password')
    .auth('a@a.com', '123456')
    .send({ password: '654321' })
  expect(status).toEqual(404)
})

test('DELETE /users/:id 204 (admin)', async () => {
  const { status } = await request(app())
    .delete(`/${user1.id}`)
    .send({ access_token: adminSession })
  expect(status).toEqual(204)
})

test('DELETE /users/:id 401 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${user1.id}`)
    .send({ access_token: session1 })
  expect(status).toEqual(401)
})

test('DELETE /users/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${user1.id}`)
  expect(status).toEqual(401)
})

test('DELETE /users/:id 404 (admin)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .send({ access_token: adminSession })
  expect(status).toEqual(404)
})
