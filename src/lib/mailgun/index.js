import Mailgun from 'mailgun-js'
import request from 'request-promise'
import Config from 'getfig'
import crypto from 'crypto'
import Boom from 'boom'

const provider = Config.get('providers.mailgun')
const apiKey = provider.key
const apiUrl = provider.api.url
let domain = provider.domain

class Mgun {
  constructor (id, params = false) {
    try {
      this.id = id
      domain = params.domain || domain
      this.mailgun = new Mailgun({
        apiKey: params.apiKey || apiKey,
        domain: params.domain || domain
      })

      this.domain = domain
    } catch (e) {
      throw new Boom('There was an error initiating Mailgun')
    }
  }

  async events (params = {}) {
    try {
      const filter = params.filter || {}

      let events = await request({
        method: 'GET',
        url: `${apiUrl}/${this.domain}/events`,
        qs: {
          'message-id': `${this.id}`,
          event: filter.event || null
        },
        headers: {
          Authorization: Mgun.encodeApiKey(apiKey)
        },
        json: true
      })

      events = events.items

      return Promise.resolve(events)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async info () {
    try {
      let messaData = null
      const events = await this.events({
        filter: {
          event: 'accepted'
        }
      })

      if (events.length >= 1) {
        const url = events[0].storage.url

        messaData = request({
          method: 'GET',
          uri: url,
          json: true,
          headers: {
            Authorization: Mgun.encodeApiKey(apiKey)
          }
        })
      }

      return Promise.resolve(messaData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async send (data, params = {}) {
    try {
      params.apiKey = params.apiKey || apiKey
      params.domain = params.domain || domain

      const mailgun = new Mailgun(params)

      const message = await mailgun.messages().send(data)

      message.id = message.id.substr(0, message.id.length - 1).substr(1)

      return Promise.resolve(message)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static validEvent (event) {
    if (!event.timestamp || !event.token || !event.signature) {
      return Promise.reject({
        error: {
          message: 'Los campos timestamp, token y signature son necesarios para validar el evento en mailgun'
        },
        status_code: 403
      })
    }

    const hmac = crypto.createHmac('sha256', apiKey)
    hmac.update(`${event.timestamp}${event.token}`)

    if (hmac.digest('hex') !== event.signature) {
      return Promise.reject({
        error: {
          message: 'El evento no es valido o no proviene de mailgun'
        },
        status_code: 403
      })
    }

    return Promise.resolve(true)
  }

  static encodeApiKey (key) {
    key = Buffer.from(`api:${key}`).toString('base64')
    return `Basic ${key}`
  }
}

module.exports = Mgun
