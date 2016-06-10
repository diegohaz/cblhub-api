'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import app from '../..'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'
import Resource from './resource.model'

describe('Resource API', function () {
  let resource, user, admin

  before(function () {
    return factory.clean()
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        user = u
        admin = a
      })
  })

  describe('GET /resources', function () {
    let challenge, resource, user, admin

    before(function () {
      return factory.users('user', 'admin')
        .spread((u, a) => {
          user = u
          admin = a
          return factory.challenge()
        })
        .tap((c) => { challenge = c })
        .then(() => factory.resources({user, challenge}, {user, challenge}))
        .tap((resources) => { resource = resources[0] })
        .spread((resource) => factory.resource({title: 'Zesting', user, challenge, guides: [resource]}))
        .then(() => factory.resource({user: admin}))
    })

    it('should respond with array', function () {
      return request(app)
        .get('/resources')
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array)
        })
    })

    it('should respond with array to pagination', function () {
      return request(app)
        .get('/resources')
        .query({page: 2, limit: 1})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to query search', function () {
      return request(app)
        .get('/resources')
        .query({q: 'zesting'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to sort', function () {
      return request(app)
        .get('/resources')
        .query({sort: '-title'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to fields', function () {
      return request(app)
        .get('/resources')
        .query({fields: '-title'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body.should.all.not.have.property('title')
        })
    })

    it('should respond with array to user', function () {
      return request(app)
        .get('/resources')
        .query({user: admin.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('should respond with array to challenge', function () {
      return request(app)
        .get('/resources')
        .query({challenge: challenge.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(3)
        })
    })

    it('should respond with array to guide', function () {
      return request(app)
        .get('/resources')
        .query({guide: resource.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })
  })

  describe('POST /resources', function () {

    it('should respond with the created resource when authenticated as user', function () {
      return request(app)
        .post('/resources')
        .query({access_token: user.token})
        .send({title: 'Testing'})
        .expect(201)
        .then(({body}) => {
          resource = body
          resource.should.have.property('title', 'Testing')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .post('/resources')
        .query({access_token: user.token})
        .expect(400)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .post('/resources')
        .send({title: 'Testing'})
        .expect(401)
    })

  })

  describe('GET /resources/:id', function () {

    it('should respond with an resource', function () {
      return request(app)
        .get('/resources/' + resource.id)
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', resource.title)
        })
    })

    it('should fail 404 when resource does not exist', function () {
      return request(app)
        .get('/resources/123456789098765432123456')
        .expect(404)
    })

  })

  describe('GET /resources/meta', function () {

    vcr.it('should respond with metadata', function () {
      return request(app)
        .get('/resources/meta')
        .query({url: 'http://www.imdb.com/name/nm0000149/'})
        .expect(200)
        .then(({body}) => {
          body.should.include.keys('title', 'description', 'image', 'media')
        })
    })

  })

  describe('PUT /resources/:id', function () {

    it('should respond with the updated resource when authenticated as admin', function () {
      return request(app)
        .put('/resources/' + resource.id)
        .query({access_token: admin.token})
        .send({title: 'Watson'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'Watson')
        })
    })

    it('should respond with the updated resource when authenticated as same user', function () {
      return request(app)
        .put('/resources/' + resource.id)
        .query({access_token: user.token})
        .send({title: 'IBM'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'IBM')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .put('/resources/' + resource.id)
        .query({access_token: user.token})
        .send({title: ''})
        .expect(400)
    })

    it('should fail 404 when resource does not exist', function () {
      return request(app)
        .put('/resources/123456789098765432123456')
        .query({access_token: user.token})
        .send({title: 'Watson'})
        .expect(404)
    })

    it('should fail 401 when authenticated as other user', function () {
      return factory.session().then((anotherUser) =>
        request(app)
          .put('/resources/' + resource.id)
          .query({access_token: anotherUser.token})
          .send({title: 'IBM'})
          .expect(401)
        )
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/resources/' + resource.id)
        .send({title: 'IBM'})
        .expect(401)
    })

  })

  describe('DELETE /resources/:id', function () {

    it('should delete when authenticated as user', function () {
      return request(app)
        .delete('/resources/' + resource.id)
        .query({access_token: user.token})
        .expect(204)
    })

    it('should fail 404 when resource does not exist', function () {
      return request(app)
        .delete('/resources/' + resource.id)
        .query({access_token: user.token})
        .expect(404)
    })

    it('should fail when not authenticated', function () {
      return request(app)
        .delete('/resources/' + resource.id)
        .expect(401)
    })

  })

})
