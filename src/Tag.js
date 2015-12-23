import Challenge from './Challenge';
import Question from './Question';
import Activity from './Activity';
import Resource from './Resource';

import clean from 'underscore.string/clean';
import cleanDiacritics from 'underscore.string/cleanDiacritics';

export default class Tag extends Parse.Object {
  constructor(attributes, options) {
    super('Tag', attributes, options);
  }

  // schematize
  schematize() {
    // this.get('challenge') || this.set('challenge', Challenge);
    this.get('title')       || this.set('title', '');
    this.get('color')       || this.set('color', '#FFFFFF');
    this.get('keyword')     || this.set('keyword', '');

    let acl = new Parse.ACL(Parse.User.current());
    acl.setPublicReadAccess(true);

    this.setACL(acl);
  }

  // view
  view() {
    let view = {};

    view.id = this.id;
    view.title = this.get('title');
    view.color = this.get('color');
    view.keyword = this.get('keyword');

    return view;
  }

  // list
  static list({
    challenge,
    orderBy = 'title',
    order = 'ascending',
    limit = 30,
    page = 0
  } = {}) {
    let tags = new Parse.Query(this);

    // constraints
    challenge && tags.equalTo('challenge', challenge);

    tags[order](orderBy);
    tags.limit(limit);
    tags.skip(limit * page);

    return tags.find().then(tags => {
      return Parse.Promise.as(tags.map(o => o.view()));
    });
  }

  // beforeSave
  static beforeSave(request, response) {
    let tag = request.object;

    if (!tag.get('challenge')) return response.error('Empty challenge');
    if (!tag.get('title')) return response.error('Empty title');

    tag.schematize();

    tag.set('title', clean(tag.get('title')));
    tag.set('keyword', cleanDiacritics(tag.get('title').toLowerCase()));

    response.success();
  }

  // beforeDelete
  static beforeDelete(request, response) {
    let tag = request.object;

    Question.cleanUp('tag', tag)
      .always(() => Activity.cleanUp('tag', tag))
      .always(() => Resource.cleanUp('tag', tag))
      .always(response.success);
  }

  // cleanUp
  static cleanUp(attribute, value) {
    Parse.Cloud.useMasterKey();

    let tags = new Parse.Query(Tag);
    let runAgain = false;

    tags.equalTo(attribute, value);
    tags.limit(1000);

    return tags.find().then(tags => {
      runAgain = tags.length == 1000;

      return Parse.Object.destroyAll(tags);
    }).then(() => {
      if (runAgain) {
        return Tag.cleanUp(attribute, value);
      } else {
        return Parse.Promise.as();
      }
    });
  }
}

Parse.Object.registerSubclass('Tag', Tag);

Parse.Cloud.beforeSave('Tag', Tag.beforeSave);
Parse.Cloud.beforeDelete('Tag', Tag.beforeDelete);

Parse.Cloud.define('listTags', (request, response) => {
  Tag.list(request.params).then(response.success, response.error);
});