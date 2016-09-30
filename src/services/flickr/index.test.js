import test from 'ava'
import vcr from 'nock-vcr-recorder'
import * as flickr from '.'

test('getPhotos', (t) => {
  t.plan(1)
  return vcr.useCassette('getPhotos', async () => {
    const photos = await flickr.getPhotos('Moon')
    t.true(Array.isArray(photos))
  })
})
