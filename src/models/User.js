export default class user extends Parse.User {
  constructor(attributes, options) {
    super('_User', attributes, options);
  }

  // schematize
  schematize() {
    this.get('name') || this.set('name', '');
    this.get('pictureUrl') || this.set('pictureUrl', '');
  }

  // view
  view() {
    let view = {};

    view.id = this.id;
    view.name = this.get('name');
    view.pictureUrl = this.get('pictureUrl');

    return view;
  }

  // beforeSave
  static beforeSave(request, response) {
    let user = request.object;

    user.schematize;

    response.success();
  }
}

Parse.Object.registerSubclass('_User', User);