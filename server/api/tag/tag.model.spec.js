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
    return factory.tag('School')
      .then(tag => tag.view())
      .then(view => {
        expect(view).to.have.property('id')
        expect(view).to.have.property('name', 'School')
      })
  })

  it('should combine tags with same name', function () {
    return factory.tags('Education', 'Education').then((tags) => {
      tags.should.have.lengthOf(2)
      tags[0].should.have.property('id', tags[1].id)
    })
  })

  it('should increment tags', function () {
    return factory.tags('Science', 'CBL', 'CBL')
      .then((tags) => Tag.increment(tags, 3).then(() => tags))
      .then((tags) => Tag.increment(tags, -1))
      .then(() => Tag.find({}))
      .then((tags) => tags.should.all.have.property('count', 2))
  })

})
