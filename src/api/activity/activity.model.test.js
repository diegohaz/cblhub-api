import { stub } from 'sinon'
import * as watson from '../../services/watson'
import { Activity } from '.'
import { User } from '../user'

stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, activity

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  activity = await Activity.create({ user, title: 'test', date: Date.now() })
})

describe('view', () => {
  it('returns view', () => {
    const view = activity.view()
    expect(typeof view).toBe('object')
    expect(typeof view.date).toBe('object')
    expect(view.date.toISOString() === activity.date.toISOString()).toBe(true)
  })
})
