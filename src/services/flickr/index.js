import request from 'request-promise'
import { flickrKey } from '../../config'

export const getPhotos = (text, { limit = 20, page = 1 } = {}) =>
  request({
    uri: 'https://api.flickr.com/services/rest/',
    json: true,
    qs: {
      method: 'flickr.photos.search',
      api_key: flickrKey,
      sort: 'relevance',
      license: '1,2,3,4,5,6',
      content_type: 6,
      media: 'photos',
      extras: 'owner_name,url_t,url_s,url_m,url_l',
      format: 'json',
      nojsoncallback: 1,
      per_page: limit,
      page,
      text
    }
  }).then((res) => {
    if (res.stat !== 'ok') throw new Error(res.stat)
    return res.photos.photo.filter((photo) => photo.url_l)
  })
