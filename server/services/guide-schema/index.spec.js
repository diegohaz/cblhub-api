'use strict'

import mongoose, {Schema} from 'mongoose'
import * as factory from '../factory'
import GuideSchema from './'

describe('GuideSchema Service', function () {
  let test

  const TestSchema = new GuideSchema({testPath: String})
  const Test = mongoose.model('Test', TestSchema)
  const fetchTags = sinon.stub(Test.prototype, 'fetchTags').returns(['foo', 'bar', 'baz'])

  before(function () {
    return factory.clean()
      .then(() => Test.create({title: 'Testing'}))
      .then((t) => { test = t })
  })

  after(function () {
    fetchTags.restore()
    return factory.clean()
  })

  it('should return a view', function () {
    const view = test.view()
    view.should.have.property('id', test.id.toString())
    view.should.have.property('title', 'Testing')
    view.should.have.property('description')
    view.should.have.property('createdAt').which.is.instanceof(Date)
    view.should.have.property('updatedAt').which.is.instanceof(Date)
    view.should.have.property('updatedAt').which.is.instanceof(Date)
    view.should.have.property('user')
    view.should.have.property('challenge')
    view.should.have.property('tags').which.is.an('array')
    view.should.have.property('questions').which.is.an('array')
    view.should.have.property('activities').which.is.an('array')
    view.should.have.property('resources').which.is.an('array')
  })

  describe('Pre save', function () {
    let assignTags

    before(function () {
      assignTags = sinon.spy(Test.prototype, 'assignTags')
    })

    beforeEach(function () {
      assignTags.reset()
    })

    after(function () {
      assignTags.restore()
    })

    it('should not assign new tags when test is saved', function () {
      return test.save().then(() => {
        assignTags.should.have.not.been.called
      })
    })

    it('should not assign new tags when test is saved with some path', function () {
      return factory.user()
        .then((user) => {
          test.user = user
          return test.save()
        })
        .then((test) => {
          assignTags.should.have.not.been.called
        })
    })

    const taggablePaths = Test.getTaggablePaths()

    taggablePaths.forEach((path) => {
      it(`should assign new tags when test is saved with new ${path}`, function () {
        test[path] = 'Test'
        return test.save().then(() => {
          assignTags.should.have.been.calledOnce
        })
      })
    })
  })
})
