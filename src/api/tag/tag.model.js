import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import mongooseCreateUnique from 'mongoose-create-unique'
import Promise from 'bluebird'
import '../challenge'

const tagSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    unique: true,
    lowercase: true
  },
  count: {
    type: Number,
    default: 0
  }
})

tagSchema.pre('remove', function (next) {
  const Challenge = this.model('Challenge')
  Challenge.update(
    { tags: this },
    { $pull: { tags: this._id } },
    { multi: true }
  ).exec(next)
})

tagSchema.methods = {
  view (full) {
    const view = {
      // simple view
      id: this.id,
      name: this.name,
      count: this.count
    }

    return full ? {
      ...view
      // add properties for a full view
    } : view
  }
}

tagSchema.statics = {
  increment (tags, amount = 1) {
    if (!tags.length) {
      return Promise.resolve()
    }
    return this.update(
      { _id: { $in: tags.map(({ _id }) => _id) } },
      { $inc: { count: amount } },
      { multi: true }
    ).exec()
  }
}

tagSchema.plugin(mongooseKeywords, { paths: ['name'] })
tagSchema.plugin(mongooseCreateUnique)

export default mongoose.model('Tag', tagSchema)
