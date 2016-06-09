'use strict'

import _ from 'lodash'
import {success, error, notFound} from '../../services/response/'
import Challenge from './challenge.model'

export const index = ({querymen: {query, select, cursor}}, res) =>
  Challenge.find(query, select, cursor)
    .populate('user tags')
    .then((challenges) => challenges.map((challenge) => challenge.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({params}, res) =>
  Challenge.findById(params.id)
    .populate('user users tags')
    .then(notFound(res))
    .then((challenge) => challenge ? challenge.view(true) : null)
    .then(success(res))
    .catch(error(res))

export const create = ({body, user}, res) => {
  body.user = user
  return Challenge.create(body)
    .then((challenge) => challenge.view(true))
    .then(success(res, 201))
    .catch(error(res))
}

export const update = ({body, params, user}, res) => {
  const pick = ['title', 'bigIdea', 'essentialQuestion', 'description', 'photo', 'user', 'tags']
  return Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => {
      if (!challenge) return challenge
      const isAdmin = user.role === 'admin'
      const isSameUser = challenge.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
      } else {
        return challenge
      }
    })
    .then((challenge) => challenge ? _.assign(challenge, _.pick(body, pick)).save() : null)
    .then((challenge) => challenge ? challenge.view() : null)
    .then(success(res))
    .catch(error(res))
}

export const destroy = ({params, user}, res) =>
  Challenge.findById(params.id)
    .then(notFound(res))
    .then((challenge) => {
      if (!challenge) return challenge
      const isAdmin = user.role === 'admin'
      const isSameUser = challenge.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
      } else {
        return challenge
      }
    })
    .then((challenge) => challenge ? challenge.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
