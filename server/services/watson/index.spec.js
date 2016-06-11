'use strict'

import vcr from 'nock-vcr-recorder-mocha'
import * as watson from './'

vcr.describe('Watson Service', function () {
  it('should get keywords', function () {
    return watson
      .getKeywords('This is a test case for IBM Watson service')
      .then((keywords) => {
        keywords.should.be.instanceOf(Array)
      })
  })
})
