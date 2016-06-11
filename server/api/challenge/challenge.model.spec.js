'use strict'

import '../../'
import * as factory from '../../services/factory'
import Challenge from './challenge.model'
import Tag from '../tag/tag.model'
import Guide from '../guide/guide.model'

describe('Challenge Model', function () {
  let user, challenge

  beforeEach(function () {
    return factory.clean()
      .then(() => factory.user())
      .tap((u) => { user = u })
      .then((user) => factory.challenge({user}))
      .then((c) => { challenge = c })
  })

  afterEach(function () {
    return factory.clean()
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

  it('should return a view', function () {
    const view = challenge.view()
    view.should.have.property('id').which.is.a('string')
    view.should.have.property('title').which.is.a('string')
    view.should.have.property('bigIdea')
    view.should.have.property('essentialQuestion')
    view.should.have.property('createdAt').which.is.instanceof(Date)
    view.should.have.property('updatedAt').which.is.instanceof(Date)
    view.should.have.property('user').which.exist
    view.should.have.property('users').which.exist
    view.should.have.property('photo')
    view.should.have.property('tags').which.have.lengthOf(3)
    view.should.have.property('guides').which.is.an('array')
  })

  it('should assign tags', function () {
    let tags
    return challenge.populate('tags').execPopulate().then(() => {
      tags = challenge.tags
      tags.should.all.have.property('count', 1)
      challenge.title = 'Testing'
      return challenge.save()
    }).then((challenge) => {
      return challenge.populate('tags').execPopulate()
    }).then((challenge) => {
      challenge.tags.should.all.have.property('count', 1)
      return Tag.findById(tags[0]._id)
    }).then((tag) => {
      tag.should.have.property('count', 0)
    })
  })

  describe('Pre save', function () {
    let assignTags

    before(function () {
      assignTags = sinon.spy(Challenge.prototype, 'assignTags')
    })

    beforeEach(function () {
      assignTags.reset()
    })

    after(function () {
      assignTags.restore()
    })

    it('should not assign new tags when challenge is saved', function () {
      return challenge.save().then(() => {
        assignTags.should.have.not.been.called
      })
    })

    it('should not assign new tags when challenge is saved with some path', function () {
      return factory.photo()
        .then((photo) => {
          challenge.photo = photo
          return challenge.save()
        })
        .then((challenge) => {
          assignTags.should.have.not.been.called
        })
    })

    const taggablePaths = Challenge.getTaggablePaths()

    taggablePaths.forEach((path) => {
      it(`should assign new tags when challenge is saved with new ${path}`, function () {
        challenge[path] = 'Testing'
        return challenge.save().then(() => {
          assignTags.should.have.been.calledOnce
        })
      })
    })
  })

  describe('Pre remove', function () {
    it('should remove challenge from guides when removing challenge', function () {
      return factory.guide({challenge})
        .then(() => Guide.find({challenge}).should.eventually.have.lengthOf(1))
        .then(() => challenge.remove())
        .then(() => Guide.find({challenge}).should.eventually.have.lengthOf(0))
    })
  })
})
