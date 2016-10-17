import { stub } from 'sinon'
import * as watson from '../../services/watson'
import { Resource } from '.'
import { User } from '../user'

stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, resource

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  resource = await Resource.create({
    user,
    title: 'test',
    url: 'http://test.com',
    mediaType: 'website',
    image: 'http://test.com/test.jpg'
  })
})

describe('view', () => {
  it('returns view', () => {
    const view = resource.view()
    expect(typeof view).toBe('object')
    expect(view.url).toBe(resource.url)
    expect(view.mediaType).toBe(resource.mediaType)
    expect(view.image).toBe(resource.image)
  })
})
