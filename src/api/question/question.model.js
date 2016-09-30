import { Schema } from 'mongoose'
import { Guide } from '../guide'

const questionSchema = new Schema()

export default Guide.discriminator('Question', questionSchema)
