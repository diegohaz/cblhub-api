'use strict'

import _ from 'lodash'
import { success, error, notFound } from '../../services/response/'
import Tag from './tag.model'

export const index = ({ querymen: { query, select, cursor } }, res) =>
  Tag.find(query, select, cursor)
    .then((tags) => tags.map((tag) => tag.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({ params }, res) =>
  Tag.findById(params.id)
    .then(notFound(res))
    .then((tag) => tag ? tag.view() : null)
    .then(success(res))
    .catch(error(res))

export const create = ({ body }, res) =>
  Tag.createUnique(body)
    .then((tag) => tag.view())
    .then(success(res, 201))
    .catch(error(res))

export const update = ({ body, params }, res) =>
  Tag.findById(params.id)
    .then(notFound(res))
    .then((tag) => tag ? _.assign(tag, _.omit(body, '_id')).save() : null)
    .then((tag) => tag ? tag.view() : null)
    .then(success(res))
    .catch(error(res))

export const destroy = ({ params }, res) =>
  Tag.findById(params.id)
    .then(notFound(res))
    .then((tag) => tag ? tag.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
