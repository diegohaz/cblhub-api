'use strict'

import {errorHandler} from 'querymen'
import {Router} from 'express'
import challenge from './api/challenge'
import photo from './api/photo'
import question from './api/question'
import session from './api/session'
import tag from './api/tag'
import user from './api/user'

const router = new Router()

router.use('/challenges', challenge)
router.use('/photos', photo)
router.use('/questions', question)
router.use('/sessions', session)
router.use('/tags', tag)
router.use('/users', user)

router.use(errorHandler())

export default router
