'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import * as meta from './'

vcr.describe('Meta Service', function () {
  it('should get meta', function () {
    return meta
      .getMeta('http://www.imdb.com/name/nm0000149/')
      .then((meta) => {
        meta.should.have.property('url', 'http://www.imdb.com/name/nm0000149/')
        meta.should.have.property('title', 'Jodie Foster')
        meta.should.have.property('description').which.is.a('string')
        meta.should.have.property('image').which.is.a('string')
        meta.should.have.property('media', 'actor')
      })
  })
})
