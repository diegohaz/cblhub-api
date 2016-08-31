'use strict'

import { success, error, notFound } from '../../services/response/'
import { sendMail } from '../../services/sendgrid'
import PasswordReset from './password-reset.model'
import User from '../user/user.model'
import Session from '../session/session.model'

export const create = ({ body: { email, link } }, res) => {
  if (!email) return res.status(400).send('Missing email')
  if (!link) return res.status(400).send('Missing link')

  return User.findOne({ email })
    .then(notFound(res))
    .then((user) => user ? PasswordReset.create({ user }) : null)
    .then((reset) => {
      if (!reset) return null
      const { user, token } = reset
      link = `${link.replace(/\/$/, '')}/${token}`
      const content = `
        Hey, ${user.name}.<br><br>
        You requested a new password for your CBLHub account.<br>
        Please use the following link to set a new password. It will expire in 1 hour.<br><br>
        <a href="${link}">${link}</a><br><br>
        If you didn't make this request then you can safely ignore this email. :)<br><br>
        &mdash; CBLHub Team
      `
      return sendMail({ toEmail: user.email, subject: 'CBLHub - Password Reset', content })
    })
    .then((response) => response ? success(res, response.statusCode)({}) : null)
    .catch(error(res))
}

export const submit = ({ params: { token } }, res) =>
  PasswordReset.findOne({ token })
    .populate('user')
    .then(notFound(res))
    .then((reset) => {
      if (!reset) return null
      return reset.remove()
        .then(() => Session.create({ user: reset.user }))
        .then((session) => session.view(true))
    })
    .then(success(res))
    .catch(error(res))
