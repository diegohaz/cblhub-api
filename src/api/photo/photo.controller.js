import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { Photo } from '.'

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Photo.find(query, select, cursor)
    .then((photos) => photos.map((photo) => photo.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? photo.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ bodymen: { body }, params }, res, next) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? _.merge(photo, body).save() : null)
    .then((photo) => photo ? photo.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ params }, res, next) =>
  Photo.findById(params.id)
    .then(notFound(res))
    .then((photo) => photo ? photo.remove() : null)
    .then(success(res, 204))
    .catch(next)
