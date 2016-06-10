'use strict'

import app from '../..'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'
import Guide from './guide.model'

describe('Guide API', function () {
  let guide, user, admin

  before(function () {
    return factory.clean()
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        user = u
        admin = a
      })
  })

  describe('GET /guides', function () {
    let challenge, guide, user, admin

    before(function () {
      return factory.users('user', 'admin')
        .spread((u, a) => {
          user = u
          admin = a
          return factory.challenge()
        })
        .tap((c) => { challenge = c })
        .then(() => factory.guides({user, challenge}, {user, challenge}))
        .tap((guides) => { guide = guides[0] })
        .spread((guide) => factory.question({title: 'Zesting', user, challenge, guides: [guide]}))
        .then(() => factory.guide({user: admin}))
    })

    it('should respond with array', function () {
      return request(app)
        .get('/guides')
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array)
        })
    })

    it('should respond with array to pagination', function () {
      return request(app)
        .get('/guides')
        .query({page: 2, limit: 1})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to query search', function () {
      return request(app)
        .get('/guides')
        .query({q: 'zesting'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to sort', function () {
      return request(app)
        .get('/guides')
        .query({sort: '-title'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body[0].should.have.property('title', 'Zesting')
        })
    })

    it('should respond with array to fields', function () {
      return request(app)
        .get('/guides')
        .query({fields: '-title'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body.should.all.not.have.property('title')
        })
    })

    it('should respond with array to user', function () {
      return request(app)
        .get('/guides')
        .query({user: admin.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('should respond with array to challenge', function () {
      return request(app)
        .get('/guides')
        .query({challenge: challenge.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(3)
        })
    })

    it('should respond with array to guide', function () {
      return request(app)
        .get('/guides')
        .query({guide: guide.id})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

    it('should respond with array to type', function () {
      return request(app)
        .get('/guides')
        .query({type: 'Question'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
        })
    })

  })

  describe('POST /guides', function () {

    it('should respond with the created guide when authenticated as user', function () {
      return request(app)
        .post('/guides')
        .query({access_token: user.token})
        .send({title: 'Testing'})
        .expect(201)
        .then(({body}) => {
          guide = body
          guide.should.have.property('title', 'Testing')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .post('/guides')
        .query({access_token: user.token})
        .expect(400)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .post('/guides')
        .send({title: 'Testing'})
        .expect(401)
    })

  })

  describe('GET /guides/:id', function () {

    it('should respond with an guide', function () {
      return request(app)
        .get('/guides/' + guide.id)
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', guide.title)
        })
    })

    it('should fail 404 when guide does not exist', function () {
      return request(app)
        .get('/guides/123456789098765432123456')
        .expect(404)
    })

  })

  describe('PUT /guides/:id', function () {

    it('should respond with the updated guide when authenticated as admin', function () {
      return request(app)
        .put('/guides/' + guide.id)
        .query({access_token: admin.token})
        .send({title: 'Watson'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'Watson')
        })
    })

    it('should respond with the updated guide when authenticated as same user', function () {
      return request(app)
        .put('/guides/' + guide.id)
        .query({access_token: user.token})
        .send({title: 'IBM'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'IBM')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .put('/guides/' + guide.id)
        .query({access_token: user.token})
        .send({title: ''})
        .expect(400)
    })

    it('should fail 404 when guide does not exist', function () {
      return request(app)
        .put('/guides/123456789098765432123456')
        .query({access_token: user.token})
        .send({title: 'Watson'})
        .expect(404)
    })

    it('should fail 401 when authenticated as other user', function () {
      return factory.session().then((anotherUser) =>
        request(app)
          .put('/guides/' + guide.id)
          .query({access_token: anotherUser.token})
          .send({title: 'IBM'})
          .expect(401)
        )
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/guides/' + guide.id)
        .send({title: 'IBM'})
        .expect(401)
    })

  })

  describe('DELETE /guides/:id', function () {

    it('should delete when authenticated as user', function () {
      return request(app)
        .delete('/guides/' + guide.id)
        .query({access_token: user.token})
        .expect(204)
    })

    it('should fail 404 when guide does not exist', function () {
      return request(app)
        .delete('/guides/' + guide.id)
        .query({access_token: user.token})
        .expect(404)
    })

    it('should fail when not authenticated', function () {
      return request(app)
        .delete('/guides/' + guide.id)
        .expect(401)
    })

  })

})
