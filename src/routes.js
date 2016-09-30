import { Router } from 'express'

import user from './api/user'
import auth from './api/auth'
import passwordReset from './api/password-reset'
import challenge from './api/challenge'
import photo from './api/photo'
import guide from './api/guide'
import activity from './api/activity'
import question from './api/question'
import resource from './api/resource'
import tag from './api/tag'

const router = new Router()

/**
 * @apiDefine master Master access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine admin Admin access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine user User access only
 * You must pass `access_token` parameter or a Bearer Token authorization header
 * to access this endpoint.
 */
/**
 * @apiDefine listParams
 * @apiParam {String} [q] Query to search.
 * @apiParam {Number{1..30}} [page=1] Page number.
 * @apiParam {Number{1..100}} [limit=30] Amount of returned items.
 * @apiParam {String[]} [sort=-createdAt] Order of returned items.
 * @apiParam {String[]} [fields] Fields to be returned.
 */

router.use('/users', user)
router.use('/auth', auth)
router.use('/password-resets', passwordReset)
router.use('/challenges', challenge)
router.use('/photos', photo)
router.use('/guides', guide)
router.use('/activities', activity)
router.use('/questions', question)
router.use('/resources', resource)
router.use('/tags', tag)

export default router
