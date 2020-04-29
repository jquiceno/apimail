'use strict'

const event = require('../event')

class Callback {
  static add (calbackList) {
    try {
      calbackList.map(em => {
        event.on(em.event, em.f)
      })
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = Callback
