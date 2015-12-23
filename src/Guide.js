import User from './User';
import Contribution from './Contribution';
import Keyword from './Keyword';

import _ from 'underscore';
import clean from 'underscore.string/clean';
import cleanDiacritics from 'underscore.string/cleanDiacritics';

export default class Guide extends Parse.Object {
  // schematize
  schematize() {
    // this.get('challenge') || this.set('challenge', Challenge);
    this.get('user')         || this.set('user', User.current());
    this.get('title')        || this.set('title', '');
    this.get('text')         || this.set('text', '');
    this.get('tags')         || this.set('tags', []);
    this.get('keywords')     || this.set('keywords', []);

    if (this.guides) {
      this.guides.forEach(guide => {
        this.get(guide) || this.set(guide, []);
      });
    }

    let acl = new Parse.ACL(this.get('user'));
    acl.setPublicReadAccess(true);

    this.setACL(acl);
  }

  // view
  view() {
    if (!this.createdAt) return this.id;

    let view = {};

    view.id = this.id;
    view.user = this.get('user')? this.get('user').view() : undefined;
    view.title = this.get('title');
    view.text = this.get('text');
    view.tags = this.get('tags').map(t => t.view()).filter(t => !!t);
    view.keywords = this.get('keywords');

    if (this.guides) {
      this.guides.forEach(guide => {
        if (this.get(guide)) {
          view[guide] = this.get(guide).map(g => g.view());
        }
      });
    }

    if (this.get('challenge')) {
      view.challenge = this.get('challenge').view();
    }

    return view;
  }

  // beforeSave
  static beforeSave(request, response) {
    let object = request.object;

    if (!object.get('challenge')) return response.error('Empty challenge');
    if (!object.get('title')) return response.error('Empty title');

    if (object.dirty('title') || object.dirty('text')) {
      object.set('title', clean(object.get('title')));
      object.set('text', clean(object.get('text')));
      object.set('keywords', []);
    }

    object.guides.forEach(guide => {
      if (object.dirty(guide)) {
        let op = object.op(guide);
        let opName = op instanceof Parse.Op.Remove? 'remove' : 'addUnique';

        op._value.forEach(o => {
          o[opName](object.plural, object);
        });

        Parse.Object.saveAll(op._value, {useMasterKey: true});
      }
    });

    object.schematize();

    response.success();
  }

  // afterSave
  static afterSave(request) {
    Parse.Cloud.useMasterKey();

    let object = request.object;
    let existed = object.createdAt.getTime() != object.updatedAt.getTime();

    if (!existed) {
      let contribution = new Contribution;
      let challenge = object.get('challenge');

      contribution.set('user', object.get('user'));
      contribution.set('challenge', challenge);
      contribution.set(object.single, object);
      contribution.save();

      challenge.addUnique(object.plural, object);
      challenge.save();
    }

    if (!object.get('keywords').length) {
      let text = ['title', 'text'].map(k => object.get(k)).join('\n');

      Keyword.extract(text).then(keywords => {
        object.set('keywords', keywords);
        object.save();
      });
    }
  }

  // beforeDelete
  static beforeDelete(request, response) {
    Parse.Cloud.useMasterKey();

    let Contribution = require('./Contribution');
    let Challenge = require('./Challenge');
    let Question = require('./Question');
    let Activity = require('./Activity');
    let Resource = require('./Resource');

    let object = request.object;

    Contribution.cleanUp(object.single, object)
      .always(() => Challenge.cleanUp(object.plural, object))
      .always(() => Question.cleanUp(object.plural, object))
      .always(() => Activity.cleanUp(object.plural, object))
      .always(() => Resource.cleanUp(object.plural, object))
      .always(() => response.success());
  }

  // get
  static get(id) {
    let object = new Parse.Query(this);

    object.include(['user', 'challenge', 'tags']);
    object.include(object.guides);

    return object.get(id).then(o => {
      return o? Parse.Promise.as(o.view()) : Parse.Promise.error();
    });
  }

  // list
  static list({
    challenge, user, question, activity, resource, tag, keywords,
    orderBy = 'createdAt',
    order = 'descending',
    limit = 30,
    page = 0
  } = {}) {
    let object = new Parse.Object(this);
    let objects = new Parse.Query(this);

    // constraints
    challenge && objects.equalTo('challenge', challenge);
    user      && objects.equalTo('user', user);
    question  && objects.equalTo('questions', question);
    activity  && objects.equalTo('adjectives', activity);
    resource  && objects.equalTo('resources', resource);
    tag       && objects.equalTo('tags', tag);
    keywords  && objects.containedIn('keywords', keywords);

    // includes
    if (challenge && object.guides) {
      objects.include(object.guides.concat(object.guides.map(g => g + '.user')));
    } else {
      objects.include(['challenge', 'challenge.user']);
    }

    objects.include(['user', 'tags']);
    objects[order](orderBy);
    objects.limit(limit);
    objects.skip(limit * page);

    return objects.find().then(objects => {
      return Parse.Promise.as(objects.map(o => o.view()));
    });
  }

  // cleanUp
  static cleanUp(attribute, value) {
    Parse.Cloud.useMasterKey();

    let objects = new Parse.Query(this);
    let runAgain = false;

    objects.equalTo(attribute, value);
    objects.limit(1000);

    return objects.find().then(objects => {
      runAgain = objects.length == 1000;

      if (attribute == 'challenge') {
        return Parse.Object.destroyAll(objects);
      } else if (attribute == 'user') {
        objects.forEach(o => o.unset('user'));
      } else {
        objects.forEach(o => o.remove(attribute, value));
      }

      return Parse.Object.saveAll(objects);
    }).then(() => {
      if (runAgain) {
        return this.cleanUp(attribute, value);
      } else {
        return Parse.Promise.as();
      }
    });
  }
}