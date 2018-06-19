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

  async getEvents () {
    try {
      const events = await Event.getAllBy('message', this.id)

      return Promise.resolve(events)
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message,
        },
        status_code: 404,
      })
    }
  }

  async getData () {
    let message

    try {
      const messageRef = this.db.doc(this.id)
      message = await messageRef.get()
      message = message.data()
      message.ID = messageRef.id
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

  static async send (data, domain = config.providers.mailgun.domain) {
    if(!data) {
      return Promise.reject({
        error: {
          message: 'Bad request, email data not found'
        },
        status_code: 403
      })
    }

    const db = Db.init(collection)
    const ref = await db.doc()

    let message

    try {
      await ref.set({
        state: 'sending'
      })

      const mgResponse = await Mailgun.send(data, domain)

      message = await Message.add(data, {
        provider: 'mailgun',
        id: mgResponse.id.substr(0, mgResponse.id.length - 1).substr(1)
      }, ref.id)
    } catch (e) {
      return Promise.reject({
        error: {
          message: e.message
        },
        status_code: e.statusCode
      })
    }

    return Promise.resolve({
      ID: message
    })
  }

  static async getAllBy (by, value) {
    const db = Db.init(collection)
    let messages = []

    try {
      let query = await db.where(by, '==', value).get()

      query.forEach(messageRef => {
        let messageData = messageRef.data()
        messageData.ID = messageRef.id
        messages.push(messageData)
      })
    } catch (e) {
      throw new Error('Error obteniendo los mensajes "getAllBy"')
    }

    return messages
  }

  static async add (data, service, id = null) {
    const db = Db.init(collection)
    const ref = await db.doc(id)
    const timestamp = data.timestamp || Date.now() / 1000
    const date = new Date(timestamp * 1000)
    let rMessage = null

    if(data['In-Reply-To']) {
      rMessage = await Message.getAllBy('service.id', data['In-Reply-To'].substr(0, data['In-Reply-To'].length - 1).substr(1))
      rMessage = rMessage[0].ID
    }

    const message = await ref.set({
      to: data.to || data['To'],
      from: data.from || data['From'],
      subject: data.subject || data['Subject'],
      state: data['X-Mailgun-Incoming'] ? 'received' : 'send',
      recipient: data['recipient'] || null,
      sender: data.sender || null,
      'user-agent': data['user-agent'] || data['User-Agent'] || null,
      'body-html': data['body-html'] || data.html || null,
      'body-plain': data['body-plain'] || null,
      'stripped-html': data['stripped-html'] || data.html || null,
      'stripped-text': data['stripped-text'] || null,
      'message-headers': data['message-headers'] || null,
      service,
      _date: {
        ut: timestamp,
        y: date.getFullYear(),
        m: date.getMonth() + 1,
        d: date.getDate()
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

  async info () {
    try {
      const messageData = await this.getData()
      const mg = new Mailgun(messageData.service.id, 'test.pimex.email')
      const info = await mg.info()
      return Promise.resolve(info)
    } catch (e) {
      return Promise.reject(e)
    }
  }
}

module.exports = Message
