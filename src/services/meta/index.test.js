import vcr from 'nock-vcr-recorder'
import * as meta from '.'

it('gets metadata from url', () => {
  return vcr.useCassette('gets metadata from url', async () => {
    const data = await meta.getMeta('http://www.imdb.com/name/nm0000149/')
    expect(typeof data).toBe('object')
    expect(data.url).toBe('http://www.imdb.com/name/nm0000149/')
    expect(data.title).toBe('Jodie Foster')
    expect(typeof data.description).toBe('string')
    expect(typeof data.image).toBe('string')
    expect(data.mediaType).toBe('actor')
  })
})
