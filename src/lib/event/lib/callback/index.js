'use strict'

import event from '../event'

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
