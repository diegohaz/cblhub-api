'use strict'

import Promise from 'bluebird'
import mongoose from 'mongoose'
import _ from 'lodash'
import sinon from 'sinon'

import Challenge from '../../api/challenge/challenge.model'
import Photo from '../../api/photo/photo.model'
import User from '../../api/user/user.model'
import Tag from '../../api/tag/tag.model'
import Session from '../../api/session/session.model'

const fetchTags = sinon.stub(Challenge.prototype, 'fetchTags', function () {
  const taggablePaths = Challenge.getTaggablePaths()
  const tags = taggablePaths.map((path) => _.kebabCase(this[path])).filter(_.identity)
  return tags
})

export const clean = () =>
  Promise.each(_.values(mongoose.connection.collections), (collection) => collection.remove())

export const challenge = ({
  title = 'Make people happy',
  bigIdea = 'Peace',
  essentialQuestion = 'How can we make the World a better place?',
  ...rest
} = {}) =>
  Challenge.create({title, bigIdea, essentialQuestion, ...rest}).then((challenge) => {
    fetchTags.reset()
    return challenge
  })

export const challenges = (...objects) =>
  Promise.all(_.times(objects.length || 1, (i) => challenge(objects[i])))

export const photo = (id) =>
  id ? Photo.createUnique({_id: id}) : Photo.create({})

export const photos = (...ids) =>
  Photo.createUnique(ids.map((id) => ({_id: id})))

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

export const tags = (...names) =>
  Tag.createUnique(names.map((name) => ({name})))

export const session = (role) =>
  user(role).then((user) => Session.create({user}))

export const sessions = (...roles) =>
  Promise.all(_.times(roles.length || 1, (i) => session(roles[i])))
