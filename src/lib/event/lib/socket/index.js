'use strict'

import Http from 'http'
import io from 'socket.io'
import config from '../../../config'

const configApp = config.modules.events
const origins = configApp.sockets.origins

const server = Http.createServer()
const sckt = io(server)

const portDefault = process.env.PORT || 4007

sckt.origins((origin, cb) => {
  if (origins.indexOf(origin) > -1) {
    return cb(null, true)
  }

  return cb('origin not allowed', false)
})

module.exports = {
  start (portCustom) {
    const port = (portCustom === 'test') ? null : portCustom || portDefault
    server.listen(port)
  },
  emit: (event, data) => {
    return sckt.sockets.emit(event, data)
  },
  on: (event, cb) => {
    return sckt.on(event, cb)
  }
}
