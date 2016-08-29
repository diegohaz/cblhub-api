'use strict'

import crypto from 'crypto'
import '../../'
import * as factory from '../../services/factory'
import User from './user.model'
import Session from '../session/session.model'
import Challenge from '../challenge/challenge.model'

describe('User Model', function () {
  before(function () {
    return factory.clean()
  })

  afterEach(function () {
    return factory.clean()
  })

  it('should return full view', function () {
    return factory.user().then(user => {
      user.view(true).should.include.keys('email', 'createdAt')
    })
  })

  it('should set name automatically', function () {
    return factory.user().then((user) => {
      user.name = ''
      user.email = 'test@test.com'
      user.name.should.be.equal('test')
    })
  })

  it('should set picture url automatically', function () {
    return User.create({ email: 'test@test.com', password: '123' }).then((user) => {
      const hash = crypto.createHash('md5').update(user.email).digest('hex')
      user.picture.should.be.equal(`https://gravatar.com/avatar/${hash}?d=identicon`)
    })
  })

  it('should remove user sessions after removing user', function () {
    let user
    return factory.session()
      .then((session) => { user = session.user })
      .then(() => Session.find({ user }).should.eventually.have.lengthOf(1))
      .then(() => user.remove())
      .then(() => Session.find({ user }).should.eventually.have.lengthOf(0))
  })

  it('should remove user challenges after removing user', function () {
    let user
    return factory.user()
      .tap((u) => { user = u })
      .then((user) => factory.challenge({ user }))
      .then(() => Challenge.find({ user }).should.eventually.have.lengthOf(1))
      .then(() => Challenge.find({ users: user }).should.eventually.have.lengthOf(1))
      .then(() => user.remove())
      .then(() => Challenge.find({ user }).should.eventually.have.lengthOf(0))
      .then(() => Challenge.find({ users: user }).should.eventually.have.lengthOf(0))
  })

  describe('authenticate', function () {
    it('should authenticate user when valid password', function () {
      return factory.user()
        .then(user => user.authenticate('password').should.eventually.not.be.false)
    })

    it('should not authenticate user when invalid password', function () {
      return factory.user()
        .then(user => user.authenticate('blah').should.eventually.be.false)
    })
  })

  describe('createFromFacebook', function () {
    let fbUser

    beforeEach(function () {
      fbUser = {
        id: '123',
        name: 'Test Name',
        email: 'test@test.com',
        picture: { data: { url: 'test.jpg' } }
      }
    })

    it('should create a new user from facebook', function () {
      return User.createFromFacebook(fbUser).then((user) => {
        user.should.have.deep.property('facebook.id', fbUser.id)
        user.should.have.property('name', fbUser.name)
        user.should.have.property('email', fbUser.email)
        user.should.have.property('picture', fbUser.picture.data.url)
      })
    })

    it('should retrieve and update a user from facebook', function () {
      let user
      return User.create({ email: 'test@test.com', password: 'pass' }).then((u) => {
        user = u
        return User.createFromFacebook(fbUser)
      }).then((newUser) => {
        newUser.should.have.property('id', user.id)
        newUser.should.have.deep.property('facebook.id', fbUser.id)
        newUser.should.have.property('name', fbUser.name)
        newUser.should.have.property('email', fbUser.email)
        newUser.should.have.property('picture', fbUser.picture.data.url)
      })
    })
  })
})
