import _ from 'lodash'
import { success, notFound } from '../../services/response/'
import { Guide } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Guide.create({ ...body, user })
    .then((guide) => guide.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) => {
  Guide.find(query, select, cursor)
    .populate('user challenge tags guides')
    .then((guides) => guides.map((guide) => guide.view()))
    .then(success(res))
    .catch(next)
}

export const show = ({ params }, res, next) =>
  Guide.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then((guide) => guide ? guide.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Guide.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then((guide) => {
      if (!guide) return null
      const isAdmin = user.role === 'admin'
      const isSameUser = guide.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
        return null
      }
      return guide
    })
    .then((guide) => {
      if (!guide) return null
      return _.mergeWith(guide, body, (guideValue, bodyValue) => {
        if (!Array.isArray(guideValue) || !bodyValue) return
        const bodyValues = Array.isArray(bodyValue) ? bodyValue : [bodyValue]
        bodyValues.forEach((value) => {
          if (value.charAt(0) === '-') {
            guideValue.pull(value.slice(1))
          } else if (value.charAt(0) === '+') {
            guideValue.addToSet(value.slice(1))
          } else {
            guideValue.addToSet(value)
          }
        })
        return guideValue
      }).save()
    })
    .then((guide) => guide ? guide.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Guide.findById(params.id)
    .then(notFound(res))
    .then((guide) => {
      if (!guide) return null
      const isAdmin = user.role === 'admin'
      const isSameUser = guide.user.equals(user.id)
      if (!isSameUser && !isAdmin) {
        res.status(401).end()
        return null
      }
      return guide
    })
    .then((guide) => guide ? guide.remove() : null)
    .then(success(res, 204))
    .catch(next)
