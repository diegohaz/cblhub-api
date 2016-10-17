import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { token } from '../../services/passport'
import { create, index, show, update, destroy } from './question.controller'
import { schema } from './question.model'
export Question, { schema } from './question.model'

const router = new Router()
const { challenge, tags, title, description, guides } = schema.tree

/**
 * @api {post} /questions Create question
 * @apiName CreateQuestion
 * @apiGroup Question
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Question's challenge.
 * @apiParam tags Question's tags.
 * @apiParam title Question's title.
 * @apiParam description Question's description.
 * @apiParam guides Question's guides.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 user access only.
 */
router.post('/',
  token({ required: true }),
  body({ challenge, tags, title, description, guides }),
  create)

/**
 * @api {get} /questions Retrieve questions
 * @apiName RetrieveQuestions
 * @apiGroup Question
 * @apiUse listParams
 * @apiParam {String} users User's id(s) to filter.
 * @apiParam {String} challenges Challenge's id(s) to filter.
 * @apiParam {String} guides Guide's id(s) to filter.
 * @apiSuccess {Object[]} questions List of questions.
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
 * @api {get} /questions/:id Retrieve question
 * @apiName RetrieveQuestion
 * @apiGroup Question
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /questions/:id Update question
 * @apiName UpdateQuestion
 * @apiGroup Question
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam challenge Question's challenge.
 * @apiParam tags Question's tags.
 * @apiParam title Question's title.
 * @apiParam description Question's description.
 * @apiParam guides Question's guides.
 * @apiSuccess {Object} question Question's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Question not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  token({ required: true }),
  body({ title: { ...title, required: false }, challenge, tags, description, guides }),
  update)

/**
 * @api {delete} /questions/:id Delete question
 * @apiName DeleteQuestion
 * @apiGroup Question
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Question not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  token({ required: true }),
  destroy)

export default router
