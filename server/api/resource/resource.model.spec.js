'use strict'

import '../../'
import * as factory from '../../services/factory'

describe('Resource Model', function () {
  let resource

  before(function () {
    return factory.resource({url: 'test.html', media: 'website', image: 'test.jpg'})
      .then((a) => { resource = a })
  })

  after(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    const view = resource.view()
    view.should.have.property('url', 'test.html')
    view.should.have.property('media', 'website')
    view.should.have.property('image', 'test.jpg')
    view.should.have.property('type', 'Resource')
  })

})
