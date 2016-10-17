import vcr from 'nock-vcr-recorder'
import * as watson from '.'

it('gets keywords', () => {
  return vcr.useCassette('gets keywords', async () => {
    const keywords = await watson.getKeywords('This is a test case for IBM Watson service')
    expect(Array.isArray(keywords)).toBe(true)
  })
})
