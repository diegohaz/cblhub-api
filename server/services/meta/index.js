'use strict'

import MetaInspector from 'node-metainspector'
import Promise from 'bluebird'

export const getMeta = (url) => {
  return new Promise((resolve, reject) => {
    const client = new MetaInspector(url, { timeout: 10000 })

    client.on('fetch', function () {
      let meta = {
        url: client.url,
        title: client.ogTitle || client.title,
        description: client.ogDescription || client.description,
        image: client.image,
        media: client.ogType
      }
      resolve(meta)
    })

    client.on('error', reject)
    client.fetch()
  })
}
