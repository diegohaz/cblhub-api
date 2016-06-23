'use strict'

import app from '../..'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'

describe('Tag API', function () {
  let tag, user, admin

  before(function () {
    return factory.clean()
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        user = u
        admin = a
      })
  })

  describe('GET /tags', function () {
    before(function () {
      return factory.tags('anitta', 'michael jackson', 'shakira')
    })

    it('should respond with array', function () {
      return request(app)
        .get('/tags')
        .expect(200)
        .then(({body}) => body.should.be.instanceOf(Array))
    })

    it('should respond with array to pagination', function () {
      return request(app)
        .get('/tags')
        .query({page: 2, limit: 1})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('name', 'michael jackson')
        })
    })

    it('should respond with array to query search', function () {
      return request(app)
        .get('/tags')
        .query({q: 'shak'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('name', 'shakira')
        })
    })

    it('should respond with array to sort', function () {
      return request(app)
        .get('/tags')
        .query({sort: '-name'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(3)
          body[0].should.have.property('name', 'shakira')
        })
    })

    it('should respond with array to fields', function () {
      return request(app)
        .get('/tags')
        .query({fields: '-name'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(3)
          body.should.all.not.have.property('name')
        })
    })
  })

  describe('POST /tags', function () {
    it('should respond with the created tag when authenticated as admin', function () {
      return request(app)
        .post('/tags')
        .query({access_token: admin.token})
        .send({name: 'shakira'})
        .expect(201)
        .then(({body}) => {
          tag = body
          tag.should.have.property('name', 'shakira')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .post('/tags')
        .query({access_token: admin.token})
        .expect(400)
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .post('/tags')
        .query({access_token: user.token})
        .send({name: 'shakira'})
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .post('/tags')
        .send({name: 'shakira'})
        .expect(401)
    })
  })

  describe('GET /tags/:id', function () {
    it('should respond with an tag', function () {
      return request(app)
        .get('/tags/' + tag.id)
        .expect(200)
        .then(({body}) => body.should.have.property('name', tag.name))
    })

    it('should fail 404 when tag does not exist', function () {
      return request(app)
        .get('/tags/123456789098765432123456')
        .expect(404)
    })
  })

  describe('PUT /tags/:id', function () {
    it('should respond with the updated tag when authenticated as admin', function () {
      return request(app)
        .put('/tags/' + tag.id)
        .query({access_token: admin.token})
        .send({name: 'watson'})
        .expect(200)
        .then(({body}) => body.should.have.property('name', 'watson'))
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .put('/tags/' + tag.id)
        .query({access_token: admin.token})
        .send({name: ''})
        .expect(400)
    })

    it('should fail 404 when tag does not exist', function () {
      return request(app)
        .put('/tags/123456789098765432123456')
        .query({access_token: admin.token})
        .send({name: 'watson'})
        .expect(404)
    })

    it('should fail 401 when authenticated as user', function () {
      return request(app)
        .put('/tags/' + tag.id)
        .query({access_token: user.token})
        .send({name: 'anitta'})
        .expect(401)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/tags/' + tag.id)
        .send({name: 'anitta'})
        .expect(401)
    })
  })

  describe('DELETE /tags/:id', function () {
    it('should delete when authenticated as admin', function () {
      return request(app)
        .delete('/tags/' + tag.id)
        .query({access_token: admin.token})
        .expect(204)
    })

    it('should fail 404 when tag does not exist', function () {
      return request(app)
        .delete('/tags/' + tag.id)
        .query({access_token: admin.token})
        .expect(404)
    })

    it('should fail when authenticated as user', function () {
      return request(app)
        .delete('/tags/' + tag.id)
        .query({access_token: user.token})
        .expect(401)
    })

    it('should fail when not authenticated', function () {
      return request(app)
        .delete('/tags/' + tag.id)
        .expect(401)
    })
  })
})
