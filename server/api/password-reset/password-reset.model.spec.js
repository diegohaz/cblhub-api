'use strict'

import '../../'
import * as factory from '../../services/factory'
import PasswordReset from './password-reset.model'

describe('PasswordReset Model', function () {
  let user

  beforeEach(function () {
    return factory.clean()
      .then(() => factory.user())
      .then((u) => { user = u })
  })

  it('should return a view', function () {
    return PasswordReset.create({ user }).then((passwordReset) => {
      var view = passwordReset.view()
      view.should.have.property('user')
      view.should.have.property('token')
    })
  })
})
