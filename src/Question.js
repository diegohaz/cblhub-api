import Guide from './Guide';

export default class Question extends Guide {
  constructor(attributes, options) {
    super('Question', attributes, options);

    this.single = 'question';
    this.plural = 'questions';
  }
}

Parse.Object.registerSubclass('Question', Question);

Parse.Cloud.beforeSave('Question', Question.beforeSave);
Parse.Cloud.afterSave('Question', Question.afterSave);
Parse.Cloud.beforeDelete('Question', Question.beforeDelete);

Parse.Cloud.define('getQuestion', (request, response) => {
  Question.get(request.params.id).then(response.success, response.error);
});

Parse.Cloud.define('listQuestions', (request, response) => {
  Question.list(request.params).then(response.success, response.error);
});