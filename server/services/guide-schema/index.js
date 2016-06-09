'use strict'

import util from 'util'
import {Schema} from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import _ from 'lodash'
import {getKeywords} from '../watson'
import Tag from '../../api/tag/tag.model'

function GuideSchema () {
  Schema.apply(this, arguments)

  this.add({
    user: {
      type: Schema.ObjectId,
      ref: 'User',
      index: true
    },
    challenge: {
      type: Schema.ObjectId,
      ref: 'Challenge',
      index: true
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
  })

  this.set('timestamps', true)

  this.pre('save', function (next) {
    const taggablePaths = this.constructor.getTaggablePaths()
    const modified = taggablePaths.map((path) => this.isModified(path)).find(_.identity)

    if (modified) {
      this.assignTags().then(() => next()).catch(next)
    } else {
      next()
    }
  })

  this.methods = {
    view (full) {
      const {user, tags, challenge, questions, activities, resources} = this
      return {
        ..._.pick(this, [
          'id', 'title', 'description', 'createdAt', 'updatedAt'
        ]),
        user: user ? user.view() : undefined,
        tags: tags ? tags.map((tag) => tag.view()) : undefined,
        challenge: challenge ? challenge.view() : undefined,
        questions: questions ? questions.map((question) => question.view(full)) : undefined,
        activities: activities ? activities.map((activity) => activity.view(full)) : undefined,
        resources: resources ? resources.map((resource) => resource.view(full)) : undefined
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

  this.statics = {
    getTaggablePaths () {
      return ['title', 'description']
    }
  }

  this.plugin(mongooseKeywords, {paths: ['title', 'tags']})
}

util.inherits(GuideSchema, Schema)

export default GuideSchema
