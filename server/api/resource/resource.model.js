'use strict'

import {Schema} from 'mongoose'
import Guide from '../guide/guide.model'

const ResourceSchema = new Schema({
  url: String,
  imageUrl: String
})

export default Guide.discriminator('Resource', ResourceSchema)
