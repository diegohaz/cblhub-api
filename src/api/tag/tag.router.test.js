import test from 'ava'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import routes, { Tag } from '.'

const app = () => express(routes)

test.before(async (t) => {
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
  const tag = await Tag.create({ name: 'test' })
  t.context = { ...t.context, userSession, anotherSession, adminSession, tag }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Tag.remove()])
})

test.serial('POST /tags 201 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: adminSession, name: 'test2' })
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.name === 'test2')
})

test.serial('POST /tags 401 (user)', async (t) => {
  const { userSession } = t.context
  const { status } = await request(app())
    .post('/')
    .send({ access_token: userSession })
  t.true(status === 401)
})

test.serial('POST /tags 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /tags 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /tags/:id 200', async (t) => {
  const { tag } = t.context
  const { status, body } = await request(app())
    .get(`/${tag.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === tag.id)
})

test.serial('GET /tags/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /tags/:id 200 (admin)', async (t) => {
  const { adminSession, tag } = t.context
  const { status, body } = await request(app())
    .put(`/${tag.id}`)
    .send({ access_token: adminSession, name: 'test2' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === tag.id)
  t.true(body.name === 'test2')
})

test.serial('PUT /tags/:id 401 (user)', async (t) => {
  const { userSession, tag } = t.context
  const { status } = await request(app())
    .put(`/${tag.id}`)
    .send({ access_token: userSession })
  t.true(status === 401)
})

test.serial('PUT /tags/:id 401', async (t) => {
  const { tag } = t.context
  const { status } = await request(app())
    .put(`/${tag.id}`)
  t.true(status === 401)
})

test.serial('PUT /tags/:id 404 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, name: 'test', count: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /tags/:id 204 (admin)', async (t) => {
  const { adminSession, tag } = t.context
  const { status } = await request(app())
    .delete(`/${tag.id}`)
    .query({ access_token: adminSession })
  t.true(status === 204)
})

test.serial('DELETE /tags/:id 401 (user)', async (t) => {
  const { userSession, tag } = t.context
  const { status } = await request(app())
    .delete(`/${tag.id}`)
    .query({ access_token: userSession })
  t.true(status === 401)
})

test.serial('DELETE /tags/:id 401', async (t) => {
  const { tag } = t.context
  const { status } = await request(app())
    .delete(`/${tag.id}`)
  t.true(status === 401)
})

test.serial('DELETE /tags/:id 404 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  t.true(status === 404)
})
