import Guide from './Guide';

export default class Resource extends Guide {
  constructor(attributes, options) {
    super('Resource', attributes, options);

    this.single = 'resource';
    this.plural = 'resources';
  }
}

Parse.Object.registerSubclass('Resource', Resource);

Parse.Cloud.beforeSave('Resource', Resource.beforeSave);
Parse.Cloud.afterSave('Resource', Resource.afterSave);
Parse.Cloud.beforeDelete('Resource', Resource.beforeDelete);

Parse.Cloud.define('getResource', (request, response) => {
  Resource.get(request.params.id).then(response.success, response.error);
});

Parse.Cloud.define('listResources', (request, response) => {
  Resource.list(request.params).then(response.success, response.error);
});