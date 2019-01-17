'use strict'

import Db from './db'
import Mailgun from './mailgun.js'
import Boom from 'boom'
import Message from '../message'
import moment from 'moment'

const collection = 'events'
const db = Db.init(collection)

class Event {
  constructor (eventId) {
    this.id = eventId
  }

  static async getAllBy (key, value) {
    try {
      const ref = db
      let events = []

      const query = await ref.where(key, '==', value).orderBy('_created', 'desc').get()

      query.forEach(leadRef => {
        let eventData = leadRef.data()
        eventData.ID = leadRef.id
        events.push(eventData)
      })

      return Promise.resolve(events)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async get () {
    let event

    try {
      const eventRef = db.doc(this.id)
      event = await eventRef.get()
      event = event.data()
      event.id = eventRef.id
    } catch (e) {
      return Promise.reject(new Boom(e))
    }

    return Promise.resolve(event)
  }

  static async add (data) {
    const timestamp = moment().unix()
    let ref = db.doc()
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

        message = await Message.getAllBy('provider.id', data['message-id'])
        if (message.length <= 0) {
          throw new Error('The event does not belong to a valid message')
        }

        data.message = message[0].ID
      }

      await ref.set({
        message: data.message,
        event: data.event,
        city: data.city || null,
        recipient: data.recipient || null,
        region: data.region || null,
        ip: data.ip || null,
        domain: data.domain || null,
        device: {
          type: data['device-type'] || null
        },
        country: data.country || null,
        client: {
          type: data['client-type'] || null,
          os: data['client-os'] || null,
          name: data['client-name'] || null
        },
        'user-agent': data['user-agent'] || data['User-Agent'] || null,
        _created: timestamp
      })

      return Promise.resolve(ref.id)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Event
