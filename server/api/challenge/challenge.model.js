'use strict'

import Promise from 'bluebird'
import mongoose, {Schema} from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import _ from 'lodash'
import {getKeywords} from '../../services/watson'
import Tag from '../tag/tag.model'
import Guide from '../guide/guide.model'

const ChallengeSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true
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
  },
  guides: [{
    type: Schema.ObjectId,
    ref: 'Guide'
  }]
}, {
  timestamps: true
})

ChallengeSchema.path('user').set(function (user) {
  this.user && this.users.pull(this.user)
  user && this.users.addToSet(user)

  return user
})

ChallengeSchema.pre('save', function (next) {
  const taggablePaths = this.constructor.getTaggablePaths()
  const tagsModified = taggablePaths.map((path) => this.isModified(path)).find(_.identity)
  const photoModified = this.isModified('photo') && this.photo

  const promises = []

  tagsModified && promises.push(this.assignTags())
  photoModified && promises.push(this.photo.pickColor())

  Promise.all(promises).then(() => next()).catch(next)
})

ChallengeSchema.pre('remove', function (next) {
  return Guide.update({challenge: this}, {$unset: {challenge: ''}}, {multi: true})
    .then(() => next())
    .catch(next)
})

ChallengeSchema.methods = {
  view (full) {
    const {description, user, users, photo, tags, guides} = this
    return {
      ..._.pick(this, [
        'id', 'title', 'bigIdea', 'essentialQuestion', 'createdAt', 'updatedAt'
      ]),
      description: full ? description : undefined,
      user: user ? user.view() : undefined,
      users: users ? users.map((user) => user.view()) : undefined,
      photo: photo ? photo.view && photo.view() || photo : undefined,
      tags: tags ? tags.map((tag) => tag.view()) : undefined,
      guides: guides ? guides.map((guide) => guide.view(full)) : undefined
    }
  },

  assignTags () {
    return Tag.increment(this.tags, -1)
      .then(() => this.fetchTags())
      .then((tags) => Tag.createUnique(tags.map((name) => ({name}))))
      .tap((tags) => { this.tags = tags })
      .then((tags) => Tag.increment(tags))
  },

  fetchTags () {
    const paths = this.constructor.getTaggablePaths()
    return getKeywords(paths.map((path) => this[path]).join('\n\n'))
  }
}

ChallengeSchema.statics = {
  getTaggablePaths () {
    return ['title', 'bigIdea', 'essentialQuestion', 'description']
  }
}

ChallengeSchema.plugin(mongooseKeywords, {paths: ['bigIdea', 'tags', 'guides']})

export default mongoose.model('Challenge', ChallengeSchema)
