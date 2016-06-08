'use strict'

import mongoose, {Schema} from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import mongooseCreateUnique from 'mongoose-create-unique'
import Promise from 'bluebird'

const TagSchema = new Schema({
  name: {
    type: String,
    index: true,
    trim: true,
    required: true,
    unique: true
  },
  count: {
    type: Number,
    default: 0
  }
})

TagSchema.methods.view = function () {
  const {id, name} = this
  return {id, name}
}

TagSchema.statics.increment = function (tags, amount = 1) {
  if (!tags.length) {
    return Promise.resolve()
  }
  return this.update(
    {_id: {$in: tags.map(({_id}) => _id)}},
    {$inc: {count: amount}},
    {multi: true}
  ).exec()
}

TagSchema.plugin(mongooseKeywords, {paths: ['name']})
TagSchema.plugin(mongooseCreateUnique)

export default mongoose.model('Tag', TagSchema)
