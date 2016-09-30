import mongoose, { Schema } from 'mongoose'
import jimp from 'jimp'
import { uid } from 'rand-token'
import mongooseKeywords from 'mongoose-keywords'
import mongooseCreateUnique from 'mongoose-create-unique'
import '../challenge'

const photoObjectSchema = new Schema({
  src: String,
  width: Number,
  height: Number
})

const photoSchema = new Schema({
  _id: {
    type: String,
    unique: true,
    default: () => uid(24)
  },
  color: String,
  thumbnail: photoObjectSchema,
  small: photoObjectSchema,
  medium: photoObjectSchema,
  large: photoObjectSchema,
  owner: String,
  url: String,
  title: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

photoSchema.pre('remove', function (next) {
  const Challenge = this.model('Challenge')
  Challenge.update(
    { photo: this },
    { $unset: { photo: '' } },
    { multi: true }
  ).exec(next)
})

photoSchema.methods = {
  view () {
    const sizes = ['thumbnail', 'small', 'medium', 'large']
    const { id, title, owner, url, color, createdAt, updatedAt } = this
    let view = { id, title, owner, url, color, createdAt, updatedAt }

    sizes.forEach((size) => {
      if (!this[size]) return
      const { src, width, height } = this[size]
      view[size] = { src, width, height }
    })

    return view
  },

  pickColor () {
    /* istanbul ignore next */
    return jimp.read(this.thumbnail.src).then((image) => {
      image.resize(1, 1)
      this.color = `#${image.getPixelColor(0, 0).toString(16).slice(0, 6)}`
      return this.save()
    })
  }
}

photoSchema.statics = {
  translateFromFlickr (flickrPhoto) {
    const Photo = mongoose.model('Photo')
    const sizes = ['thumbnail', 'small', 'medium', 'large']
    const photo = new Photo({
      _id: flickrPhoto.id,
      owner: flickrPhoto.ownername,
      url: `https://www.flickr.com/photos/${flickrPhoto.owner}/${flickrPhoto.id}`,
      title: flickrPhoto.title
    })

    sizes.forEach((size, i) => {
      let letter = size.charAt(0)
      const sizeExists = !!flickrPhoto[`url_${letter}`]
      if (!sizeExists && i > 0) {
        photo[size] = photo[sizes[i - 1]]
      } else {
        photo[size] = {
          src: flickrPhoto[`url_${letter}`],
          width: flickrPhoto[`width_${letter}`],
          height: flickrPhoto[`height_${letter}`]
        }
      }
    })

    return photo
  }
}

photoSchema.plugin(mongooseKeywords, { paths: ['title', 'owner'] })
photoSchema.plugin(mongooseCreateUnique)

export default mongoose.model('Photo', photoSchema)
