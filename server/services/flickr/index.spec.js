'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import * as flickr from './'

vcr.describe('Flickr Service', function () {

  it('should get photos', function () {
    return flickr
      .getPhotos('Moon')
      .then((photos) => {
        photos.should.be.instanceof(Array)
      })
  })

})
