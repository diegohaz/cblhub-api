'use strict'

import '../../'
import * as factory from '../../services/factory'

describe('Question Model', function () {
  let question

  before(function () {
    return factory.question()
      .then((a) => { question = a })
  })

  after(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    const view = question.view()
    view.should.have.property('type', 'Question')
  })
})
