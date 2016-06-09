'use strict'

import mongoose, {Schema} from 'mongoose'
import GuideSchema from '../../services/guide-schema'

const QuestionSchema = new GuideSchema()

export default mongoose.model('Question', QuestionSchema)
