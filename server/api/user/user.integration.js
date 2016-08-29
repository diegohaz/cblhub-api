'use strict'

import app from '../..'
import nock from 'nock'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'

describe('User API', function () {
  var user, userSession, adminSession

  before(function () {
    return factory.clean()
      .then(() => factory.user())
      .tap(u => { user = u })
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        userSession = u
        adminSession = a
      })
  })

  describe('GET /users', function () {
    it('should respond with array when authenticated as admin', function () {
      return request(app)
        .get('/users')
        .query({ access_token: adminSession.token })
        .expect(200)
        .then(({ body }) => body.should.be.instanceOf(Array))
    })

    it('should respond with array to query page when authenticated as admin', function () {
      return request(app)
        .get('/users')
        .query({ access_token: adminSession.token, page: 2, limit: 1 })
        .expect(200)
        .then(({ body }) => body.should.be.instanceOf(Array).with.lengthOf(1))
    })

    it('should respond with array to query q when authenticated as admin', function () {
      return request(app)
        .get('/users')
        .query({ access_token: adminSession.token, q: 'fake user' })
        .expect(200)
        .then(({ body }) => {
          body.should.be.instanceOf(Array).with.lengthOf(2)
        })
    })

    it('should respond with array to fields when authenticated as admin', function () {
      return request(app)
        .get('/users')
        .query({ access_token: adminSession.token, fields: 'name' })
        .expect(200)
        .then(({ body }) => {
          body.should.be.instanceOf(Array)
          Object.keys(body[0]).should.be.deep.equal(['id', 'name'])
        })
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .get('/users')
        .query({ access_token: userSession.token })
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .get('/users')
        .expect(401)
    })
  })

  describe('GET /users/me', function () {
    it('should respond with the current user profile when authenticated as user', function () {
      return request(app)
        .get('/users/me')
        .query({ access_token: userSession.token })
        .expect(200)
        .then(({ body }) => body.should.have.property('id', userSession.user.id))
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .get('/users/me')
        .expect(401)
    })
  })

  describe('GET /users/:id', function () {
    it('should respond with a user', function () {
      return request(app)
        .get('/users/' + user.id)
        .expect(200)
        .then(({ body }) => body.should.have.property('id', user.id))
    })

    it('should fail 404 when user does not exist', function () {
      return request(app)
        .get('/users/123456789098765432123456')
        .expect(404)
    })
  })

  describe('POST /users', function () {
    it('should respond with the created user', function () {
      return request(app)
        .post('/users')
        .send({ email: 'a@a.com', password: 'pass' })
        .expect(201)
        .then(({ body }) => {
          user = body
          body.should.have.property('id')
        })
    })

    it('should respond with the created anonymous user', function () {
      return request(app)
        .post('/users')
        .send({ email: 'anonymous', password: 'pass' })
        .expect(201)
        .then(({ body }) => {
          body.should.have.property('id')
        })
    })

    it('should fail 400 when email already exists', function () {
      return request(app)
        .post('/users')
        .send({ email: 'a@a.com', password: 'pass' })
        .expect(400)
    })
  })

  describe('POST /users/facebook', function () {
    let fbUser

    beforeEach(function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://graph.facebook.com')
        .get('/me')
        .query((params) => params.access_token === '123')
        .reply(200, {
          id: '123',
          name: 'Test name',
          email: 'email@example.com',
          picture: { data: { url: 'test.jpg' } }
        })
        .get('/me')
        .query((params) => params.access_token === '321')
        .reply(200, {
          id: '321',
          name: 'Test name 2',
          email: 'email2@example.com',
          picture: { data: { url: 'test.jpg' } }
        })
    })

    it('should respond with the created facebook user', function () {
      return request(app)
        .post('/users/facebook')
        .send({ access_token: '123' })
        .expect(201)
        .then(({ body }) => {
          fbUser = body
          body.should.have.property('id')
          body.should.have.property('name', 'Test name')
          body.should.have.property('email', 'email@example.com')
        })
    })

    it('should respond with the registered facebook user', function () {
      return request(app)
        .post('/users/facebook')
        .send({ access_token: '123' })
        .expect(201)
        .then(({ body }) => {
          body.should.have.property('id', fbUser.id)
          body.should.have.property('name', fbUser.name)
          body.should.have.property('email', fbUser.email)
        })
    })

    it('should respond with the registered updated user', function () {
      let user
      return factory.user().then((u) => {
        user = u
        user.email = 'email2@example.com'
        return user.save()
      }).then(() => {
        return request(app)
          .post('/users/facebook')
          .send({ access_token: '321' })
          .expect(201)
          .then(({ body }) => {
            body.should.have.property('id', user.id)
            body.should.have.property('name', 'Test name 2')
            body.should.have.property('email', 'email2@example.com')
          })
      })
    })

    it('should fail 400 when accessToken was not sent', function () {
      return request(app)
        .post('/users/facebook')
        .expect(400)
    })

    it('should fail 400 when accessToken is wrong', function () {
      return request(app)
        .post('/users/facebook')
        .send({ access_token: '456' })
        .expect(400)
    })
  })

  describe('PUT /users/me', function () {
    it('should respond with the updated current user when authenticated as user', function () {
      return request(app)
        .put('/users/me')
        .query({ access_token: userSession.token })
        .send({ password: 'passsss' })
        .expect(200)
        .then(({ body }) => body.should.have.property('id', userSession.user.id))
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/users/me')
        .send({ password: 'passsss' })
        .expect(401)
    })
  })

  describe('PUT /users/:id', function () {
    it('should respond with the updated user when authenticated as admin', function () {
      return request(app)
        .put('/users/' + user.id)
        .query({ access_token: adminSession.token })
        .send({ name: 'Fake User 2', email: 'test2@example.com' })
        .expect(200)
        .then(({ body }) => body.should.have.property('name', 'Fake User 2'))
    })

    it('should respond with the updated user when authenticated as the same', function () {
      return request(app)
        .put('/users/' + userSession.user.id)
        .query({ access_token: userSession.token })
        .send({ country: 'US', password: 'passsss' })
        .expect(200)
        .then(({ body }) => body.should.have.property('id', userSession.user.id))
    })

    it('should fail 400 when set another user password', function () {
      return request(app)
        .put('/users/' + user.id)
        .query({ access_token: adminSession.token })
        .send({ password: 'passsss' })
        .expect(400)
    })

    it('should fail 401 when update another user', function () {
      return request(app)
        .put('/users/' + user.id)
        .query({ access_token: userSession.token })
        .send({ name: 'Fake' })
        .expect(401)
    })

    it('should fail 404 when user does not exist', function () {
      return request(app)
        .put('/users/123456789098765432123456')
        .query({ access_token: adminSession.token })
        .send({ name: 'Fake User 2', email: 'test2@example.com' })
        .expect(404)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/users/' + userSession.user.id)
        .send({ name: 'Fake User 2', email: 'test2@example.com' })
        .expect(401)
    })
  })

  describe('DELETE /users/:id', function () {
    it('should delete when authenticated as admin', function () {
      return request(app)
        .delete('/users/' + user.id)
        .send({ access_token: adminSession.token })
        .expect(204)
    })

    it('should fail 404 when user does not exist', function () {
      return request(app)
        .delete('/users/' + user.id)
        .send({ access_token: adminSession.token })
        .expect(404)
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .delete('/users/' + user.id)
        .send({ access_token: userSession.token })
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .delete('/users/' + user.id)
        .expect(401)
    })
  })
})
