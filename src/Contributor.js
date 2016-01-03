import Challenge from './Challenge';

export default class Contributor extends Parse.Object {
  constructor(attributes, options) {
    super('Contributor', attributes, options);
  }

  // schematize
  schematize() {
    // this.get('user')   || this.set('user', User);
    this.get('today')     || this.set('today', 0);
    this.get('thisWeek')  || this.set('thisWeek', 0);
    this.get('thisMonth') || this.set('thisMonth', 0);
    this.get('total')     || this.set('total', 0);

    this.setACL(new Parse.ACL({'*': {'read': true}}));
  }

  // view
  view() {
    let view = this.get('user').view();

    view.contributions = {};

    view.contributions.today = this.get('today');
    view.contributions.thisWeek = this.get('thisWeek');
    view.contributions.thisMonth = this.get('thisMonth');
    view.contributions.total = this.get('total');

    return view;
  }

  // list
  static list({
    order = 'descending',
    orderBy = 'total',
    limit = 24,
    page = 0
  } = {}) {
    let contributors = new Parse.Query(this);

    contributors.include('user');
    contributors[order](orderBy);
    contributors.limit(limit);
    contributors.skip(limit * page);

    return contributors.find().then(contributors => {
      return Parse.Promise.as(contributors.map(c => c.view()));
    });
  }

  // beforeSave
  static beforeSave(request, response) {
    let contributor = request.object;

    if (!contributor.get('user')) return response.error('Empty user');

    contributor.schematize();

    if (!contributor.isNew() && contributor.dirty('total')) {
      contributor.increment('today');
      contributor.increment('thisWeek');
      contributor.increment('thisMonth');
    }

    response.success();
  }

  // beforeDelete
  static beforeDelete(request, response) {
    Parse.Cloud.useMasterKey();

    let contributor = request.object;

    Challenge.cleanUp('contributors', contributor).always(response.success);
  }

  // update
  static update() {
    Parse.Cloud.useMasterKey();

    let moment = require('moment');
    let startOfDay = moment().startOf('day');
    let startOfWeek = moment().startOf('week');
    let startOfMonth = moment().startOf('month');

    let contributors = new Parse.Query(Contributor);
    let contributorsToSave = [];

    // get the last 1000 active contributors in this month
    contributors.greaterThanOrEqualTo('thisMonth', 1);
    contributors.descending('updatedAt');
    contributors.limit(1000);

    return contributors.find().then(contributors => {
      let promises = [];

      contributors.forEach((contributor, i) => {
        let contributions = new Parse.Query(Contribution);

        // get up to 1000 contributions of this user in this month
        contributions.equalTo('user', contributor.get('user'));
        contributions.greaterThanOrEqualTo('createdAt', startOfMonth.toDate());
        contributions.limit(1000);

        promises[i] = contributions.find().then(contributions => {
          let onThisMonth = contributions.length;
          let onThisWeek = contributions.filter(c => moment(c.createdAt).isAfter(startOfWeek)).length;
          let onToday = contributions.filter(c => moment(c.createdAt).isAfter(startOfDay)).length;

          if (onThisMonth != contributor.get('thisMonth')
           || onThisWeek  != contributor.get('thisWeek')
           || onToday     != contributor.get('today')) {
            contributor.set('today', onToday);
            contributor.set('thisWeek', onThisWeek);
            contributor.set('thisMonth', onThisMonth);
            contributorsToSave.push(contributor);
          }
        });
      });

      return Parse.Promise.when(promises);
    }).then(() => {
      return Parse.Object.saveAll(contributorsToSave);
    });
  }
}

Parse.Object.registerSubclass('Contributor', Contributor);

Parse.Cloud.beforeSave('Contributor', Contributor.beforeSave);
Parse.Cloud.beforeDelete('Contributor', Contributor.beforeDelete);

Parse.Cloud.define('listContributors', (request, response) => {
  Contributor.list(request.params).then(response.success, response.error);
});

Parse.Cloud.job('updateContributors', (request, status) => {
  Contributor.update().then(status.success, status.error);
});
