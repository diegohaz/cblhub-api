import _ from 'lodash'
import { success, notFound, authorOrAdmin } from '../../services/response/'
import { getMeta } from '../../services/meta'
import { Resource } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Resource.create({ ...body, user })
    .then((resource) => resource.view(true))
    .then(success(res, 201))
    .catch(next)

export const meta = ({ querymen: { query } }, res, next) =>
  getMeta(query.url)
    .then(success(res))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Resource.find(query, select, cursor)
    .populate('user challenge tags guides')
    .then((resources) => resources.map((resource) => resource.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Resource.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then((resource) => resource ? resource.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Resource.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((resource) => {
      if (!resource) return null
      return _.mergeWith(resource, body, (resourceValue, bodyValue) => {
        if (!Array.isArray(resourceValue) || !bodyValue) return
        const bodyValues = Array.isArray(bodyValue) ? bodyValue : [bodyValue]
        bodyValues.forEach((value) => {
          if (value.charAt(0) === '-') {
            resourceValue.pull(value.slice(1))
          } else if (value.charAt(0) === '+') {
            resourceValue.addToSet(value.slice(1))
          } else {
            resourceValue.addToSet(value)
          }
        })
        return resourceValue
      }).save()
    })
    .then((resource) => resource ? resource.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Resource.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((resource) => resource ? resource.remove() : null)
    .then(success(res, 204))
    .catch(next)
