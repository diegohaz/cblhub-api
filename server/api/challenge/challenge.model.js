'use strict'

import mongoose, {Schema} from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import _ from 'lodash'
import {getKeywords} from '../../services/watson'
import Tag from '../tag/tag.model'

const ChallengeSchema = new Schema({
  user: {
    type: Schema.ObjectId,
    ref: 'User',
    index: true,
    required: true
  },
  users: [{
    type: Schema.ObjectId,
    ref: 'User'
  }],
  photo: {
    type: Schema.ObjectId,
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
  questions: [{
    type: Schema.ObjectId,
    ref: 'Question'
  }],
  activities: [{
    type: Schema.ObjectId,
    ref: 'Activity'
  }],
  resources: [{
    type: Schema.ObjectId,
    ref: 'Resource'
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
  const paths = ['title', 'bigIdea', 'essentialQuestion', 'description']
  const modified = paths.map((path) => this.isModified(path)).find((modified) => !!modified)

  if (modified) {
    this.fetchTags(paths.map((path) => this[path]).join('\n\n'))
      .then(() => next())
      .catch(next)
  }
})

ChallengeSchema.methods.fetchTags = function (text) {
  return Tag.increment(this.tags, -1)
    .then(() => getKeywords(text))
    .then((tags) => Tag.createUnique(tags.map((name) => ({name}))))
    .tap((tags) => { this.tags = tags })
    .then((tags) => Tag.increment(tags))
}

ChallengeSchema.methods.view = function (full) {
  const {description, user, users, photo, tags, questions, activities, resources} = this
  return {
    ..._.pick(this, [
      'id', 'title', 'bigIdea', 'essentialQuestion', 'createdAt', 'updatedAt'
    ]),
    description: full ? description : undefined,
    user: user ? user.view() : undefined,
    users: users ? users.map((user) => user.view()) : undefined,
    photo: photo ? photo.view() : undefined,
    tags: tags ? tags.map((tag) => tag.view()) : undefined,
    questions: questions ? questions.map((question) => question.view(full)) : undefined,
    activities: activities ? activities.map((activity) => activity.view(full)) : undefined,
    resources: resources ? resources.map((resource) => resource.view(full)) : undefined
  }
}

ChallengeSchema.plugin(mongooseKeywords, {
  paths: ['bigIdea', 'tags', 'questions', 'activities', 'resources']
})

export default mongoose.model('Challenge', ChallengeSchema)
