'use strict'

import Mailgun from '../mailgun'
// import Event from './event.js'
import Db from '../db'
// import config from 'getfig'
import Template from '../template'
import Boom from 'boom'
import Tray from '../tray'
import moment from 'moment'
import defaults from 'defaults'
import Utils from '../utils'
import { Emitter } from '../event'

const collection = 'messages'

const db = Db.init(collection, {
  type: 'firestore'
})

class Message {
  constructor (id) {
    this.id = id
    this.ref = db.doc(id)
  }

  async update (newData) {
    try {
      const messageRef = this.ref
      await messageRef.update(newData)
      const messageData = await this.get(this.id)

      return Promise.resolve(messageData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async asyncProvider () {
    try {
      let messageData = await this.get()
      const mg = new Mailgun(messageData.provider.id)
      const msgPvdEvents = await mg.events()

      let correntState = messageData.state

      if (msgPvdEvents.length > 0) {
        let state = msgPvdEvents.filter(e => {
          return e.event === 'delivered' || e.event === 'failed'
        })

        state = state[0].event

        if (correntState !== state) {
          const msgPvdInfo = await mg.info()

          const newData = {
            state,
            sender: msgPvdInfo.sender,
            recipients: msgPvdInfo.recipients,
            attachments: msgPvdInfo.attachments,
            html: msgPvdInfo['body-html'],
            'content-type': msgPvdInfo['Content-Type'],
            'body-plain': msgPvdInfo['body-plain'],
            'body-html': msgPvdInfo['body-html']
          }

          await this.update(newData)
        }
      }

      messageData = await this.get()

      return Promise.resolve(messageData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async getAll (params = {}) {
    try {
      let query = db
      let messages = []
      if (params.tray) {
        query = query.where('tray', '==', params.tray)
      }

      query = await query.get()

      query.forEach(msgRef => {
        const msgData = msgRef.data()
        msgData.id = msgRef.id
        messages.push(msgData)
      })

      return Promise.resolve(messages)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async remove () {
    try {
      const messaData = await this.get()
      const messageRef = db.doc(messaData.id)
      await messageRef.delete()

      return Promise.resolve(messaData)
    } catch (e) {
      return Promise.reject(new Boom(e))
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
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async send (data) {
    try {
      data = defaults(data, {
        template: null,
        subject: null,
        vars: null
      })

      let message

      const tray = new Tray(data.tray)
      const trayData = await tray.get()

      data.from = `${data.from} <${trayData.email}>`
      data.state = 'sending'

      if (data.template) {
        const template = new Template(data.template.id)
        const renderVars = data.template.vars || data.vars || null
        let templateData = await template.get(renderVars)

        if (templateData) {
          if (templateData.format === 'html') {
            data.html = templateData.content
          } else {
            data.text = templateData.content
          }
        }

        if (templateData.subject) {
          data.subject = templateData.subject
        }
      } else {
        if (data.vars) {
          if (data.html) {
            data.html = Utils.renderTemplate(data.html, data.vars)
          }

          if (data.text) {
            data.text = Utils.renderTemplate(data.text, data.vars)
          }
        }
      }

      delete data.template

      const send = await Mailgun.send(data, {
        domain: trayData.domain
      })

      data.provider = {
        name: 'mailgun',
        id: send.id
      }

      Emitter.emit('message.send', data)

      message = await Message.add(data)

      return Promise.resolve(message)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async add (data) {
    try {
      const ref = db.doc()
      let message = {}

      data._created = moment().unix()

      // if (data['In-Reply-To']) {
      //   message = await Message.getAllBy('service.id', data['In-Reply-To'].substr(0, data['In-Reply-To'].length - 1).substr(1))
      //   message = message[0].ID
      // }

      // const mg = new Mailgun(data.provider.id)
      // const mData = await mg.info()

      await ref.set(data)

      // await ref.set({
      //   to: data.to || data['To'],
      //   from: data.from || data['From'],
      //   subject: data.subject || data['Subject'],
      //   state: data['X-Mailgun-Incoming'] ? 'received' : 'send',
      //   recipient: data['recipient'] || null,
      //   sender: data.sender || null,
      //   'user-agent': data['user-agent'] || data['User-Agent'] || null,
      //   'body-html': data['body-html'] || data.html || null,
      //   'body-plain': data['body-plain'] || null,
      //   'stripped-html': data['stripped-html'] || data.html || null,
      //   'stripped-text': data['stripped-text'] || null,
      //   'message-headers': data['message-headers'] || null,
      //   provider: data.provider,
      //   _created: date,
      //   replyTo: null
      // })

      data.id = ref.id

      Emitter.emit('message.created', data)

      return Promise.resolve(data)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Message
