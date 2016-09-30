import { Schema } from 'mongoose'
import { Guide } from '../guide'

const questionSchema = new Schema({
  url: String,
  mediaType: String,
  image: String
})

export default Guide.discriminator('Question', questionSchema)
