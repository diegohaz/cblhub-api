'use strict'

import _ from 'lodash'
import { success, error, notFound } from '../../services/response/'
import { getMe } from '../../services/facebook'
import User from './user.model'

export const index = ({ querymen: { query, select, cursor } }, res) =>
  User.find(query, select, cursor)
    .then((users) => users.map((user) => user.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({ params }, res) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.view() : null)
    .then(success(res))
    .catch(error(res))

export const showMe = ({ user }, res) =>
  res.json(user.view(true))

export const create = ({ body }, res) =>
  User.create(body)
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        res.status(400).send('User email already registered')
      } else {
        error(res)(err)
      }
    })

export const createFromFacebook = ({ body }, res) => {
  if (!body.access_token) return res.status(400).send('Missing access_token')
  const fields = 'id, name, email, picture'

  return getMe({ accessToken: body.access_token, fields })
    .then((user) => User.createFromFacebook(user))
    .then((user) => user.view(true))
    .then(success(res, 201))
    .catch(error(res, 400))
}

export const update = ({ body, params, user }, res) => {
  const omittedPaths = ['_id', 'role', 'createdAt', 'updatedAt']
  if (body.password) return res.status(401).send('You can not change password this way')

  return User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isAdmin = user.role === 'admin'
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate && !isAdmin) {
        res.status(401).send('You can not change other user\'s data')
        return null
      }
      return result
    })
    .then((user) => user ? _.merge(user, _.omit(body, omittedPaths)).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(error(res))
}

export const updatePassword = ({ body: { password }, params, user }, res) => {
  if (!password) return res.status(400).send('Missing password')

  return User.findById(params.id === 'me' ? user.id : params.id)
    .then(notFound(res))
    .then((result) => {
      if (!result) return null
      const isSelfUpdate = user.id === result.id
      if (!isSelfUpdate) {
        res.status(401).send('You can not change other user\'s password')
        return null
      }
      return result
    })
    .then((user) => user ? user.set({ password }).save() : null)
    .then((user) => user ? user.view(true) : null)
    .then(success(res))
    .catch(error(res))
}

export const destroy = ({ params }, res) =>
  User.findById(params.id)
    .then(notFound(res))
    .then((user) => user ? user.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
