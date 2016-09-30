import test from 'ava'
import vcr from 'nock-vcr-recorder'
import * as meta from '.'

test('getMeta', (t) => {
  t.plan(6)
  return vcr.useCassette('getMeta', async () => {
    const data = await meta.getMeta('http://www.imdb.com/name/nm0000149/')
    t.true(typeof data === 'object')
    t.true(data.url === 'http://www.imdb.com/name/nm0000149/')
    t.true(data.title === 'Jodie Foster')
    t.true(typeof data.description === 'string')
    t.true(typeof data.image === 'string')
    t.true(data.mediaType === 'actor')
  })
})
