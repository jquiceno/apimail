'use strict'

import Mailgun from './mailgun.js'
import Event from './event.js'
import Db from './db.js'
import config from '../config'

const collection = 'messages'

class Message {
  constructor (id) {
    this.id = id
    this.db = Db.init(collection)
  }

  async getData () {
    let message

    try {
      const messageRef = this.db.doc(this.id)
      message = await messageRef.get()
      message = message.data()
      message.id = messageRef.id
    } catch (e) {
      return Promise.reject({
        error: {
          message: 'There was an error getting the required message',
          provider: e.message
        },
        status_code: 404,
      })
    }

    return Promise.resolve(message)
  }

  static async send (data, domain = config.domain) {
    if(!data) {
      return Promise.reject({
        error: {
          message: 'Bad request, email data not found'
        },
        status_code: 403
      })
    }

    let message

    try {
      const mgResponse = await Mailgun.send(data, domain)

      message = await Message.add(data, {
        provider: 'mailgun',
        id: mgResponse.id.substr(0, mgResponse.id.length - 1).substr(1)
      })
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message
        },
        status_code: e.statusCode
      })
    }

    return Promise.resolve({
      id: message
    })
  }

  static async getAllBy (by, value) {
    const db = Db.init(collection)
    let messages = []

    try {
      let query = await db.where(by, '==', value).get()

      query.forEach(messageRef => {
        let messageData = messageRef.data()
        messageData.id = messageRef.id
        messages.push(messageData)
      })
    } catch (e) {
      throw new Error('Error obteniendo los mensajes "getAllBy"')
    }

    return messages
  }

  static async add (data, service) {
    const db = Db.init(collection)
    const ref = await db.doc()
    let rMessage = null

    data.to = data.to || data['To']

    if(data['In-Reply-To']) {
      rMessage = await Message.getAllBy('service.id', data['In-Reply-To'].substr(0, data['In-Reply-To'].length - 1).substr(1))
      rMessage = rMessage[0].id
    }

    let me = {}
    Object.keys(data).forEach((e, i) => {
      if (data[e]) {
        me[e] = data[e]
      }
    })

    const today = new Date()
    const message = await ref.set({
      state: data['X-Mailgun-Incoming'] ? 'received' : 'send',
      data: me,
      service,
      date: {
        t: Date.now() / 1000,
        y: (new Date()).getFullYear(),
        m: today.getMonth() + 1,
        d: today.getDate()
      },
      replyTo: rMessage
    })

    return Promise.resolve(ref.id)
  }

  addEvent (event) {
    event.message = this.id
    return Event.add(event)
  }

  async event (eventId) {
    const event = new Event(eventId)
    const eventData = await event.getData()

    if (eventData.message !== this.id ) {
      return Promise.reject({
        error: {
          message: 'El evento no pertenece al mensaje'
        }
      })
    }

    return eventData
  }
}

module.exports = Message
