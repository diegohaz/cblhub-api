import { stub } from 'sinon'
import * as watson from '../../services/watson'
import { Guide } from '.'
import { User } from '../user'
import { Challenge } from '../challenge'

const getKeywords = stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, challenge, guide

beforeEach(async () => {
  user = await User.create({ email: 'a@a.com', password: '123456' })
  challenge = await Challenge.create({ user, title: 'test' })
  getKeywords.reset()
  guide = await Guide.create({ user, challenge, title: 'test', description: 'test' })
})

describe('pre save', () => {
  it('adds guide to challenge', async () => {
    challenge = await Challenge.findById(guide.challenge.id)
    expect(Array.isArray(challenge.guides)).toBe(true)
    expect(challenge.guides.length).toBe(1)
    expect(typeof challenge.guides[0]).toBe('object')
    expect(challenge.guides[0].toString()).toBe(guide.id)
  })

  it('adds guide to guide', async () => {
    const anotherGuide = await Guide.create({ user, title: 'test', guides: [guide] })
    const updatedGuide = await Guide.findById(guide.id)
    expect(typeof updatedGuide).toBe('object')
    expect(Array.isArray(updatedGuide.guides)).toBe(true)
    expect(updatedGuide.guides.length).toBe(1)
    expect(updatedGuide.guides[0].toString()).toBe(anotherGuide.id)
  })

  it('calls getKeywords when tags are modified', () => {
    expect(getKeywords.calledOnce).toBe(true)
  })

  it('does not call getKeywords when tags are not modified', async () => {
    getKeywords.reset()
    await guide.save()
    expect(getKeywords.called).toBe(false)
  })
})

describe('pre remove', () => {
  it('removes guide from challenge', async () => {
    await guide.remove()
    const updatedChallenge = await Challenge.findById(challenge.id)
    expect(typeof updatedChallenge).toBe('object')
    expect(Array.isArray(updatedChallenge.guides)).toBe(true)
    expect(updatedChallenge.guides.length).toBe(0)
  })

  it('removes guide from guide', async () => {
    let anotherGuide = await Guide.create({ user, title: 'test', guides: [guide] })
    await guide.remove()
    anotherGuide = await Guide.findById(anotherGuide.id)
    expect(typeof anotherGuide).toBe('object')
    expect(Array.isArray(anotherGuide.guides)).toBe(true)
    expect(anotherGuide.guides.length).toBe(0)
  })
})

describe('view', () => {
  it('returns view', () => {
    const view = guide.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(guide.id)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
    expect(typeof view.challenge).toBe('object')
    expect(view.challenge.id).toBe(challenge.id)
    expect(Array.isArray(view.tags)).toBe(true)
    expect(view.tags.length).toBe(2)
    expect(Array.isArray(view.guides)).toBe(true)
    expect(view.title).toBe(guide.title)
    expect(view.description).toBe(guide.description)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})

describe('assignTags', () => {
  it('assigns tags', async () => {
    getKeywords.reset()
    guide.tags = []
    await guide.assignTags()
    expect(getKeywords.calledOnce).toBe(true)
    expect(Array.isArray(guide.tags)).toBe(true)
    expect(guide.tags.length).toBe(2)
  })
})
