'use strict'

import mongoose from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import mongooseCreateUnique from 'mongoose-create-unique'
import {env} from '../../config'

var TagSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true,
    trim: true,
    required: true,
    unique: true
  }
})

TagSchema.methods.view = function () {
  const {id, name} = this
  return {id, name}
}

TagSchema.plugin(mongooseKeywords, {paths: ['name']})
TagSchema.plugin(mongooseCreateUnique)

export default mongoose.model('Tag', TagSchema)
