import test from 'ava'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import routes, { Photo } from '.'

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
  const photo = await Photo.create({ title: 'test' })
  t.context = { ...t.context, userSession, anotherSession, adminSession, photo }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Photo.remove()])
})

test.serial('GET /photos 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /photos/:id 200', async (t) => {
  const { photo } = t.context
  const { status, body } = await request(app())
    .get(`/${photo.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === photo.id)
})

test.serial('GET /photos/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /photos/:id 200 (admin)', async (t) => {
  const { adminSession, photo } = t.context
  const { status, body } = await request(app())
    .put(`/${photo.id}`)
    .send({ access_token: adminSession, title: 'test2' })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === photo.id)
  t.true(body.title === 'test2')
})

test.serial('PUT /photos/:id 401 (user)', async (t) => {
  const { userSession, photo } = t.context
  const { status } = await request(app())
    .put(`/${photo.id}`)
    .send({ access_token: userSession })
  t.true(status === 401)
})

test.serial('PUT /photos/:id 401', async (t) => {
  const { photo } = t.context
  const { status } = await request(app())
    .put(`/${photo.id}`)
  t.true(status === 401)
})

test.serial('PUT /photos/:id 404 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: adminSession, title: 'test2' })
  t.true(status === 404)
})

test.serial('DELETE /photos/:id 204 (admin)', async (t) => {
  const { adminSession, photo } = t.context
  const { status } = await request(app())
    .delete(`/${photo.id}`)
    .query({ access_token: adminSession })
  t.true(status === 204)
})

test.serial('DELETE /photos/:id 401 (user)', async (t) => {
  const { userSession, photo } = t.context
  const { status } = await request(app())
    .delete(`/${photo.id}`)
    .query({ access_token: userSession })
  t.true(status === 401)
})

test.serial('DELETE /photos/:id 401', async (t) => {
  const { photo } = t.context
  const { status } = await request(app())
    .delete(`/${photo.id}`)
  t.true(status === 401)
})

test.serial('DELETE /photos/:id 404 (admin)', async (t) => {
  const { adminSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: adminSession })
  t.true(status === 404)
})
