import test from 'ava'
import mockgoose from 'mockgoose'
import mongoose from '../../config/mongoose'
import { schema } from '.'

test.beforeEach(async (t) => {
  const mongo = new mongoose.Mongoose()
  await mockgoose(mongo)
  await mongo.connect('')
  const Photo = mongo.model('Photo', schema)
  const photo = await Photo.create({ title: 'test' })

  t.context = { ...t.context, Photo, photo }
})

test.cb.after.always((t) => {
  mockgoose.reset(t.end)
})

test('view', (t) => {
  const { photo } = t.context
  photo.thumbnail = { src: 'test.jpg' }
  const view = photo.view()
  t.true(typeof view === 'object')
  t.true(view.id === photo.id)
  t.true(view.title === photo.title)
  t.true(view.thumbnail.src === photo.thumbnail.src)
  t.truthy(view.createdAt)
  t.truthy(view.updatedAt)
})

test('combine photos with same id', async (t) => {
  const { Photo, photo } = t.context
  const anotherPhoto = await Photo.createUnique({ _id: photo.id, title: 'test2' })
  t.true(anotherPhoto.id === photo.id)
  t.true(anotherPhoto.title === photo.title)
  t.true(anotherPhoto.createdAt.getTime() === photo.createdAt.getTime())
})

test('translate from flickr', async (t) => {
  const { Photo } = t.context
  const flickrPhoto = {
    id: '9551387978',
    title: 'moon',
    owner: '123',
    ownername: 'fsse8info',
    url_t: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_t.jpg',
    height_t: '100',
    width_t: '80',
    url_s: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg',
    height_s: '165',
    width_s: '240',
    url_m: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38.jpg',
    height_m: '345',
    width_m: '500',
    url_l: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_b.jpg',
    height_l: '706',
    width_l: '1024'
  }

  const photo = Photo.translateFromFlickr(flickrPhoto)
  t.true(typeof photo === 'object')
  t.true(photo.id === '9551387978')
  t.true(photo.title === 'moon')
  t.true(photo.owner === 'fsse8info')
  t.true(/^https?:\/\/(www\.)?flickr\.com\/photos\/123\/9551387978\/?$/.test(photo.url))
  t.true(typeof photo.thumbnail === 'object')
  t.true(typeof photo.small === 'object')
  t.true(typeof photo.medium === 'object')
  t.true(typeof photo.large === 'object')
  t.true(photo.thumbnail.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_t.jpg')
  t.true(photo.thumbnail.width === 80)
  t.true(photo.thumbnail.height === 100)
  t.true(photo.small.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg')
  t.true(photo.small.width === 240)
  t.true(photo.small.height === 165)
  t.true(photo.medium.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38.jpg')
  t.true(photo.medium.width === 500)
  t.true(photo.medium.height === 345)
  t.true(photo.large.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_b.jpg')
  t.true(photo.large.width === 1024)
  t.true(photo.large.height === 706)
})

test('translate from flickr without medium and large images', async (t) => {
  const { Photo } = t.context
  const flickrPhoto = {
    id: '9551387978',
    title: 'moon',
    owner: '123',
    ownername: 'fsse8info',
    url_t: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_t.jpg',
    height_t: '100',
    width_t: '80',
    url_s: 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg',
    height_s: '165',
    width_s: '240'
  }

  const photo = Photo.translateFromFlickr(flickrPhoto)
  t.true(typeof photo === 'object')
  t.true(photo.id === '9551387978')
  t.true(photo.title === 'moon')
  t.true(photo.owner === 'fsse8info')
  t.true(/^https?:\/\/(www\.)?flickr\.com\/photos\/123\/9551387978\/?$/.test(photo.url))
  t.true(typeof photo.thumbnail === 'object')
  t.true(typeof photo.small === 'object')
  t.true(typeof photo.medium === 'object')
  t.true(typeof photo.large === 'object')
  t.true(photo.thumbnail.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_t.jpg')
  t.true(photo.thumbnail.width === 80)
  t.true(photo.thumbnail.height === 100)
  t.true(photo.small.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg')
  t.true(photo.small.width === 240)
  t.true(photo.small.height === 165)
  t.true(photo.medium.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg')
  t.true(photo.medium.width === 240)
  t.true(photo.medium.height === 165)
  t.true(photo.large.src === 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg')
  t.true(photo.large.width === 240)
  t.true(photo.large.height === 165)
})
