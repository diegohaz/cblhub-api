import { stub } from 'sinon'
import * as watson from '../../services/watson'
import { Challenge } from '.'
import { User } from '../user'
import { Photo } from '../photo'
import { Guide } from '../guide'

const pickColor = stub(Photo.prototype, 'pickColor', () => '#000000')
const getKeywords = stub(watson, 'getKeywords', () => ['k1', 'k2'])

let user, challenge

beforeEach(async () => {
  pickColor.reset()
  getKeywords.reset()
  user = await User.create({ email: 'a@a.com', password: '123456' })
  challenge = await Challenge.create({
    user,
    title: 'test title',
    bigIdea: 'test big idea',
    essentialQuestion: 'test essential question',
    description: 'test description'
  })
})

describe('set user', () => {
  it('adds user to users', () => {
    expect(challenge.users.length).toBe(1)
    expect(challenge.users[0].toString()).toBe(challenge.user.id)
  })

  it('removes user from users when it is unset', () => {
    challenge.user = null
    expect(challenge.users.length).toBe(0)
  })
})

describe('pre save', () => {
  it('calls getKeywords when tags are modified', () => {
    expect(getKeywords.calledOnce).toBe(true)
  })

  it('does not call getKeywords when tags are not modified', async () => {
    getKeywords.reset()
    await challenge.save()
    expect(getKeywords.called).toBe(false)
  })

  it('does not call pickColor when no photo is provided', () => {
    expect(pickColor.called).toBe(false)
  })

  it('calls pickColor when photo is provided', async () => {
    const photo = await Photo.create({ title: 'test' })
    await challenge.set({ photo }).save()
    expect(pickColor.calledOnce).toBe(true)
  })
})

describe('pre remove', () => {
  it('removes challenge reference from guides', async () => {
    await Guide.create({ user, challenge, title: 'test' })
    expect((await Guide.find({ challenge })).length).toBe(1)
    await challenge.remove()
    expect((await Guide.find({ challenge })).length).toBe(0)
  })
})

describe('view', () => {
  it('returns simple view', () => {
    const view = challenge.view()
    expect(typeof view).toBe('object')
    expect(view.id).toBe(challenge.id)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
    expect(Array.isArray(view.users)).toBe(true)
    expect(view.title).toBe(challenge.title)
    expect(view.bigIdea).toBe(challenge.bigIdea)
    expect(view.essentialQuestion).toBe(challenge.essentialQuestion)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })

  it('returns full view', () => {
    const view = challenge.view(true)
    expect(typeof view).toBe('object')
    expect(view.id).toBe(challenge.id)
    expect(typeof view.user).toBe('object')
    expect(view.user.id).toBe(user.id)
    expect(Array.isArray(view.users)).toBe(true)
    expect(view.title).toBe(challenge.title)
    expect(view.bigIdea).toBe(challenge.bigIdea)
    expect(view.essentialQuestion).toBe(challenge.essentialQuestion)
    expect(view.description).toBe(challenge.description)
    expect(view.createdAt).toBeTruthy()
    expect(view.updatedAt).toBeTruthy()
  })
})

describe('assignTags', () => {
  it('assigns tags', async () => {
    getKeywords.reset()
    challenge.tags = []
    await challenge.assignTags()
    expect(getKeywords.calledOnce).toBe(true)
    expect(Array.isArray(challenge.tags)).toBe(true)
    expect(challenge.tags.length).toBe(2)
  })
})
