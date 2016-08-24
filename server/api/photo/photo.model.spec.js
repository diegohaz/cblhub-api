'use strict'

import '../../'
import * as factory from '../../services/factory'
import Photo from './photo.model'
import Challenge from '../challenge/challenge.model'

describe('Photo Model', function () {
  before(function () {
    return factory.clean()
  })

  afterEach(function () {
    return factory.clean()
  })

  it('should return a view', function () {
    return factory.photo()
      .then((photo) => photo.view())
      .then((view) => {
        view.should.have.property('id')
      })
  })

  it('should combine photos with same id', function () {
    return factory.photos('123', '123').then((photos) => {
      photos.should.have.lengthOf(2)
      photos[0].should.have.property('id', photos[1].id)
    })
  })

  it('should translate photo from flickr', function () {
    const flickrPhoto = {
      id: '9551387978',
      title: 'moon',
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

    const photo = Photo.translate(flickrPhoto)
    photo.should.have.property('id', '9551387978')
    photo.should.have.property('title', 'moon')
    photo.should.have.property('owner', 'fsse8info')
    photo.should.have.property('url').that.matches(/^https?:\/\/(www\.)?flickr\.com\/photos\/fsse8info\/9551387978\/?$/)
    photo.should.have.deep.property('thumbnail.src', 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_t.jpg')
    photo.should.have.deep.property('thumbnail.width', 80)
    photo.should.have.deep.property('thumbnail.height', 100)
    photo.should.have.deep.property('small.src', 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_m.jpg')
    photo.should.have.deep.property('small.width', 240)
    photo.should.have.deep.property('small.height', 165)
    photo.should.have.deep.property('medium.src', 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38.jpg')
    photo.should.have.deep.property('medium.width', 500)
    photo.should.have.deep.property('medium.height', 345)
    photo.should.have.deep.property('large.src', 'https://farm8.staticflickr.com/7454/9551387978_c3439d9e38_b.jpg')
    photo.should.have.deep.property('large.width', 1024)
    photo.should.have.deep.property('large.height', 706)
  })

  it('should remove photo from challenges after removing photo', function () {
    const challenge = new Challenge({title: 'Testing'})
    return factory.photo()
      .tap((photo) => { challenge.photo = photo })
      .then(() => challenge.save())
      .then(() => challenge.photo.remove())
      .then(() => Challenge.findOne({}))
      .then((challenge) => challenge.should.have.property('photo').which.is.empty)
  })
})
