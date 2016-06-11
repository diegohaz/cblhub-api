'use strict'

import _ from 'lodash'
import {success, error, notFound} from '../../services/response'
import Photo from './photo.model'
import {getPhotos} from '../../services/flickr'

export const index = ({querymen: {query, select, cursor}}, res) =>
  Photo.find(query, select, cursor)
    .then((photos) => photos.map((p) => p.view()))
    .then(success(res))
    .catch(error(res))

export const search = ({query: {q, limit}}, res) =>
  getPhotos(q, {limit})
    .then((photos) => Promise.all(photos.map((p) => Photo.translate(p).saveUnique())))
    .then((photos) => photos.map((p) => p.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({params}, res) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? photo.view() : null)
    .then(success(res))
    .catch(error(res))

export const update = ({body, params}, res) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? _.assign(photo, _.omit(body, '_id')).save() : null)
    .then((photo) => photo ? photo.view() : null)
    .then(success(res))
    .catch(error(res))

export const destroy = ({params}, res) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? photo.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
