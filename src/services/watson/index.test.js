import test from 'ava'
import vcr from 'nock-vcr-recorder'
import * as watson from '.'

test('getKeywords', (t) => {
  t.plan(1)
  return vcr.useCassette('services/watson/getKeywords', async () => {
    const keywords = await watson.getKeywords('This is a test case for IBM Watson service')
    t.true(Array.isArray(keywords))
  })
})
