import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { session } from '../../services/passport'
import { create, index, show, update, destroy } from './activity.controller'
import { schema } from './activity.model'
export Activity, { schema } from './activity.model'

const router = new Router()
const { challenge, tags, title, description, guides, date } = schema.tree

/**
 * @api {post} /activities Create activity
 * @apiName CreateActivity
 * @apiGroup Activity
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Activity's challenge.
 * @apiParam tags Activity's tags.
 * @apiParam title Activity's title.
 * @apiParam description Activity's description.
 * @apiParam guides Activity's guides.
 * @apiParam date Activity's date with format YYYY-MM-DD.
 * @apiSuccess {Object} activity Activity's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Activity not found.
 * @apiError 401 user access only.
 */
router.post('/',
  session({ required: true }),
  body({ challenge, tags, title, description, guides, date }),
  create)

/**
 * @api {get} /activities Retrieve activities
 * @apiName RetrieveActivities
 * @apiGroup Activity
 * @apiUse listParams
 * @apiParam {String} users User's id(s) to filter.
 * @apiParam {String} challenges Challenge's id(s) to filter.
 * @apiParam {String} guides Guide's id(s) to filter.
 * @apiSuccess {Object[]} activities List of activities.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query({
    users: { type: [String], paths: ['user'] },
    challenges: { type: [String], paths: ['challenge'] },
    guides
  }),
  index)

/**
 * @api {get} /activities/:id Retrieve activity
 * @apiName RetrieveActivity
 * @apiGroup Activity
 * @apiSuccess {Object} activity Activity's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Activity not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /activities/:id Update activity
 * @apiName UpdateActivity
 * @apiGroup Activity
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Activity's challenge.
 * @apiParam tags Activity's tags.
 * @apiParam title Activity's title.
 * @apiParam description Activity's description.
 * @apiParam guides Activity's guides.
 * @apiParam date Activity's date with format YYYY-MM-DD.
 * @apiSuccess {Object} activity Activity's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Activity not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  session({ required: true }),
  body({ title: { ...title, required: false }, challenge, tags, description, guides, date }),
  update)

/**
 * @api {delete} /activities/:id Delete activity
 * @apiName DeleteActivity
 * @apiGroup Activity
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Activity not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  session({ required: true }),
  destroy)

export default router
