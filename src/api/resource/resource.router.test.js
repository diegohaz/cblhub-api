import test from 'ava'
import { stub } from 'sinon'
import Promise from 'bluebird'
import request from 'supertest-as-promised'
import mockgoose from 'mockgoose'
import * as watson from '../../services/watson'
import * as meta from '../../services/meta'
import { signSync } from '../../services/jwt'
import express from '../../config/express'
import mongoose from '../../config/mongoose'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Resource } from '.'

const app = () => express(routes)

test.before(async (t) => {
  watson.getKeywords.restore || stub(watson, 'getKeywords', () => ['k1', 'k2'])
  meta.getMeta.restore || stub(meta, 'getMeta', () => Promise.resolve({ prop: 'value' }))
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
  const resource = await Resource.create({ user, challenge, title: 'test' })
  t.context = {
    ...t.context,
    anotherUser,
    userSession,
    anotherSession,
    adminSession,
    resource,
    user,
    challenge
  }
})

test.afterEach.always(async (t) => {
  await Promise.all([User.remove(), Resource.remove(), Challenge.remove()])
})

test.serial('POST /resources 201 (user)', async (t) => {
  const { userSession } = t.context
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
  t.true(status === 201)
  t.true(typeof body === 'object')
  t.true(body.title === 'test')
  t.true(body.description === 'test')
  t.true(body.url === 'test.com')
  t.true(body.mediaType === 'website')
  t.true(body.image === 'test.jpg')
})

test.serial('POST /resources 401', async (t) => {
  const { status } = await request(app())
    .post('/')
  t.true(status === 401)
})

test.serial('GET /resources/meta 200', async (t) => {
  const { status, body } = await request(app())
    .get('/meta')
    .query({ url: 'test.com' })
  t.true(status === 200)
  t.true(body.prop === 'value')
})

test.serial('GET /resources/meta 400 - missing url', async (t) => {
  const { status } = await request(app())
    .get('/meta')
  t.true(status === 400)
})

test.serial('GET /resources 200', async (t) => {
  const { status, body } = await request(app())
    .get('/')
  t.true(status === 200)
  t.true(Array.isArray(body))
})

test.serial('GET /resources 200 - inexistent users', async (t) => {
  const { anotherUser } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /resources 200 - users', async (t) => {
  const { user } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /resources 200 - inexistent challenges', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /resources 200 - challenges', async (t) => {
  const { challenge } = t.context
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /resources 200 - inexistent guides', async (t) => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 0)
})

test.serial('GET /resources 200 - guides', async (t) => {
  const { user, resource } = t.context
  const anotherResource = await Resource.create({ user, title: 'test' })
  await resource.update({ $addToSet: { guides: anotherResource } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherResource.id })
  t.true(status === 200)
  t.true(Array.isArray(body))
  t.true(body.length === 1)
})

test.serial('GET /resources/:id 200', async (t) => {
  const { resource } = t.context
  const { status, body } = await request(app())
    .get(`/${resource.id}`)
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === resource.id)
})

test.serial('GET /resources/:id 404', async (t) => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  t.true(status === 404)
})

test.serial('PUT /resources/:id 200 (user)', async (t) => {
  const { userSession, resource } = t.context
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({
      access_token: userSession,
      title: 'test',
      description: 'test',
      url: 'test.com',
      mediaType: 'website',
      image: 'test.jpg'
    })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === resource.id)
  t.true(body.title === 'test')
  t.true(body.description === 'test')
  t.true(body.url === 'test.com')
  t.true(body.mediaType === 'website')
  t.true(body.image === 'test.jpg')
})

test.serial('PUT /resources/:id 200 (user) - add guide', async (t) => {
  const { userSession, user, resource } = t.context
  const anotherResource = await Resource.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: userSession, guides: anotherResource.id })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === resource.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 1)
  t.true(typeof body.guides[0] === 'object')
  t.true(body.guides[0].id === anotherResource.id.toString())
})

test.serial('PUT /resources/:id 200 (user) - add guide with already 1 guide', async (t) => {
  const { userSession, user, resource } = t.context
  const anotherResource = await Resource.create({ user, title: 'test' })
  const anotherResource2 = await Resource.create({ user, title: 'test', guides: [anotherResource] })
  const { status, body } = await request(app())
    .put(`/${anotherResource2.id}`)
    .send({ access_token: userSession, guides: `+${resource.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === anotherResource2.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 2)
  t.true(typeof body.guides[1] === 'object')
  t.true(body.guides[1].id === resource.id.toString())
})

test.serial('PUT /resources/:id 200 (user) - add 2 guides', async (t) => {
  const { userSession, user, resource } = t.context
  const anotherResource = await Resource.create({ user, title: 'test' })
  const anotherResource2 = await Resource.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: userSession, guides: `${anotherResource.id},${anotherResource2.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === resource.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 2)
  t.true(typeof body.guides[0] === 'object')
  t.true(body.guides[0].id === anotherResource.id.toString())
  t.true(typeof body.guides[1] === 'object')
  t.true(body.guides[1].id === anotherResource2.id.toString())
})

test.serial('PUT /resources/:id 200 (user) - remove guide', async (t) => {
  const { userSession, user, resource } = t.context
  const anotherResource = await Resource.create({ user, title: 'test', guides: [resource] })
  t.true(Array.isArray(anotherResource.view().guides))
  t.true(anotherResource.view().guides.length === 1)
  const { status, body } = await request(app())
    .put(`/${anotherResource.id}`)
    .send({ access_token: userSession, guides: `-${resource.id}` })
  t.true(status === 200)
  t.true(typeof body === 'object')
  t.true(body.id === anotherResource.id)
  t.true(Array.isArray(body.guides))
  t.true(body.guides.length === 0)
})

test.serial('PUT /resources/:id 401 (user) - another user', async (t) => {
  const { anotherSession, resource } = t.context
  const { status } = await request(app())
    .put(`/${resource.id}`)
    .send({ access_token: anotherSession, title: 'test', description: 'test' })
  t.true(status === 401)
})

test.serial('PUT /resources/:id 401', async (t) => {
  const { resource } = t.context
  const { status } = await request(app())
    .put(`/${resource.id}`)
  t.true(status === 401)
})

test.serial('PUT /resources/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test', description: 'test' })
  t.true(status === 404)
})

test.serial('DELETE /resources/:id 204 (user)', async (t) => {
  const { userSession, resource } = t.context
  const { status } = await request(app())
    .delete(`/${resource.id}`)
    .query({ access_token: userSession })
  t.true(status === 204)
})

test.serial('DELETE /resources/:id 401 (user) - another user', async (t) => {
  const { anotherSession, resource } = t.context
  const { status } = await request(app())
    .delete(`/${resource.id}`)
    .send({ access_token: anotherSession })
  t.true(status === 401)
})

test.serial('DELETE /resources/:id 401', async (t) => {
  const { resource } = t.context
  const { status } = await request(app())
    .delete(`/${resource.id}`)
  t.true(status === 401)
})

test.serial('DELETE /resources/:id 404 (user)', async (t) => {
  const { anotherSession } = t.context
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  t.true(status === 404)
})
