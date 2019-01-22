'use strict'

import EventEmitter from 'events'
// import Socket from '../socket'

const emitter = new EventEmitter()

class PmxEvent {
  static emit (event, params, socket = false) {
    // if (socket) {
    //   Socket.emit(event, params)
    // }
    return emitter.emit(event, params)
  }

  static on (event, callback) {
    return emitter.on(event, callback)
  }
}

module.exports = PmxEvent
