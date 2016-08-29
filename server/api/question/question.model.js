'use strict'

import { Schema } from 'mongoose'
import Guide from '../guide/guide.model'

const QuestionSchema = new Schema()

export default Guide.discriminator('Question', QuestionSchema)
