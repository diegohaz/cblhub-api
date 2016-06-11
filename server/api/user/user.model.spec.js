'use strict'

import '../../'
import * as factory from '../../services/factory'
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
