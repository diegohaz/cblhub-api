import MetaInspector from 'node-metainspector'
import Promise from 'bluebird'

export const getMeta = (url) =>
  new Promise((resolve, reject) => {
    const client = new MetaInspector(url, { timeout: 10000 })

    client.on('fetch', () => {
      const meta = {
        url: client.url,
        title: client.ogTitle || client.title,
        description: client.ogDescription || client.description,
        image: client.image,
        mediaType: client.ogType
      }
      resolve(meta)
    })

    client.on('error', reject)
    client.fetch()
  })
