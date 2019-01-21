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

  static async getAllBy (key, value) {
    try {
      let events = []

      const query = await db.orderByChild(key).equalTo(value).once('value')

      events = query.val()

      return Promise.resolve(Event.normalize(events))
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

      data = defaults(data, {
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

      const newEvent = await db.push(data)

      data.id = newEvent.key

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
}

module.exports = Event
