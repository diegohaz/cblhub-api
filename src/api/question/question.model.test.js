import { stub } from 'sinon'
import * as watson from '../../services/watson'
import { Question } from '.'
import { User } from '../user'

stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, guide

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  guide = await Question.create({ user, title: 'test', description: 'test' })
})

describe('view', () => {
  it('returns view', () => {
    const view = guide.view()
    expect(typeof view).toBe('object')
  })
})
