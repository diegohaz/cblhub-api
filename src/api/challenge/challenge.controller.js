import _ from 'lodash'
import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Challenge } from './'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Challenge.create({ ...body, user })
    .then((challenge) => challenge.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Challenge.find(query, select, cursor)
    .then((challenges) => challenges.map((challenge) => challenge.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => challenge ? challenge.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((challenge) => challenge ? _.merge(challenge, body).save() : null)
    .then((challenge) => challenge ? challenge.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((challenge) => challenge ? challenge.remove() : null)
    .then(success(res, 204))
    .catch(next)
