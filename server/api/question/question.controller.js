'use strict'

import _ from 'lodash'
import {success, error, notFound} from '../../services/response/'
import Question from './question.model'

export const index = ({querymen: {query, select, cursor}}, res) =>
  Question.find(query, select, cursor)
    .populate('user tags challenge')
    .then((questions) => questions.map((question) => question.view()))
    .then(success(res))
    .catch(error(res))

export const show = ({params}, res) =>
  Question.findById(params.id)
    .populate('user tags challenge questions')
    .then(notFound(res))
    .then((question) => question ? question.view(true) : null)
    .then(success(res))
    .catch(error(res))

export const create = ({body, user}, res) => {
  body.user = user
  return Question.create(body)
    .then((question) => question.view(true))
    .then(success(res, 201))
    .catch(error(res))
}

export const update = ({body, params, user}, res) => {
  const pick = ['title', 'description', 'tags', 'questions', 'activities', 'resources']
  return Question.findById(params.id)
    .then(notFound(res))
    .then((question) => {
      if (!question) return question
      const isAdmin = user.role === 'admin'
      const isSameUser = question.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
      } else {
        return question
      }
    })
    .then((question) => question ? _.assign(question, _.pick(body, pick)).save() : null)
    .then((question) => question ? question.view() : null)
    .then(success(res))
    .catch(error(res))
}

export const destroy = ({params, user}, res) =>
  Question.findById(params.id)
    .then(notFound(res))
    .then((question) => {
      if (!question) return question
      const isAdmin = user.role === 'admin'
      const isSameUser = question.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
      } else {
        return question
      }
    })
    .then((question) => question ? question.remove() : null)
    .then(success(res, 204))
    .catch(error(res))
