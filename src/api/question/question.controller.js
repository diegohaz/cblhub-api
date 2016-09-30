import _ from 'lodash'
import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Question } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Question.create({ ...body, user })
    .then((question) => question.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Question.find(query, select, cursor)
    .populate('user challenge tags guides')
    .then((questions) => questions.map((question) => question.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Question.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then((question) => question ? question.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Question.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((question) => {
      if (!question) return null
      return _.mergeWith(question, body, (questionValue, bodyValue) => {
        if (!Array.isArray(questionValue) || !bodyValue) return
        const bodyValues = Array.isArray(bodyValue) ? bodyValue : [bodyValue]
        bodyValues.forEach((value) => {
          if (value.charAt(0) === '-') {
            questionValue.pull(value.slice(1))
          } else if (value.charAt(0) === '+') {
            questionValue.addToSet(value.slice(1))
          } else {
            questionValue.addToSet(value)
          }
        })
        return questionValue
      }).save()
    })
    .then((question) => question ? question.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Question.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((question) => question ? question.remove() : null)
    .then(success(res, 204))
    .catch(next)
