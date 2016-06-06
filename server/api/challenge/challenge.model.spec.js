'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import app from '../../'
import * as factory from '../../services/factory'

describe('Challenge Model', function () {
  let user, challenge

  before(function () {
    return factory.clean()
      .then(() => factory.user())
      .then((u) => {
        user = u
      })
  })

  afterEach(function () {
    return factory.clean()
  })

  vcr.it('should return a view', function () {
    return factory.challenge({user})
      .tap((c) => { challenge = c })
      .then((challenge) => challenge.view())
      .then((view) => {
        view.should.have.property('id')
      })
  })

  it('should update users when set user', function () {
    challenge.user.should.have.property('id', user.id)
    challenge.users.should.have.lengthOf(1)
    challenge.users[0].should.be.equal(user._id)

    return factory.user()
      .then((newUser) => {
        challenge.user = newUser
        challenge.users.should.have.lengthOf(1)
        challenge.users[0].should.be.equal(newUser._id)
      })
  })

})
