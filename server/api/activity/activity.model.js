'use strict'

import { Schema } from 'mongoose'
import Guide from '../guide/guide.model'

const ActivitySchema = new Schema({
  date: Date
})

export default Guide.discriminator('Activity', ActivitySchema)
