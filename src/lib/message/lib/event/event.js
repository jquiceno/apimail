'use strict'

import Db from '../../../db'
import Boom from 'boom'
import moment from 'moment'
import defaults from 'defaults'
import { Schema } from 'schemio'
import schemaTemplate from './schema'

const collection = 'events'
const db = Db.init(collection)

class Event {
  constructor (eventId) {
    this.id = eventId
  }

  static async getAllBy (key, value, q = false) {
    try {
      let events = []

      const query = await db.orderByChild(key).equalTo(value).once('value')

      events = query.val()
      events = Event.normalize(events)

      if (q) {
        if (q.provider.id) {
          events = events.filter(e => {
            return e.provider.id === q.provider.id
          })
        }
      }

      return Promise.resolve(events)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async get () {
    try {
      const eventRef = await db.child(this.id).once('value')
      const event = eventRef.val()
      event.id = eventRef.key

      return Promise.resolve(event)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async add (data) {
    try {
      const timestamp = moment().unix()
      let q = []

      data = defaults(data, {
        recipient: defaults(data.device, {
          domain: null,
          value: null
        }),
        provider: defaults(data.device, {
          id: null,
          name: null
        }),
        device: defaults(data.device, {
          type: null
        }),
        client: defaults(data.client, {
          type: null,
          os: null,
          name: null
        })
      })

      data._created = timestamp

      data = Schema.validate(data, schemaTemplate)

      if (data.provider.id) {
        q = await Event.getAllBy('message', data.message, {
          provider: {
            id: data.provider.id
          }
        })
      }

      if (q.length < 1) {
        const newEvent = await db.push(data)
        data.id = newEvent.key
      } else {
        data = q[0]
      }

      return Promise.resolve(data)
    } catch (e) {
      console.log(e)
      return Promise.reject(new Boom(e))
    }
  }

  async remove () {
    try {
      const eventData = await this.get()
      await db.child(this.id).remove()

      return Promise.resolve(eventData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static normalize (data) {
    let normData = []

    for (let i in data) {
      data[i].id = i
      normData.push(data[i])
    }

    return normData.reverse()
  }

  static format (provider, data) {
    try {
      let newData = {}
      if (!provider) {
        throw Boom.badRequest('Provider name es required')
      }

      if (provider === 'mailgun') {
        newData = {
          message: data.message,
          provider: {
            id: data.id || null,
            name: provider
          },
          recipient: {
            domain: data['recipient-domain'] || null,
            value: data.recipient || null
          },
          event: data.event
        }
      }

      return newData
    } catch (e) {
      return new Boom(e)
    }
  }
}

module.exports = Event
