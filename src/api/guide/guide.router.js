import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { session } from '../../services/passport'
import { create, index, show, update, destroy } from './guide.controller'
import { schema } from './guide.model'
export Guide, { schema } from './guide.model'

const router = new Router()
const { challenge, tags, title, description, guides } = schema.tree

/**
 * @api {post} /guides Create guide
 * @apiName CreateGuide
 * @apiGroup Guide
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Guide's challenge.
 * @apiParam tags Guide's tags.
 * @apiParam title Guide's title.
 * @apiParam description Guide's description.
 * @apiParam guides Guide's guides.
 * @apiSuccess {Object} guide Guide's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Guide not found.
 * @apiError 401 user access only.
 */
router.post('/',
  session({ required: true }),
  body({ challenge, tags, title, description, guides }),
  create)

/**
 * @api {get} /guides Retrieve guides
 * @apiName RetrieveGuides
 * @apiGroup Guide
 * @apiUse listParams
 * @apiParam {String} users User's id(s) to filter.
 * @apiParam {String} challenges Challenge's id(s) to filter.
 * @apiParam {String="Activity", "Question", "Resource"} type Guide's type to filter.
 * @apiParam {String} guides Guide's id(s) to filter.
 * @apiSuccess {Object[]} guides List of guides.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query({
    users: { type: [String], paths: ['user'] },
    challenges: { type: [String], paths: ['challenge'] },
    type: { type: String, paths: ['__t'] },
    guides
  }),
  index)

/**
 * @api {get} /guides/:id Retrieve guide
 * @apiName RetrieveGuide
 * @apiGroup Guide
 * @apiSuccess {Object} guide Guide's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Guide not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /guides/:id Update guide
 * @apiName UpdateGuide
 * @apiGroup Guide
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Guide's challenge.
 * @apiParam tags Guide's tags.
 * @apiParam title Guide's title.
 * @apiParam description Guide's description.
 * @apiParam guides Guide's guides.
 * @apiSuccess {Object} guide Guide's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Guide not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  session({ required: true }),
  body({ title: { ...title, required: false }, challenge, tags, description, guides }),
  update)

/**
 * @api {delete} /guides/:id Delete guide
 * @apiName DeleteGuide
 * @apiGroup Guide
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Guide not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  session({ required: true }),
  destroy)

export default router
