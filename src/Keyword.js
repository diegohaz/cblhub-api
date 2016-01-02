import Challenge from './Challenge';

import _ from 'underscore';
import clean from 'underscore.string/clean';
import cleanDiacritics from 'underscore.string/cleanDiacritics';

export default class Keyword {
  // list
  static list() {
    let challenges = new Parse.Query(Challenge);

    challenges.include(['questions', 'activities', 'resources']);
    challenges.descending('updatedAt');
    challenges.limit(100);

    return challenges.find().then(challenges => {
      let keywords = [];

      challenges.forEach(c => {
        let guides = c.get('questions').concat(c.get('activities'), c.get('resources'));

        guides.forEach(g => {
          keywords = keywords.concat(g.get('keywords'));
        });

        keywords = keywords.concat(c.get('keywords'));
      });

      keywords = _.countBy(keywords, k => k)
      keywords = _.map(keywords, (count, k) => ({keyword: k, count: count}));
      keywords = _.sortBy(keywords, k => -k.count);

      return Parse.Promise.as(keywords);
    });
  }

  // extract
  static extract(text) {
    return Parse.Cloud.httpRequest({
      url: 'http://gateway-a.watsonplatform.net/calls/text/TextGetCombinedData',
      params: {
        apikey: '3bb4c8fa2aed759b8d7b41a5b04c08264da70fc7',
        text: text,
        extract: 'keyword,concept',
        outputMode: 'json'
      }
    }).then(response => {
      let data = response.data;

      if (data.status != 'OK') return Parse.Promise.error(data.statusInfo);

      let concepts = data.concepts.map(c => c.text.toLowerCase());
      let keywords = data.keywords.map(k => k.text.toLowerCase());

      keywords = concepts.concat(keywords);
      keywords = keywords.map(k => cleanDiacritics(k));

      return Parse.Promise.as(keywords);
    });
  }
}

Parse.Cloud.define('listKeywords', (request, response) => {
  Keyword.list().then(response.success, response.error);
});