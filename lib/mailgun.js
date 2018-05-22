'use strict'

import Mailgun from 'mailgun-js'
import request from 'request-promise'
import {email as config} from '../config'
import crypto from 'crypto'

const apiKey = config.providers.mailgun.key

class Mgun {
  constructor (domain) {
    this.mailgun = new Mailgun({apiKey, domain})
  }

  async events (params = {}) {
    params['message-id'] = this.id
    return new Promise((resolve, reject) => {
      this.mailgun.get(`/${this.domain}/events`, params, function (error, body) {
        if (error) {
          reject(error)
        }
        resolve(body)
      })
    })
  }

  async info () {
    const events = await this.events({
      event: 'accepted'
    })

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

  static send (data, domain) {
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
