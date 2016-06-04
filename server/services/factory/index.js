'use strict'

import Promise from 'bluebird'
import mongoose from 'mongoose'
import _ from 'lodash'

import User from '../../api/user/user.model'
import Tag from '../../api/tag/tag.model'
import Session from '../../api/session/session.model'

export const clean = () =>
  Promise.each(_.values(mongoose.connection.collections), (collection) => collection.remove())

export const user = (role = 'user') =>
  User.create({
    email: 'anonymous',
    password: 'password',
    name: `Fake ${role}`,
    role
  })

export const users = (...roles) =>
  Promise.all(_.times(roles.length || 1, (i) => user(roles[i])))

export const tag = (name) =>
  Tag.createUnique({name})

export const tags = (...names) => {
  let _tags = []
  return Promise.each(names, (name, i) => {
    _tags[i] = tag(name)
    return _tags[i]
  }).return(_tags).all()
}

export const session = (role) =>
  user(role).then((user) => Session.create({user}))

export const sessions = (...roles) =>
  Promise.all(_.times(roles.length || 1, (i) => session(roles[i])))
