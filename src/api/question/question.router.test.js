import { stub } from 'sinon'
import request from 'supertest-as-promised'
import { signSync } from '../../services/jwt'
import * as watson from '../../services/watson'
import express from '../../config/express'
import { User } from '../user'
import { Challenge } from '../challenge'
import routes, { Question } from '.'

const app = () => express(routes)
stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, anotherUser, userSession, anotherSession, challenge, question

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  anotherUser = await User.create({ email: 'b@b.com', password: '123456' })
  userSession = signSync(user.id)
  anotherSession = signSync(anotherUser.id)
  challenge = await Challenge.create({ user, title: 'test' })
  question = await Question.create({ user, challenge, title: 'test' })
})

test('POST /questions 201 (user)', async () => {
  const { status, body } = await request(app())
    .post('/')
    .send({ access_token: userSession, title: 'test', description: 'test' })
  expect(status).toBe(201)
  expect(typeof body).toBe('object')
  expect(body.title).toBe('test')
  expect(body.description).toBe('test')
})

test('POST /questions 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /questions 200 - inexistent users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: anotherUser.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /questions 200 - users', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ users: user.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /questions 200 - inexistent challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /questions 200 - challenges', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ challenges: challenge.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('GET /questions 200 - inexistent guides', async () => {
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: '123456789098765432123456' })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(0)
})

test('GET /questions 200 - guides', async () => {
  const anotherQuestion = await Question.create({ user, title: 'test' })
  await question.update({ $addToSet: { guides: anotherQuestion } })
  const { status, body } = await request(app())
    .get('/')
    .query({ guides: anotherQuestion.id })
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
  expect(body.length).toBe(1)
})

test('POST /questions 401', async () => {
  const { status } = await request(app())
    .post('/')
  expect(status).toBe(401)
})

test('GET /questions 200', async () => {
  const { status, body } = await request(app())
    .get('/')
  expect(status).toBe(200)
  expect(Array.isArray(body)).toBe(true)
})

test('GET /questions/:id 200', async () => {
  const { status, body } = await request(app())
    .get(`/${question.id}`)
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(question.id)
})

test('GET /questions/:id 404', async () => {
  const { status } = await request(app())
    .get('/123456789098765432123456')
  expect(status).toBe(404)
})

test('PUT /questions/:id 200 (user)', async () => {
  const { status, body } = await request(app())
    .put(`/${question.id}`)
    .send({ access_token: userSession, title: 'test2', description: 'test2' })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(question.id)
  expect(body.title).toBe('test2')
  expect(body.description).toBe('test2')
  expect(typeof body.user).toBe('object')
})

test('PUT /questions/:id 200 (user) - add guide', async () => {
  const anotherQuestion = await Question.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${question.id}`)
    .send({ access_token: userSession, guides: anotherQuestion.id })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(question.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length).toBe(1)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherQuestion.id.toString())
})

test('PUT /questions/:id 200 (user) - add guide with already 1 guide', async () => {
  const anotherQuestion = await Question.create({ user, title: 'test' })
  const anotherQuestion2 = await Question.create({ user, title: 'test', guides: [anotherQuestion] })
  const { status, body } = await request(app())
    .put(`/${anotherQuestion2.id}`)
    .send({ access_token: userSession, guides: `+${question.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherQuestion2.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id === question.id.toString()).toBe(true)
})

test('PUT /questions/:id 200 (user) - add 2 guides', async () => {
  const anotherQuestion = await Question.create({ user, title: 'test' })
  const anotherQuestion2 = await Question.create({ user, title: 'test' })
  const { status, body } = await request(app())
    .put(`/${question.id}`)
    .send({ access_token: userSession, guides: `${anotherQuestion.id},${anotherQuestion2.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id).toBe(question.id)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 2).toBe(true)
  expect(typeof body.guides[0]).toBe('object')
  expect(body.guides[0].id).toBe(anotherQuestion.id.toString())
  expect(typeof body.guides[1]).toBe('object')
  expect(body.guides[1].id).toBe(anotherQuestion2.id.toString())
})

test('PUT /questions/:id 200 (user) - remove guide', async () => {
  const anotherQuestion = await Question.create({ user, title: 'test', guides: [question] })
  expect(Array.isArray(anotherQuestion.view().guides)).toBe(true)
  expect(anotherQuestion.view().guides.length).toBe(1)
  const { status, body } = await request(app())
    .put(`/${anotherQuestion.id}`)
    .send({ access_token: userSession, guides: `-${question.id}` })
  expect(status).toBe(200)
  expect(typeof body).toBe('object')
  expect(body.id === anotherQuestion.id).toBe(true)
  expect(Array.isArray(body.guides)).toBe(true)
  expect(body.guides.length === 0).toBe(true)
})

test('PUT /questions/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .put(`/${question.id}`)
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(401)
})

test('PUT /questions/:id 401', async () => {
  const { status } = await request(app())
    .put(`/${question.id}`)
  expect(status).toBe(401)
})

test('PUT /questions/:id 404 (user)', async () => {
  const { status } = await request(app())
    .put('/123456789098765432123456')
    .send({ access_token: anotherSession, title: 'test2', description: 'test2' })
  expect(status).toBe(404)
})

test('DELETE /questions/:id 204 (user)', async () => {
  const { status } = await request(app())
    .delete(`/${question.id}`)
    .query({ access_token: userSession })
  expect(status).toBe(204)
})

test('DELETE /questions/:id 401 (user) - another user', async () => {
  const { status } = await request(app())
    .delete(`/${question.id}`)
    .send({ access_token: anotherSession })
  expect(status).toBe(401)
})

test('DELETE /questions/:id 401', async () => {
  const { status } = await request(app())
    .delete(`/${question.id}`)
  expect(status).toBe(401)
})

test('DELETE /questions/:id 404 (user)', async () => {
  const { status } = await request(app())
    .delete('/123456789098765432123456')
    .query({ access_token: anotherSession })
  expect(status).toBe(404)
})
