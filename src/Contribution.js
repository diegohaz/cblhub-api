import Challenge from './Challenge';
import User from './User';

export default class Contribution extends Parse.Object {
  constructor(attributes, options) {
    super('Contribution', attributes, options);
  }

  // schematize
  schematize() {
    this.get('user')         || this.set('user', User.current());
    // this.get('challenge') || this.set('challenge', Challenge);
    // this.get('question')  || this.set('question', Question);
    // this.get('activity')  || this.set('activity', Activity);
    // this.get('resource')  || this.set('resource', Resource);

    this.setACL(new Parse.ACL({'*': {'read': true}}));
  }

  // view
  view() {
    if (!this.createdAt) return;

    let contribution = this.get('question') || this.get('activity') || this.get('resource');
    let view = contribution.view();

    return view;
  }

  // list
  static list({
    challenge, user, after,
    order = 'descending',
    orderBy = 'createdAt',
    limit = 24,
    page = 0
  } = {}) {
    let contributions = new Parse.Query(this);

    challenge && contributions.equalTo('challenge', challenge);
    user      && contributions.equalTo('user', user);
    after     && contributions.greaterThanOrEqualTo('createdAt', after);

    contributions.include(['question', 'activity', 'resource']);
    contributions.include(['question.user', 'activity.user', 'resource.user']);

    challenge || contributions.include(['question.challenge', 'activity.challenge', 'resource.challenge']);

    contributions[order](orderBy);
    contributions.limit(limit);
    contributions.skip(limit * page);

    return contributions.find().then(contributions => {
      return Parse.Promise.as(contributions.map(c => c.view()));
    });
  }

  // beforeSave
  static beforeSave(request, response) {
    let contribution = request.object;

    if (!contribution.get('challenge')) return response.error('Empty challenge');

    if (!contribution.get('question') && !contribution.get('activity') && !contribution.get('resource')) {
      return response.error('Empty contribution');
    }

    contribution.schematize();

    response.success();
  }

  // afterSave
  static afterSave(request) {
    Parse.Cloud.useMasterKey();

    let contribution = request.object;
    let existed = contribution.createdAt.getTime() != contribution.updatedAt.getTime();

    if (!existed) {
      let user = contribution.get('user');
      let challenge = contribution.get('challenge');

      user.contributor().then(contributor => {
        contributor.increment('total');
        contributor.save();

        challenge.addUnique('contributors', contributor);
        challenge.save();
      });
    }
  }

  // cleanUp
  static cleanUp(attribute, value) {
    Parse.Cloud.useMasterKey();

    let contributions = new Parse.Query(this);
    let runAgain = false;

    contributions.equalTo(attribute, value);
    contributions.limit(1000);

    return contributions.find().then(contributions => {
      runAgain = contributions.length == 1000;

      if (attribute == 'user') {
        contributions.forEach(c => c.unset('user'));

        return Parse.Object.saveAll(contributions);
      } else {
        return Parse.Object.destroyAll(contributions);
      }
    }).then(() => {
      if (runAgain) {
        return this.cleanUp(attribute, value);
      } else {
        return Parse.Promise.as();
      }
    });
  }
}

Parse.Object.registerSubclass('Contribution', Contribution);

Parse.Cloud.beforeSave('Contribution', Contribution.beforeSave);
Parse.Cloud.afterSave('Contribution', Contribution.afterSave);

Parse.Cloud.define('listContributions', (request, response) => {
  Contribution.list(request.params).then(response.success, response.error);
});