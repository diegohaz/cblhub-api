'use strict'

import { success, error, notFound } from '../../services/response/'
import { getMe } from '../../services/facebook'
import Session from './session.model'
import User from '../user/user.model'

export const index = ({ querymen: { query, cursor } }, res) =>
  Session.find(query, null, cursor)
    .populate('user')
    .then((sessions) => sessions.map((session) => session.view()))
    .then(success(res))
    .catch(error(res))

export const create = ({ user }, res) =>
  Session.create({ user })
    .then((session) => session.view(true))
    .then(success(res, 201))
    .catch(error(res))

export const createFromFacebook = ({ body }, res) => {
  if (!body.access_token) return res.status(400).send('Missing access_token')
  const fields = 'id, name, email, picture'

  return getMe({ accessToken: body.access_token, fields })
    .then((user) => User.createFromFacebook(user))
    .then((user) => Session.create({ user }))
    .then((session) => session.view(true))
    .then(success(res, 201))
    .catch(error(res))
}

export const destroy = ({ params: { token }, user }, res) =>
  token
  ? Session.findOne({ token })
    .then(notFound(res))
    .then((session) => session ? session.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
  : Session.find({ user })
    .then((sessions) => sessions.map((session) => session.remove()))
    .then(success(res, 204))
    .catch(error(res))
