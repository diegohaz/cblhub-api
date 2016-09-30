import { Router } from 'express'
import { middleware as query } from 'querymen'
import { middleware as body } from 'bodymen'
import { session } from '../../services/passport'
import { create, meta, index, show, update, destroy } from './resource.controller'
import { schema } from './resource.model'
export Resource, { schema } from './resource.model'

const router = new Router()
const { challenge, tags, title, description, guides, url, mediaType, image } = schema.tree

/**
 * @api {post} /resources Create resource
 * @apiName CreateResource
 * @apiGroup Resource
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam {String} url Resource's url.
 * @apiParam {String} mediaType Resource's mediaType.
 * @apiParam {String} image Resource's image.
 * @apiParam challenge Resource's challenge.
 * @apiParam tags Resource's tags.
 * @apiParam title Resource's title.
 * @apiParam description Resource's description.
 * @apiParam guides Resource's guides.
 * @apiSuccess {Object} resource Resource's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Resource not found.
 * @apiError 401 user access only.
 */
router.post('/',
  session({ required: true }),
  body({ challenge, tags, title, description, guides, url, mediaType, image }),
  create)

/**
 * @api {get} /resources/meta Retrieve metadata
 * @apiName RetrieveMeta
 * @apiGroup Resource
 * @apiParam {String} url Url to extract metadata.
 * @apiSuccess {Object} metadata Resource's metadata.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 */
router.get('/meta',
  query({ url: { type: String, required: true } }, { q: false }),
  meta)

/**
 * @api {get} /resources Retrieve resources
 * @apiName RetrieveResources
 * @apiGroup Resource
 * @apiUse listParams
 * @apiParam {String} users User's id(s) to filter.
 * @apiParam {String} challenges Challenge's id(s) to filter.
 * @apiParam {String} guides Guide's id(s) to filter.
 * @apiSuccess {Object[]} resources List of resources.
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
 * @api {get} /resources/:id Retrieve resource
 * @apiName RetrieveResource
 * @apiGroup Resource
 * @apiSuccess {Object} resource Resource's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Resource not found.
 */
router.get('/:id',
  show)

/**
 * @api {put} /resources/:id Update resource
 * @apiName UpdateResource
 * @apiGroup Resource
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiParam {String} url Resource's url.
 * @apiParam {String} mediaType Resource's mediaType.
 * @apiParam {String} image Resource's image.
 * @apiParam challenge Resource's challenge.
 * @apiParam tags Resource's tags.
 * @apiParam title Resource's title.
 * @apiParam description Resource's description.
 * @apiParam guides Resource's guides.
 * @apiSuccess {Object} resource Resource's data.
 * @apiError {Object} 400 Some parameters may contain invalid values.
 * @apiError 404 Resource not found.
 * @apiError 401 user access only.
 */
router.put('/:id',
  session({ required: true }),
  body({
    title: { ...title, required: false },
    challenge,
    tags,
    description,
    guides,
    url,
    mediaType,
    image
  }),
  update)

/**
 * @api {delete} /resources/:id Delete resource
 * @apiName DeleteResource
 * @apiGroup Resource
 * @apiPermission user
 * @apiParam {String} access_token user access token.
 * @apiSuccess (Success 204) 204 No Content.
 * @apiError 404 Resource not found.
 * @apiError 401 user access only.
 */
router.delete('/:id',
  session({ required: true }),
  destroy)

export default router
