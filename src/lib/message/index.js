'use strict'

import Mailgun from '../mailgun'
// import Event from './event.js'
import Db from '../db'
// import config from 'getfig'
// import Template from './template'
import Boom from 'boom'
import Tray from '../tray'
import moment from 'moment'

const collection = 'messages'

const db = Db.init(collection, {
  type: 'firestore'
})

class Message {
  constructor (id) {
    this.id = id
    this.ref = db.doc(id)
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
      console.log(e)
      return Promise.reject(new Boom(e))
    }
  }

  static async send (data) {
    try {
      let message

      if (!data) {
        throw Boom.badRequest('Bad request, message data not found')
      }

      const tray = new Tray(data.tray)
      const trayData = await tray.get()

      data.from = `${data.from} <${trayData.email}>`
      data.state = 'sending'

      // if (data.template) {
      //   const template = new Template(data.template.ID)
      //   const renderVars = data.template.vars || null
      //   let templateData = await template.get(renderVars)
      //
      //   if (templateData) {
      //     data.html = templateData.content
      //   }
      //
      //   delete data.template
      // }

      const send = await Mailgun.send(data, {
        domain: trayData.domain
      })

      data.provider = {
        name: 'mailgun',
        id: send.id
      }

      message = await Message.add(data)

      return Promise.resolve(message)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async add (data) {
    try {
      const ref = db.doc()
      const date = moment().unix()
      let message = {}

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

      return Promise.resolve(data)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }
}

module.exports = Message
