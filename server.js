'use strict'

const Hapi = require('@hapi/hapi')
const routes = require('./src/routes')
const debug = require('debug')('server:info')

const { PORT = 3000 } = process.env

const server = new Hapi.Server({
  port: PORT,
  router: {
    stripTrailingSlash: true
  }
})

server.route(routes)

if (module === require.main) {
  (async () => {
    await server.start()
    debug(`Server start in port: ${PORT || server.info.port}`)
  })()
}

module.exports = server
