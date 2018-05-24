'use strict'

import Hapi from 'hapi'
import router from './router'

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
    server = router(server)

    await server.start()
    console.log(`Email server start in port: ${port || server.info.port}`)

    return Promise.resolve(server.info)

    // return new Promise((resolve, reject) => {
    //   server.start(err => {
    //     if (err) {
    //       reject(err)
    //     }
    //     console.log(`Email server start in port: ${port || server.info.port}`)
    //     resolve(server.info)
    //   })
    // })
  }
}
