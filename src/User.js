import Contributor from './Contributor';
import Contribution from './Contribution';
import Challenge from './Challenge';
import Question from './Question';
import Activity from './Activity';
import Resource from './Resource';

export default class User extends Parse.User {
  constructor(attributes, options) {
    super('_User', attributes, options);
  }

  // schematize
  schematize() {
    this.get('name')    || this.set('name', '');
    this.get('picture') || this.set('picture', '');
  }

  // view
  view() {
    if (!this.createdAt) return;

    let view = {};

    view.id = this.id;
    view.name = this.get('name');
    view.picture = this.get('picture');

    return view;
  }

  // contributor
  contributor() {
    let contributors = new Parse.Query(Contributor);

    contributors.equalTo('user', this);

    return contributors.first().then(contributor => {
      if (contributor) {
        return Parse.Promise.as(contributor);
      }

      return Parse.Promise.error();
    });
  }

  // beforeSave
  static beforeSave(request, response) {
    let user = request.object;

    user.schematize();

    response.success();
  }

  // afterSave
  static afterSave(request) {
    let user = request.object;
    let existed = user.createdAt.getTime() != user.updatedAt.getTime();

    if (!existed) {
      let contributor = new Contributor;

      contributor.set('user', user);
      contributor.save(null, {useMasterKey: true});
    }
  }

  // beforeDelete
  static beforeDelete(request, response) {
    Parse.Cloud.useMasterKey();

    let user = request.object;

    user.contributor()
      .then(c => c.destroy())
      .always(() => Contribution.cleanUp('user', user))
      .always(() => Challenge.cleanUp('user', user))
      .always(() => Question.cleanUp('user', user))
      .always(() => Activity.cleanUp('user', user))
      .always(() => Resource.cleanUp('user', user))
      .always(() => response.success());
  }
}

Parse.Object.registerSubclass('_User', User);

Parse.Cloud.beforeSave('_User', User.beforeSave);
Parse.Cloud.afterSave('_User', User.afterSave);
Parse.Cloud.beforeDelete('_User', User.beforeDelete);