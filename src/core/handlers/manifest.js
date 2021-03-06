'use strict'

const log = require('debug')('ipfs:registry-mirror:handlers:manifest')
const loadManifest = require('../utils/load-manifest')
const sanitiseName = require('../utils/sanitise-name')
const lol = require('../utils/error-message')

module.exports = (options, ipfs, app) => {
  return async (request, response, next) => {
    log(`Requested ${request.path}`)

    let moduleName = sanitiseName(request.path)

    log(`Loading manifest for ${moduleName}`)

    try {
      const manifest = await loadManifest(options, ipfs, moduleName)

      response.statusCode = 200
      response.setHeader('Content-type', 'application/json; charset=utf-8')
      response.send(JSON.stringify(manifest, null, request.query.format === undefined ? 0 : 2))
    } catch (error) {
      console.error(`💥 Could not load manifest for ${moduleName}`, error)

      if (error.message.includes('Not found')) {
        response.statusCode = 404
        response.send(lol(`💥 Could not load ${moduleName}, has it been published?`))

        return
      }

      // a 500 will cause the npm client to retry
      response.statusCode = 500
      response.send(lol(`💥 ${error.message}`))
    }
  }
}
