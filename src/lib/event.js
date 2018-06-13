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

  static async add (data) {
    const Message = require('./message')
    const db = Db.init(collection)
    const timestamp = data.timestamp || Date.now() / 1000
    const date = new Date(timestamp * 1000)
    let ref = await db.doc()
    let message = null

    try {
      await Mailgun.validEvent(data)
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
      if (!data.message) {
        if (data['Message-Id'] && typeof data['message-id'] === 'undefined') {
          data['message-id'] = data['Message-Id']
        }

        if (data['message-id'].substr(0, 1) === '<') {
          data['message-id'] = data['message-id'].substr(0, data['message-id'].length - 1).substr(1)
        }

        message = await Message.getAllBy('service.id', data['message-id'])
        if (message.length <= 0) {
          throw new Error('The event does not belong to a valid message')
        }

        data.message = message[0].id
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
      const event = await ref.set({
        message: data.message,
        event: data.event,
        city: data.city || null,
        recipient: data.recipient || null,
        region: data.region || null,
        ip: data.ip || null,
        domain: data.domain || null,
        'device-type': data['device-type'] || null,
        country: data.country || null,
        'client-type': data['client-type'] || null,
        'client-os': data['client-os'] || null,
        'client-name': data['client-name'] || null,
        'user-agent': data['user-agent'] || data['User-Agent'] || null,
        _date: {
          t: timestamp,
          y: date.getFullYear(),
          m: date.getMonth() + 1,
          d: date.getDate()
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
