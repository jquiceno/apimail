import Mailgun from 'mailgun-js'
import request from 'request-promise'
import config from '../config'
import crypto from 'crypto'

const configModule = config.modules.messages

const apiKey = configModule.providers.mailgun.key
const domain = configModule.providers.mailgun.domain

class Mgun {
  constructor (id) {
    try {
      this.id = id
      this.mailgun = new Mailgun({
        apiKey,
        domain: domain
      })
      this.domain = domain
    } catch (e) {
      console.log(e)
      throw new Error('Hubo un error iniciando Mailgun')
    }
  }

  async events (params = {}) {
    params['message-id'] = this.id
    return new Promise((resolve, reject) => {
      this.mailgun.get(`/${this.domain}/events`, params, (error, body) => {
        if (error) {
          reject(error)
        }
        resolve(body)
      })
    })
  }

  async info () {
    try {
      const events = await this.events()

      return Promise.resolve(events)
    } catch (e) {
      console.log('Hubo un error en los eventos')
      return Promise.reject(e)
    }

    const url = events.items[0].storage.url

    return request({
      method: 'GET',
      uri: url,
      json: true,
      headers: {
        Authorization: Mgun.encodeApiKey(apiKey)
      }
    })
  }

  static send (data, domain = false) {
    domain = domain || this.domain
    const mailgun = new Mailgun({apiKey, domain})
    return mailgun.messages().send(data)
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
