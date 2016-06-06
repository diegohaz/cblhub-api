'use strict'

import path from 'path'
import _ from 'lodash'

/* istanbul ignore next */
const requireProcessEnv = (name) => {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable')
  }
  return process.env[name]
}

const config = {
  all: {
    env: process.env.NODE_ENV || 'development',
    root: path.join(__dirname, '../../..'),
    port: process.env.PORT || 9000,
    ip: process.env.IP || '0.0.0.0',
    watsonKey: requireProcessEnv('WATSON_KEY'),
    flickrKey: requireProcessEnv('FLICKR_KEY'),
    mongo: {
      options: {
        db: {
          safe: true
        }
      }
    }
  },
  test: {
    mongo: {
      uri: 'mongodb://localhost/cblhub-api-test'
    }
  },
  development: {
    mongo: {
      uri: 'mongodb://localhost/cblhub-api-dev'
    }
  },
  production: {
    ip: process.env.IP || undefined,
    port: process.env.PORT || 8080,
    mongo: {
      uri: process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/cblhub-api'
    }
  }
}

export default _.merge(config.all, config[config.all.env])
