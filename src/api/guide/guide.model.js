import _ from 'lodash'
import Promise from 'bluebird'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import { getKeywords } from '../../services/watson'
import '../tag'
import '../challenge'

const guideSchema = new Schema({
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
  guides: [{
    type: Schema.ObjectId,
    ref: 'Guide',
    index: true
  }],
  title: {
    type: String,
    required: true,
    maxlength: 96
  },
  description: {
    type: String,
    maxlength: 2048
  }
}, {
  timestamps: true
})

guideSchema.pre('save', function (next) {
  const taggablePaths = this.constructor.taggablePaths
  const tagsModified = taggablePaths.map((path) => this.isModified(path)).find(_.identity)
  const promises = []

  tagsModified && promises.push(this.assignTags())

  if (this.isModified('challenge') && this.challenge) {
    this.challenge.guides.addToSet(this)
    promises.push(this.challenge.save())
  }

  if (this.isModified('guides')) {
    promises.push(this.model('Guide').update(
      { _id: { $in: this.guides.map((guide) => guide._id ? guide._id : guide) } },
      { $addToSet: { guides: this } },
      { multi: true }
    ))
  }

  Promise.all(promises).then(() => next()).catch(next)
})

guideSchema.pre('remove', function (next) {
  const Challenge = this.model('Challenge')
  const Guide = this.model('Guide')
  return Challenge.update({ guides: this }, { $pull: { guides: this._id } }, { multi: true })
    .then(() => Guide.update({ guides: this }, { $pull: { guides: this._id } }, { multi: true }))
    .then(() => next())
    .catch(next)
})

guideSchema.virtual('type').get(function () {
  return this.__t
})

guideSchema.methods = {
  view () {
    const { user, tags, challenge, guides } = this
    const omittedPaths = ['_id', '__v', '__t', 'user', 'tags', 'challenge', 'guides']
    return {
      ..._.omit(this.toObject({ virtuals: true }), omittedPaths),
      user: user ? user.view() : undefined,
      tags: tags ? tags.map((tag) => tag.view()) : undefined,
      challenge: challenge ? challenge.view() : undefined,
      guides: guides ? guides.map((guide) => guide.view()) : undefined
    }
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

guideSchema.statics = {
  taggablePaths: ['title', 'description']
}

guideSchema.plugin(mongooseKeywords, { paths: ['title', 'tags'] })

export default mongoose.model('Guide', guideSchema)
