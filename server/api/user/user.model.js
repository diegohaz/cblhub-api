'use strict'

import crypto from 'crypto'
import bcrypt from 'bcrypt'
import randtoken from 'rand-token'
import mongoose, {Schema} from 'mongoose'
import mongooseKeywords from 'mongoose-keywords'
import {env} from '../../config'
import Session from '../session/session.model'
import Challenge from '../challenge/challenge.model'

const compare = require('bluebird').promisify(bcrypt.compare)
const roles = ['user', 'admin']

const UserSchema = new Schema({
  email: {
    type: String,
    match: /^\S+@\S+\.\S+$/,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    index: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    index: true,
    trim: true
  },
  role: {
    type: String,
    enum: roles,
    default: 'user'
  },
  picture: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

UserSchema.path('email').set(function (email) {
  if (email === 'anonymous') {
    email = randtoken.generate(16) + '@anonymous.com'
  }

  if (!this.picture) {
    const hash = crypto.createHash('md5').update(email).digest('hex')
    this.picture = `https://gravatar.com/avatar/${hash}?d=identicon`
  }

  if (!this.name) {
    this.name = email.replace(/^(.+)@.+$/, '$1')
  }

  return email
})

UserSchema.pre('save', function (next) {
  if (!this.isModified('password')) return next()

  let rounds = env === 'test' ? 1 : 9

  bcrypt.hash(this.password, rounds, (err, hash) => {
    if (err) return next(err)
    this.password = hash
    next()
  })
})

UserSchema.pre('remove', function (next) {
  Challenge.update(
    {$or: [{user: this}, {users: this}]},
    {$unset: {user: ''}, $pull: {users: this._id}},
    {multi: true}
  )
  .then(() => Session.remove({user: this}))
  .then(next)
  .catch(next)
})

UserSchema.methods = {
  view (full) {
    let view = {}
    let fields = ['id', 'name', 'picture']

    if (full) {
      fields = [...fields, 'email', 'createdAt']
    }

    fields.forEach((field) => { view[field] = this[field] })

    return view
  },

  authenticate (password) {
    return compare(password, this.password).then((valid) => valid ? this : false)
  }
}

UserSchema.statics = {
  roles
}

UserSchema.plugin(mongooseKeywords, {paths: ['email', 'name']})

export default mongoose.model('User', UserSchema)
