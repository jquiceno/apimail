'use strict'

import Db from './db.js'
import Mailgun from './mailgun.js'

const collection = 'events'

class Event {
  constructor (eventId) {
    this.id = eventId
    this.db = Db.init(collection)
  }

  async getData () {
    let event

    try {
      const eventRef = this.db.doc(this.id)
      event = await eventRef.get()
      event = event.data()
      event.id = eventRef.id
    } catch (e) {
      return Promise.reject({
        error: {
          message: 'There was an error getting the required event',
          provider: e.message
        },
        status_code: 500,
      })
    }

    return Promise.resolve(event)
  }

  static async add (event) {
    const Message = require('./message')
    const db = Db.init(collection)
    const today = new Date()
    let ref = await db.doc()
    let message = null

    try {
      await Mailgun.validEvent(event)
    } catch (e) {
      return Promise.reject(e)
    }

    // if (event.event === 'delivered') {
    //   if (typeof event['message-headers'] === 'string') {
    //     event['message-headers'] = JSON.parse(event['message-headers'])
    //   }
    //
    //   pimexMessageId = event['message-headers'].filter((e, i) => {
    //     return e[0] === 'Pimex-Email-Id'
    //   })
    //
    //   pimexMessageId = pimexMessageId[0][1]
    // } else {
    //
    // }

    try {
      if (!event.message) {
        if (event['Message-Id'] && typeof event['message-id'] === 'undefined') {
          event['message-id'] = event['Message-Id']
        }

        if (event['message-id'].substr(0, 1) === '<') {
          event['message-id'] = event['message-id'].substr(0, event['message-id'].length - 1).substr(1)
        }

        message = await Message.getAllBy('service.id', event['message-id'])
        if (message.length <= 0) {
          throw new Error('The event does not belong to a valid message')
        }

        event.message = message[0].id
      }
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message,
        },
        status_code: 404
      })
    }

    try {
      let ev = {}
      Object.keys(event).forEach((e, i) => {
        if (event[e]) {
          ev[e] = event[e]
        }
      })

      await ref.set({
        message: event.message,
        event: event.event,
        data: ev,
        date: {
          t: Date.now() / 1000,
          y: (new Date()).getFullYear(),
          m: today.getMonth() + 1,
          d: today.getDate()
        }
      })

      return Promise.resolve(ref.id)
    } catch (e) {
      return Promise.reject({
        error: {
          message: 'Error almacenando el evento enviado'
        },
        status_code: 500
      })
    }
  }
}

module.exports = Event
