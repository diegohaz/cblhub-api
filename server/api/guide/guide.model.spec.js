'use strict'

import '../..'
import * as factory from '../../services/factory'
import Guide from './guide.model'
import Challenge from '../challenge/challenge.model'

describe('Guide Model', function () {
  let guide

  before(function () {
    return factory.clean()
      .then(() => factory.guide({title: 'Testing', type: 'Test'}))
      .then((g) => { guide = g })
  })

  after(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    const view = guide.view()
    view.should.have.property('id', guide.id.toString())
    view.should.have.property('title', 'Testing')
    view.should.have.property('createdAt').which.is.instanceof(Date)
    view.should.have.property('updatedAt').which.is.instanceof(Date)
    view.should.have.property('user')
    view.should.have.property('challenge')
    view.should.have.property('tags').which.is.an('array')
    view.should.have.property('guides').which.is.an('array')
  })

  describe('Pre save', function () {
    let assignTags

    before(function () {
      assignTags = sinon.spy(Guide.prototype, 'assignTags')
    })

    beforeEach(function () {
      assignTags.reset()
    })

    after(function () {
      assignTags.restore()
    })

    it('should add guide to challenge', function () {
      return factory.challenge()
        .then((challenge) => factory.guide({challenge}))
        .then((guide) => Challenge.find({guides: guide}).should.eventually.have.lengthOf(1))
    })

    it('should add guide to related guide', function () {
      return factory.guide()
        .then((guide) => factory.guide({guides: [guide]}))
        .then((guide) => Guide.find({guides: guide}).should.eventually.have.lengthOf(1))
    })

    it('should not assign new tags when guide is saved', function () {
      return guide.save().then(() => {
        assignTags.should.have.not.been.called
      })
    })

    it('should not assign new tags when guide is saved with some path', function () {
      return factory.user()
        .then((user) => {
          guide.user = user
          return guide.save()
        })
        .then((guide) => {
          assignTags.should.have.not.been.called
        })
    })

    const taggablePaths = Guide.getTaggablePaths()

    taggablePaths.forEach((path) => {
      it(`should assign new tags when guide is saved with new ${path}`, function () {
        guide[path] = 'Test'
        return guide.save().then(() => {
          assignTags.should.have.been.calledOnce
        })
      })
    })
  })

  describe('Pre remove', function () {
    it('should pull guides from challenge after removing guide', function () {
      return factory.challenge({guides: [guide]})
        .then(() => Challenge.find({guides: guide}).should.eventually.have.lengthOf(1))
        .then(() => guide.remove())
        .then(() => Challenge.find({guides: guide}).should.eventually.have.lengthOf(0))
    })

    it('should pull guides from guide after removing guide', function () {
      let guide
      return factory.guide()
        .tap((g) => { guide = g })
        .then(() => factory.guide({guides: [guide]}))
        .then(() => Guide.find({guides: guide}).should.eventually.have.lengthOf(1))
        .then(() => guide.remove())
        .then(() => Guide.find({guides: guide}).should.eventually.have.lengthOf(0))
    })
  })
})
