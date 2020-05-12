'use strict'

const Db = require('../db')
const Boom = require('@hapi/boom')
const Tray = require('../tray')
const moment = require('moment')
const defaults = require('defaults')

const db = Db.init('messages', {
  type: 'firestore'
})

class Message {
  constructor (id, clients = []) {
    this.id = id
    this.ref = db.doc(id)
    this.clients = clients
  }

  async update (newData) {
    try {
      await this.ref.update(newData)

      return this.get(this.id)
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  static async getAll (params = {}) {
    try {
      let query = db
      const messages = []

      if (params.tray) {
        query = query.where('tray', '==', params.tray)
      }

      query = await query.get()

      query.forEach(msgRef => {
        const msgData = msgRef.data()
        msgData.id = msgRef.id
        messages.push(msgData)
      })

      return messages
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  async remove () {
    try {
      const messaData = await this.get()
      const messageRef = db.doc(messaData.id)
      await messageRef.delete()

      return messaData
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  async get () {
    try {
      const messageRef = this.ref
      let message = await messageRef.get()
      message = message.data()

      if (!message) {
        throw Boom.badRequest('Message not found or invalid')
      }

      message.id = messageRef.id

      return Promise.resolve(message)
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  static async send (data) {
    try {
      data = defaults(data, {
        template: null,
        subject: null,
        vars: null
      })

      let message = {}

      const tray = new Tray(data.tray)
      const trayData = await tray.get()

      data.from = `${data.from} <${trayData.email}>`
      data.state = 'sending'

      delete data.template

      message = await Message.add(data)

      return message
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  static async add (data) {
    try {
      const ref = db.doc()
      const date = moment().unix()

      const _data = {
        created: date,
        contentType: data.contentType,
        content: data.content,
        to: data.to,
        from: data.from,
        subject: data.subject,
        state: 'saved',
        sender: data.sender,
        replyTo: data.replyTo,
        clients: false,
        data: data.data
      }

      await ref.set(_data)

      _data.id = ref.id

      return _data
    } catch (error) {
      throw Boom.boomify(error)
    }
  }
}

module.exports = Message
