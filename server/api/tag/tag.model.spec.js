'use strict'

import app from '../../'
import * as factory from '../../services/factory'
import Tag from './tag.model'

describe('Tag Model', function () {

  before(function () {
    return factory.clean()
  })

  afterEach(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    return factory.tag('Anitta')
      .then(tag => tag.view())
      .then(view => {
        expect(view).to.have.property('id')
        expect(view).to.have.property('name', 'Anitta')
      })
  })

  it('should combine tags with same name', function () {
    return factory.tags('Shakira', 'Shakira').then(tags => {
      tags.should.have.lengthOf(2)
      tags[0].should.have.property('id', tags[1].id)
    })
  })

})
