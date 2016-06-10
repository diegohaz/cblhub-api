'use strict'

import app from '../../'
import * as factory from '../../services/factory'

describe('Activity Model', function () {
  let activity

  before(function () {
    return factory.activity({date: Date.now()})
      .then((a) => { activity = a })
  })

  after(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    const view = activity.view()
    view.should.have.property('date')
    view.should.have.property('type', 'Activity')
  })

})
