'use strict'

import app from '../..'
import request from 'supertest-as-promised'
import nock from 'nock'
import * as factory from '../../services/factory'
import User from '../user/user.model'
import PasswordReset from './password-reset.model'

describe.only('PasswordReset API', function () {
  let user

  beforeEach(function () {
    return factory.clean()
      .then(() => User.create({ email: 'a@a.com', password: '123' }))
      .then((u) => { user = u })
  })

  describe('POST /password-resets', function () {
    it('should respond 202 when user email is registered', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ email: 'a@a.com', link: 'http://example.com' })
        .expect(202)
    })

    it('should fail 400 when email was not sent', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ link: 'http://example.com' })
        .expect(400)
    })

    it('should fail 400 when link was not sent', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ email: 'a@a.com' })
        .expect(400)
    })

    it('should fail 404 when user email is not registered', function () {
      return request(app)
        .post('/password-resets')
        .send({ email: 'b@b.com', link: 'http://example.com' })
        .expect(404)
    })
  })

  describe('GET /password-resets/:token', function () {
    it('should respond with the password reset entity', function () {
      return PasswordReset.create({ user }).then((passwordReset) => {
        return request(app)
          .get('/password-resets/' + passwordReset.token)
          .expect(200)
      }).then(({ body }) => {
        body.should.have.deep.property('user.id', user.id)
        body.should.have.property('token')
      })
    })

    it('should fail 404 when token does not exist', function () {
      return request(app)
        .get('/password-resets/123')
        .expect(404)
    })
  })

  describe('PUT /password-resets/:token', function () {
    let passwordReset

    beforeEach(function () {
      return PasswordReset.create({ user }).then((reset) => {
        passwordReset = reset
      })
    })

    it('should respond with the updated user and remove the token', function () {
      return request(app)
        .put('/password-resets/' + passwordReset.token)
        .send({ password: '321' })
        .expect(200)
        .then(({ body }) => {
          body.should.have.property('id', user.id)
          return PasswordReset.find({}).should.eventually.have.lengthOf(0)
        })
    })

    it('should fail 400 when password was not sent', function () {
      return request(app)
        .put('/password-resets/' + passwordReset.token)
        .expect(400)
    })

    it('should fail 404 when token does not exist', function () {
      return request(app)
        .put('/password-resets/123')
        .send({ password: '321' })
        .expect(404)
    })
  })
})
