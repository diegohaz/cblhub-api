'use strict'

import nock from 'nock'
import * as facebook from './'

describe('Facebook Service', function () {
  it('should get user info', function () {
    nock('https://graph.facebook.com').get('/me').query(true).reply(200, {
      id: '123',
      name: 'Test name',
      email: 'email@example.com',
      picture: { data: { url: 'test.jpg' } }
    })

    return facebook
      .getMe({ accessToken: '123', fields: 'id, name, email, picture' })
      .then((user) => {
        user.should.have.property('id', '123')
        user.should.have.property('name', 'Test name')
        user.should.have.property('email', 'email@example.com')
        user.should.have.property('picture')
      })
  })
})
