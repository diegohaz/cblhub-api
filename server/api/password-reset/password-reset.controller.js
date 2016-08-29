'use strict'

import { success, error, notFound } from '../../services/response/'
import { sendMail } from '../../services/sendgrid'
import PasswordReset from './password-reset.model'
import User from '../user/user.model'
import Session from '../session/session.model'

export const create = ({ body: { email } }, res) =>
  User.findOne({ email })
    .then(notFound(res))
    .then((user) => user ? sendMail({ toEmail: email, subject: 'Lol', content: 'Test' }) : null)
    .then((response) => response ? success(res, response.statusCode)({}) : null)
    .catch(error(res))

export const submit = ({ params: { token } }, res) =>
  PasswordReset.findOne({ token })
    .populate('user')
    .then(notFound(res))
    .then((reset) => {
      if (!reset) return
      return reset.remove()
        .then(() => Session.create({ user: reset.user }))
        .then((session) => session.view(true))
    })
    .then(success(res))
    .catch(error(res))
