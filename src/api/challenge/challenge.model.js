import _ from 'lodash'
import Promise from 'bluebird'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { getKeywords } from '../../services/watson'
import '../tag'
import '../guide'

const challengeSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  photo: {
    type: String,
    ref: 'Photo'
  },
  tags: [{
    type: Schema.ObjectId,
    ref: 'Tag'
  }],
  guides: [{
    type: Schema.ObjectId,
    ref: 'Guide'
  }],
  title: {
    type: String,
    required: true,
    maxlength: 96
  },
  bigIdea: {
    type: String,
    maxlength: 48
  },
  essentialQuestion: {
    type: String,
    maxlength: 96
  },
  description: {
    type: String,
    maxlength: 2048
  }
}, {
  timestamps: true
})

challengeSchema.path('user').set(function (user) {
  this.user && this.users.pull(this.user)
  user && this.users.addToSet(user)
  return user
})

challengeSchema.pre('save', function (next) {
  const taggablePaths = this.constructor.taggablePaths
  const tagsModified = taggablePaths.map((path) => this.isModified(path)).find(_.identity)
  const photoModified = this.isModified('photo') && this.photo

  const promises = []

  tagsModified && promises.push(this.assignTags())
  photoModified && promises.push(
    this.populate('photo').execPopulate().then(() => this.photo.pickColor())
  )

  Promise.all(promises).then(() => next()).catch(next)
})

challengeSchema.pre('remove', function (next) {
  const Guide = this.model('Guide')
  Guide.update(
    { challenge: this },
    { $unset: { challenge: '' } },
    { multi: true }
  ).exec(next)
})

challengeSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      user: this.user ? this.user.view(full) : undefined,
      users: this.users ? this.users.map((user) => user.view()) : undefined,
      photo: this.photo ? this.photo.view() : undefined,
      tags: this.tags ? this.tags.map((tag) => tag.view()) : undefined,
      guides: this.guides ? this.guides.map((guide) => guide.view()) : undefined,
      title: this.title,
      bigIdea: this.bigIdea,
      essentialQuestion: this.essentialQuestion,
      description: this.description,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }

    return full ? {
      ...view,
      // add properties for a full view
      description: this.description
    } : view
  },

  assignTags () {
    const Tag = this.model('Tag')
    const paths = this.constructor.taggablePaths
    return Tag.increment(this.tags, -1)
      .then(() => getKeywords(paths.map((path) => this[path]).join('\n\n')))
      .then((tags) => Tag.createUnique(tags.map((name) => ({ name }))))
      .tap((tags) => { this.tags = tags })
      .then((tags) => Tag.increment(tags))
  }
}

challengeSchema.statics = {
  taggablePaths: ['title', 'bigIdea', 'essentialQuestion', 'description']
}

challengeSchema.plugin(mongooseKeywords, { paths: ['bigIdea', 'tags', 'guides'] })

export default mongoose.model('Challenge', challengeSchema)
