'use strict'

const EventEmitter = require('events')

const emitter = new EventEmitter()

class PmxEvent {
  static emit (event, params, socket = false) {
    return emitter.emit(event, params)
  }

  static on (event, callback) {
    return emitter.on(event, callback)
  }
}

module.exports = PmxEvent
