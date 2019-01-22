'use strict'

import Hapi from 'hapi'
import routes from './routes'

const portDefault = process.env.PORT || 4008

module.exports = {
  async start (portCustom, host) {
    const port = (portCustom === 'test') ? null : portCustom || portDefault
    host = host || 'localhost'
    let server = new Hapi.Server({
      host,
      port,
      router: {
        stripTrailingSlash: true
      }
    })

    server.route(routes)

    await server.start()
    server.log('info', `Email server start in port: ${port || server.info.port}`)

    return Promise.resolve(server.info)
  }
}
