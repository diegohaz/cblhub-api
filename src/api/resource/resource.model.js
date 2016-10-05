import { Schema } from 'mongoose'
import { Guide } from '../guide'

const resourceSchema = new Schema({
  url: String,
  mediaType: String,
  image: String
})

export default Guide.discriminator('Resource', resourceSchema)
