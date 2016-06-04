'use strict'

import _ from 'lodash'
import * as response from '../../services/response/'
import Tag from './tag.model'

// Gets a list of Tags
export function index ({querymen}, res) {
  const {query, select, cursor} = querymen

  return Tag
    .find(query, select, cursor)
    .then(tags => tags.map(t => t.view()))
    .then(response.success(res))
    .catch(response.error(res))
}

// Gets a single Tag from the DB
export function show ({params}, res) {
  return Tag
    .findById(params.id)
    .then(response.notFound(res))
    .then(tag => tag ? tag.view() : null)
    .then(response.success(res))
    .catch(response.error(res))
}

// Creates a new Tag in the DB
export function create ({body}, res) {
  return Tag
    .createUnique(body)
    .then(tag => tag.view())
    .then(response.success(res, 201))
    .catch(response.error(res))
}

// Updates an existing Tag in the DB
export function update ({body, params}, res) {
  if (body._id) delete body._id

  return Tag
    .findById(params.id)
    .then(response.notFound(res))
    .then(tag => tag ? _.assign(tag, body).save() : null)
    .then(tag => tag ? tag.view() : null)
    .then(response.success(res))
    .catch(response.error(res))
}

// Deletes a Tag from the DB
export function destroy ({params}, res) {
  return Tag
    .findById(params.id)
    .then(response.notFound(res))
    .then(tag => tag ? tag.remove() : null)
    .then(response.success(res, 204))
    .catch(response.error(res))
}
