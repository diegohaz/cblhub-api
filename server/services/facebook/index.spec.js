'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import * as facebook from './'

vcr.describe('Facebook Service', function () {
  // eslint-disable-next-line
  const accessToken = 'EAARgiGrIHEcBAGH1m1JJzlfTd62fLGhgVSeDtlB5Ty1MxVN6xAAnLsFPUQdm4pQUmWJJJvbQMNO59JTO6ZBOYbz02QOwlMrZCNzOFFc9SB0kDyHbaypBhKEFzel2aZA9zviZB14MkgkSQ2UdNIdBNkv5qUqSLawBehZBwbUbAZCx1jCRaJZCMZBi'

  it('should get user info', function () {
    return facebook
      .getMe({ accessToken, fields: 'id, name, email, picture' })
      .then((user) => {
        user.should.have.property('id', '102384993551413')
        user.should.have.property('name', 'Richard Alaccigcgaied Chengberg')
        user.should.have.property('email', 'fthsmuq_chengberg_1472440326@tfbnw.net')
        user.should.have.property('picture')
      })
  })
})
