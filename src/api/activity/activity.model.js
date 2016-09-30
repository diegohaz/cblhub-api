import { Schema } from 'mongoose'
import { Guide } from '../guide'

const activitySchema = new Schema({
  date: Date
})

export default Guide.discriminator('Activity', activitySchema)
