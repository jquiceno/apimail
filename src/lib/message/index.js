'use strict'

const Db = require('../db')
const Boom = require('@hapi/boom')
const Tray = require('../tray')
const moment = require('moment')
const defaults = require('defaults')
const Joi = require('@hapi/joi')

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
      const messageData = await this.get(this.id)

      newData = defaults(newData, {
        state: messageData.state
      })

      await this.ref.update({
        state: newData.state
      })

      return this.get(this.id)
    } catch (error) {
      throw Boom.boomify(error)
    }
  }

  static async getAll (q = {}, params = {}) {
    try {
      let query = db
      const messages = []

      params = defaults(params, {
        limit: 20,
        order: 'desc'
      })

      if (q.tray) {
        query = query.where('tray', '==', q.tray)
      }

      query = await query.orderBy('created', params.order).limit(params.limit).get()

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

  static async add ({ ...data } = {}) {
    try {
      const ref = db.doc()

      if (data.replyTo) {
        const m = new Message(data.replyTo)
        const mData = await m.get()
        data.to = (mData.from.indexOf('<')) ? mData.from.slice(mData.from.indexOf('<') + 1, mData.from.indexOf('>')) : mData.from
      }

      const { error } = Joi.object().keys({
        from: Joi.string().required(),
        to: Joi.string().required(),
        content: Joi.string().required(),
        contentType: Joi.string(),
        replyTo: Joi.string(),
        data: Joi.object(),
        subject: Joi.string(),
        tray: Joi.string()
      }).validate(data)

      if (error) throw Boom.badRequest(error.message)

      data = defaults(data, {
        contentType: null,
        tray: null,
        replyTo: null,
        data: {}
      })

      let { tray } = data

      if (!data.tray) {
        const fromEmail = (data.from.indexOf('<')) ? data.from.slice(data.from.indexOf('<') + 1, data.from.indexOf('>')) : data.from
        const [trayData] = await Tray.getAllBy('email', fromEmail)
        tray = trayData ? trayData.id : await Tray.add(fromEmail)
      }

      const _data = {
        created: moment().unix(),
        contentType: data.contentType,
        content: data.content,
        to: data.to,
        from: data.from,
        subject: data.subject,
        state: 'saved',
        replyTo: data.replyTo,
        data: data.data,
        tray: tray.id || tray
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
