import Keyword from './Keyword';

export default class Photo extends Parse.Object {
  constructor(attributes, options) {
    super('Photo', attributes, options);
  }

  // schematize
  schematize() {
    let object = {
      src: '',
      width: 0,
      height: 0
    };

    this.get('small')  || this.set('small', object);
    this.get('medium') || this.set('medium', object);
    this.get('large')  || this.set('large', object);
    this.get('owner')  || this.set('owner', '');
    this.get('url')    || this.set('url', '');

    let acl = new Parse.ACL();
    acl.setPublicReadAccess(true);

    this.setACL(acl);
  }

  // view
  view() {
    if (!this.createdAt) return;

    let view = {};

    view.small = this.get('small');
    view.medium = this.get('medium');
    view.large = this.get('large');
    view.owner = this.get('owner');
    view.url = this.get('url');

    return view;
  }

  // beforeSave
  static beforeSave(request, response) {
    let photo = request.object;

    if (!photo.get('small'))  return response.error('Empty small photo');
    if (!photo.get('medium')) return response.error('Empty medium photo');
    if (!photo.get('large'))  return response.error('Empty large photo');

    response.success();
  }


  // search
  static search({
    challenge,
    text = '',
    limit = 24,
    pointers = false
  } = {}) {
    let promise = Parse.Promise.as([]);

    if (challenge && !text) {
      promise = Keyword.extract(challenge.get('title')).then(keywords => {
        if (keywords.length == 1) {
          text = keywords[0];
          return Parse.Promise.as([]);
        } else if (keywords.length) {
          return Parse.Promise.as(keywords.slice(0, 10));
        } else {
          return Parse.Promise.error();
        }
      }).fail(() => {
        if (challenge.get('keywords') && challenge.get('keywords').length) {
          return Parse.Promise.as(challenge.get('keywords').slice(0, 10));
        } else {
          text = challenge.get('bigIdea');
          return Parse.Promise.as([]);
        }
      });
    }

    return promise.then(keywords => {
      console.log('Searching photos...');
      console.log(text);
      console.log(keywords);

      return Parse.Cloud.httpRequest({
        url: 'https://api.flickr.com/services/rest/',
        params: {
          method: 'flickr.photos.search',
          api_key: '1bf3ceb29fad41a1d8e5ae9839f3471d',
          text: text,
          tags: keywords.join(','),
          sort: 'relevance',
          license: '1,2,3,4,5,6',
          content_type: 6,
          media: 'photos',
          extras: 'owner_name,url_s,url_m,url_l',
          per_page: limit,
          format: 'json',
          nojsoncallback: 1
        }
      });
    }).then(response => {
      let data = response.data;
      console.log(data);

      if (data.stat != 'ok') return Parse.Promise.error(data.stat);

      let flickrPhotos = data.photos.photo;
      let photosToSave = [];
      let photos = flickrPhotos.map(flickrPhoto => {
        let photo = this._translate(flickrPhoto);

        photosToSave.push(photo);

        return photo.view();
      });

      if (pointers) {
        return Parse.Object.saveAll(photosToSave);
      } else {
        return Parse.Promise.as(photos);
      }
    });
  }

  // _translate
  static _translate(flickrPhoto) {
    let p = flickrPhoto;
    let photo = new Photo;

    photo.set('small', {src: p.url_s, width: p.width_s, height: p.height_s});
    photo.set('medium', {src: p.url_m, width: p.width_m, height: p.height_m});
    photo.set('large', {src: p.url_l, width: p.width_l, height: p.height_l});
    photo.set('owner', p.ownername);
    photo.set('url', 'https://www.flickr.com/photos/' + p.owner + '/' + p.id);

    return photo;
  }
}

Parse.Object.registerSubclass('Photo', Photo);

Parse.Cloud.define('searchPhotos', (request, response) => {
  request.params.pointers = undefined;

  Photo.search(request.params).then(response.success, response.error);
});