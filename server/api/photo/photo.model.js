'use strict'

import Jimp from 'jimp'
import { uid } from 'rand-token'
import mongoose, { Schema } from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import mongooseCreateUnique from 'mongoose-create-unique'
import Challenge from '../challenge/challenge.model'

const PhotoObjectSchema = new Schema({
  src: String,
  width: Number,
  height: Number
})

const PhotoSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => uid(24)
  },
  color: String,
  thumbnail: PhotoObjectSchema,
  small: PhotoObjectSchema,
  medium: PhotoObjectSchema,
  large: PhotoObjectSchema,
  owner: String,
  url: String,
  title: {
    type: String,
    index: true
  }
}, {
  timestamps: true
})

PhotoSchema.pre('remove', function (next) {
  Challenge
    .update({ photo: this }, { $unset: { photo: '' } }, { multi: true })
    .then(() => next())
    .catch(next)
})

PhotoSchema.methods = {
  view () {
    const sizes = ['thumbnail', 'small', 'medium', 'large']
    const { id, title, owner, url, color } = this
    let view = { id, title, owner, url, color }

    sizes.forEach((size) => {
      if (!this[size]) return
      const { src, width, height } = this[size]
      view[size] = { src, width, height }
    })

    return view
  },

  pickColor () {
    return Jimp.read(this.thumbnail.src).then((image) => {
      image.resize(1, 1)
      this.color = `#${image.getPixelColor(0, 0).toString(16).slice(0, 6)}`
      return this.save()
    })
  }
}

PhotoSchema.statics = {
  translate (flickrPhoto) {
    const Photo = mongoose.model('Photo')
    const photo = new Photo()
    const sizes = ['thumbnail', 'small', 'medium', 'large']

    photo._id = flickrPhoto.id
    photo.owner = flickrPhoto.ownername
    photo.url = `https://www.flickr.com/photos/${photo.owner}/${photo._id}`
    photo.title = flickrPhoto.title

    sizes.forEach((size, i) => {
      let letter = size.charAt(0)
      const sizeExists = !!flickrPhoto[`url_${letter}`]
      if (!sizeExists && i > 0) {
        letter = sizes[i - 1].charAt(0)
      }
      photo[size] = {
        src: flickrPhoto[`url_${letter}`],
        width: flickrPhoto[`width_${letter}`],
        height: flickrPhoto[`height_${letter}`]
      }
    })

    return photo
  }
}

PhotoSchema.plugin(mongooseKeywords, { paths: ['title', 'owner'] })
PhotoSchema.plugin(mongooseCreateUnique)

export default mongoose.model('Photo', PhotoSchema)
