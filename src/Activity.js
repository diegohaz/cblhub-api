import Guide from './Guide';

export default class Activity extends Guide {
  constructor(attributes, options) {
    super('Activity', attributes, options);

    this.single = 'activity';
    this.plural = 'activities';
    this.guides = ['questions', 'resources'];
  }
}

Parse.Object.registerSubclass('Activity', Activity);

Parse.Cloud.beforeSave('Activity', Activity.beforeSave);
Parse.Cloud.afterSave('Activity', Activity.afterSave);
Parse.Cloud.beforeDelete('Activity', Activity.beforeDelete);

Parse.Cloud.define('getActivity', (request, response) => {
  Activity.get(request.params.id).then(response.success, response.error);
});

Parse.Cloud.define('listActivities', (request, response) => {
  Activity.list(request.params).then(response.success, response.error);
});