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
      .then(() => Session.find({user}).should.eventually.have.lengthOf(1))
      .then(() => user.remove())
      .then(() => Session.find({user}).should.eventually.have.lengthOf(0))
  })

  it('should remove user challenges after removing user', function () {
    let user
    return factory.user()
      .tap((u) => { user = u })
      .then((user) => factory.challenge({user}))
      .then(() => Challenge.find({user}).should.eventually.have.lengthOf(1))
      .then(() => Challenge.find({users: user}).should.eventually.have.lengthOf(1))
      .then(() => user.remove())
      .then(() => Challenge.find({user}).should.eventually.have.lengthOf(0))
      .then(() => Challenge.find({users: user}).should.eventually.have.lengthOf(0))
  })

  it('should authenticate user when valid password', function () {
    return factory.user()
      .then(user => user.authenticate('password').should.eventually.not.be.false)
  })

  it('should not authenticate user when invalid password', function () {
    return factory.user()
      .then(user => user.authenticate('blah').should.eventually.be.false)
  })
})
