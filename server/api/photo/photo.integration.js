'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import app from '../..'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'

describe('Photo API', function () {
  let photo, user, admin

  before(function () {
    return factory.clean()
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        user = u
        admin = a
      })
  })

  describe('GET /photos/search', function () {
    vcr.it('should respond with array to query search', function () {
      return request(app)
        .get('/photos/search')
        .query({ q: 'Jupiter' })
        .expect(200)
        .then(({ body }) => {
          photo = body[0]
          body.should.be.instanceOf(Array)
          body.should.all.have.property('id')
        })
    })
  })

  describe('GET /photos', function () {
    let photos

    it('should respond with array', function () {
      return request(app)
        .get('/photos')
        .expect(200)
        .then(({ body }) => {
          photos = body
          body.should.be.instanceOf(Array)
        })
    })

    it('should respond with array to pagination', function () {
      return request(app)
        .get('/photos')
        .query({ page: 2, limit: 1 })
        .expect(200)
        .then(({ body }) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('id', photos[1].id)
        })
    })

    it('should respond with array to sort', function () {
      return request(app)
        .get('/photos')
        .query({ sort: '-createdAt' })
        .expect(200)
        .then(({ body }) => {
          body.should.be.instanceOf(Array)
        })
    })

    it('should respond with array to fields', function () {
      return request(app)
        .get('/photos')
        .query({ fields: '-small' })
        .expect(200)
        .then(({ body }) => {
          body.should.be.instanceOf(Array)
          body.should.all.not.have.property('small')
        })
    })
  })

  describe('GET /photos/:id', function () {
    it('should respond with a photo', function () {
      return request(app)
        .get('/photos/' + photo.id)
        .expect(200)
        .then(({ body }) => body.should.have.property('id', photo.id))
    })

    it('should fail 404 when photo does not exist', function () {
      return request(app)
        .get('/photos/123456789098765432123456')
        .expect(404)
    })
  })

  describe('PUT /photos/:id', function () {
    it('should respond with the updated photo when authenticated as admin', function () {
      return request(app)
        .put('/photos/' + photo.id)
        .query({ access_token: admin.token })
        .send({ title: 'Jupiter', _id: 'lol' })
        .expect(200)
        .then(({ body }) => body.should.have.property('title', 'Jupiter'))
    })

    it('should fail 404 when photo does not exist', function () {
      return request(app)
        .put('/photos/123456789098765432123456')
        .query({ access_token: admin.token })
        .send({ title: 'Jupiter' })
        .expect(404)
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .put('/photos/' + photo.id)
        .query({ access_token: user.token })
        .send({ title: 'Jupiter' })
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/photos/' + photo.id)
        .send({ title: 'Jupiter' })
        .expect(401)
    })
  })

  describe('DELETE /photos/:id', function () {
    it('should delete when authenticated as admin', function () {
      return request(app)
        .delete('/photos/' + photo.id)
        .query({ access_token: admin.token })
        .expect(204)
    })

    it('should fail 404 when photo does not exist', function () {
      return request(app)
        .delete('/photos/' + photo.id)
        .query({ access_token: admin.token })
        .expect(404)
    })

    it('should fail when authenticated as user', function () {
      return request(app)
        .delete('/photos/' + photo.id)
        .query({ access_token: user.token })
        .expect(401)
    })

    it('should fail when not authenticated', function () {
      return request(app)
        .delete('/photos/' + photo.id)
        .expect(401)
    })
  })
})
