'use strict'

import nock from 'nock'
import * as sendgrid from './'

describe('Sendgrid Service', function () {
  it('should send email', function () {
    nock.cleanAll()
    nock('https://api.sendgrid.com').post('/v3/mail/send').reply(202)
    return sendgrid.sendMail({
      toEmail: 'test',
      subject: 'Test',
      content: '<h1>Just Testing</h1>'
    }).then((res) => {
      res.should.have.property('statusCode', 202)
    })
  })
})
