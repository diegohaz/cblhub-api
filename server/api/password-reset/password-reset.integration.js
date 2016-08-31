'use strict'

import app from '../..'
import request from 'supertest-as-promised'
import nock from 'nock'
import * as factory from '../../services/factory'
import User from '../user/user.model'
import PasswordReset from './password-reset.model'

describe('PasswordReset API', function () {
  let user

  beforeEach(function () {
    return factory.clean()
      .then(() => User.create({ email: 'test@example.com', password: 'pass' }))
      .then((u) => { user = u })
  })

  describe('POST /password-resets', function () {
    it('should respond 202 when user email is registered', function () {
      nock.restore() && nock.isActive() || nock.activate()
      nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
      return request(app)
        .post('/password-resets')
        .send({ email: 'test@example.com', link: 'http://example.com' })
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
        .send({ email: 'test@example.com' })
        .expect(400)
    })

    it('should fail 404 when user email is not registered', function () {
      return request(app)
        .post('/password-resets')
        .send({ email: 'test2@example.com', link: 'http://example.com' })
        .expect(404)
    })
  })

  describe('POST /password-resets/:token', function () {
    it('should respond with the user session', function () {
      return PasswordReset.create({ user }).then((passwordReset) => {
        return request(app)
          .post('/password-resets/' + passwordReset.token)
          .expect(200)
      }).then(({ body }) => {
        body.should.have.deep.property('user.id', user.id)
        body.should.have.property('token')
        return PasswordReset.find({}).should.eventually.have.lengthOf(0)
      })
    })

    it('should fail 404 when token is not registered', function () {
      return request(app)
        .post('/password-resets/123')
        .expect(404)
    })
  })
})
