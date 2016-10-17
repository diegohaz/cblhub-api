import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './challenge.controller'
import { schema } from './challenge.model'
export Challenge, { schema } from './challenge.model'

const router = new Router()
const { photo, title, bigIdea, essentialQuestion, description, users } = schema.tree

/**
 * @api {post} /challenges Create challenge
 * @apiName CreateChallenge
 * @apiGroup Challenge
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam photo Challenge's photo.
 * @apiParam title Challenge's title.
 * @apiParam bigIdea Challenge's bigIdea.
 * @apiParam essentialQuestion Challenge's essentialQuestion.
 * @apiParam description Challenge's description.
 * @apiSuccess {Object} challenge Challenge's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Challenge not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ photo, title, bigIdea, essentialQuestion, description }),
  create)

/**
 * @api {get} /challenges Retrieve challenges
 * @apiName RetrieveChallenges
 * @apiGroup Challenge
 * @apiUse listParams
 * @apiSuccess {Object[]} challenges List of challenges.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/',
  query({ users }),
  index)

/**
 * @api {get} /challenges/:id Retrieve challenge
 * @apiName RetrieveChallenge
 * @apiGroup Challenge
 * @apiSuccess {Object} challenge Challenge's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Challenge not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /challenges/:id Update challenge
 * @apiName UpdateChallenge
 * @apiGroup Challenge
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam photo Challenge's photo.
 * @apiParam title Challenge's title.
 * @apiParam bigIdea Challenge's bigIdea.
 * @apiParam essentialQuestion Challenge's essentialQuestion.
 * @apiParam description Challenge's description.
 * @apiSuccess {Object} challenge Challenge's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Challenge not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ title: { ...title, required: false }, photo, bigIdea, essentialQuestion, description }),
  update)

/**
 * @api {delete} /challenges/:id Delete challenge
 * @apiName DeleteChallenge
 * @apiGroup Challenge
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Challenge not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
