import _ from 'lodash'
import { success, notFound, authorOrAdmin } from '../../services/response/'
import { Activity } from '.'

export const create = ({ user, bodymen: { body } }, res, next) =>
  Activity.create({ ...body, user })
    .then((activity) => activity.view(true))
    .then(success(res, 201))
    .catch(next)

export const index = ({ querymen: { query, select, cursor } }, res, next) =>
  Activity.find(query, select, cursor)
    .populate('user challenge tags guides')
    .then((activities) => activities.map((activity) => activity.view()))
    .then(success(res))
    .catch(next)

export const show = ({ params }, res, next) =>
  Activity.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then((activity) => activity ? activity.view() : null)
    .then(success(res))
    .catch(next)

export const update = ({ user, bodymen: { body }, params }, res, next) =>
  Activity.findById(params.id)
    .populate('user challenge tags guides')
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((activity) => {
      if (!activity) return null
      return _.mergeWith(activity, body, (activityValue, bodyValue) => {
        if (!Array.isArray(activityValue) || !bodyValue) return
        const bodyValues = Array.isArray(bodyValue) ? bodyValue : [bodyValue]
        bodyValues.forEach((value) => {
          if (value.charAt(0) === '-') {
            activityValue.pull(value.slice(1))
          } else if (value.charAt(0) === '+') {
            activityValue.addToSet(value.slice(1))
          } else {
            activityValue.addToSet(value)
          }
        })
        return activityValue
      }).save()
    })
    .then((activity) => activity ? activity.view(true) : null)
    .then(success(res))
    .catch(next)

export const destroy = ({ user, params }, res, next) =>
  Activity.findById(params.id)
    .then(notFound(res))
    .then(authorOrAdmin(res, user, 'user'))
    .then((activity) => activity ? activity.remove() : null)
    .then(success(res, 204))
    .catch(next)
