'use strict'

import _ from 'lodash'
import {success, error, notFound} from '../../services/response/'
import Challenge from './challenge.model'

export const index = ({querymen: {query, select, cursor}}, res) =>
  Challenge.find(query, select, cursor)
    .then((challenges) => challenges.map((challenge) => challenge.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({params}, res) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => challenge ? challenge.view() : null)
    .then(success(res))
    .catch(error(res))

export const create = ({body}, res) =>
  Challenge.createUnique(body)
    .then((challenge) => challenge.view())
    .then(success(res, 201))
    .catch(error(res))

export const update = ({body, params}, res) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => challenge ? _.assign(challenge, _.omit(body, '_id')).save() : null)
    .then((challenge) => challenge ? challenge.view() : null)
    .then(success(res))
    .catch(error(res))

export const destroy = ({params}, res) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => challenge ? challenge.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
