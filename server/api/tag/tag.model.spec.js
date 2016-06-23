'use strict'

import '../../'
import * as factory from '../../services/factory'
import Tag from './tag.model'
import Challenge from '../challenge/challenge.model'

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
        view.should.to.have.property('id')
        view.should.to.have.property('name', 'school')
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

  it('should remove tag from challenges after removing tag', function () {
    return factory.challenge({title: 'foo'})
      .tap((challenge) => challenge.should.have.property('tags').with.lengthOf(3))
      .then(() => Tag.findOne({name: 'foo'}))
      .tap((tag) => tag.should.have.property('name', 'foo'))
      .then((tag) => tag.remove())
      .then(() => Challenge.findOne({}))
      .then((challenge) => challenge.should.have.property('tags').with.lengthOf(2))
  })
})
