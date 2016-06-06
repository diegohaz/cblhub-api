'use strict'

import _ from 'lodash'
import {success, error, notFound} from '../../services/response/'
import User from './user.model'

export const index = ({querymen: {query, select, cursor}}, res) =>
  User.find(query, select, cursor)
    .then((users) => users.map((user) => user.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({params}, res) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.view() : null)
    .then(success(res))
    .catch(error(res))

export const me = ({user}, res) =>
  res.json(user.view(true))

export const create = ({body}, res) =>
  User.create(body)
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch(error(res))

export const update = ({body, params, user}, res) =>
  User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return result
      const isAdmin = user.role === 'admin'
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).end()
      } else if (isAdmin && body.password) {
        res.status(400).end()
      } else {
        return result
      }
    })
    .then((user) => user ? _.merge(user, _.omit(body, ['_id', 'role', 'createdAt', 'updatedAt'])).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(error(res))

export const destroy = ({params}, res) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
