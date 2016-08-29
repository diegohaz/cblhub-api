'use strict'

import { errorHandler } from 'querymen'
import { Router } from 'express'
import activity from './api/activity'
import challenge from './api/challenge'
import guide from './api/guide'
import photo from './api/photo'
import question from './api/question'
import resource from './api/resource'
import session from './api/session'
import tag from './api/tag'
import user from './api/user'

const router = new Router()

router.use('/activities', activity)
router.use('/challenges', challenge)
router.use('/guides', guide)
router.use('/photos', photo)
router.use('/questions', question)
router.use('/resources', resource)
router.use('/sessions', session)
router.use('/tags', tag)
router.use('/users', user)

router.use(errorHandler())

export default router
