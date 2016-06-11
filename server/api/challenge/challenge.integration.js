'use strict'

import app from '../..'
import request from 'supertest-as-promised'
import * as factory from '../../services/factory'

describe('Challenge API', function () {
  let challenge, user, admin

  before(function () {
    return factory.clean()
      .then(() => factory.sessions('user', 'admin'))
      .spread((u, a) => {
        user = u
        admin = a
      })
  })

  describe('GET /challenges', function () {
    before(function () {
      return factory.challenges({user}, {user})
        .then(() => factory.challenge({bigIdea: 'Testing', user}))
        .then(() => factory.challenge({user: admin}))
    })

    it('should respond with array', function () {
      return request(app)
        .get('/challenges')
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array)
        })
    })

    it('should respond with array to pagination', function () {
      return request(app)
        .get('/challenges')
        .query({page: 2, limit: 1})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('bigIdea', 'Testing')
        })
    })

    it('should respond with array to query search', function () {
      return request(app)
        .get('/challenges')
        .query({q: 'testing'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(1)
          body[0].should.have.property('bigIdea', 'Testing')
        })
    })

    it('should respond with array to sort', function () {
      return request(app)
        .get('/challenges')
        .query({sort: '-bigIdea'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body[0].should.have.property('bigIdea', 'Testing')
        })
    })

    it('should respond with array to fields', function () {
      return request(app)
        .get('/challenges')
        .query({fields: '-bigIdea'})
        .expect(200)
        .then(({body}) => {
          body.should.be.instanceOf(Array).and.have.lengthOf(4)
          body.should.all.not.have.property('bigIdea')
        })
    })
  })

  describe('POST /challenges', function () {
    it('should respond with the created challenge when authenticated as user', function () {
      return request(app)
        .post('/challenges')
        .query({access_token: user.token})
        .send({title: 'Testing'})
        .expect(201)
        .then(({body}) => {
          challenge = body
          challenge.should.have.property('title', 'Testing')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .post('/challenges')
        .query({access_token: user.token})
        .expect(400)
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .post('/challenges')
        .send({title: 'Testing'})
        .expect(401)
    })
  })

  describe('GET /challenges/:id', function () {
    it('should respond with an challenge', function () {
      return request(app)
        .get('/challenges/' + challenge.id)
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', challenge.title)
        })
    })

    it('should fail 404 when challenge does not exist', function () {
      return request(app)
        .get('/challenges/123456789098765432123456')
        .expect(404)
    })
  })

  describe('PUT /challenges/:id', function () {
    it('should respond with the updated challenge when authenticated as admin', function () {
      return request(app)
        .put('/challenges/' + challenge.id)
        .query({access_token: admin.token})
        .send({title: 'Watson'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'Watson')
        })
    })

    it('should respond with the updated challenge when authenticated as same user', function () {
      return request(app)
        .put('/challenges/' + challenge.id)
        .query({access_token: user.token})
        .send({title: 'IBM'})
        .expect(200)
        .then(({body}) => {
          body.should.have.property('title', 'IBM')
        })
    })

    it('should fail 400 when missing parameter', function () {
      return request(app)
        .put('/challenges/' + challenge.id)
        .query({access_token: user.token})
        .send({title: ''})
        .expect(400)
    })

    it('should fail 404 when challenge does not exist', function () {
      return request(app)
        .put('/challenges/123456789098765432123456')
        .query({access_token: user.token})
        .send({title: 'Watson'})
        .expect(404)
    })

    it('should fail 401 when authenticated as other user', function () {
      return factory.session().then((anotherUser) =>
        request(app)
          .put('/challenges/' + challenge.id)
          .query({access_token: anotherUser.token})
          .send({title: 'IBM'})
          .expect(401)
        )
    })

    it('should fail 401 when not authenticated', function () {
      return request(app)
        .put('/challenges/' + challenge.id)
        .send({title: 'IBM'})
        .expect(401)
    })
  })

  describe('DELETE /challenges/:id', function () {
    it('should delete when authenticated as user', function () {
      return request(app)
        .delete('/challenges/' + challenge.id)
        .query({access_token: user.token})
        .expect(204)
    })

    it('should fail 404 when challenge does not exist', function () {
      return request(app)
        .delete('/challenges/' + challenge.id)
        .query({access_token: user.token})
        .expect(404)
    })

    it('should fail when not authenticated', function () {
      return request(app)
        .delete('/challenges/' + challenge.id)
        .expect(401)
    })
  })
})
