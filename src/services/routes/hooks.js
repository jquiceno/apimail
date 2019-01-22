'use strict'

import Event from '../lib/event'
import Message from '../lib/message'
// import Utils from '../lib/utils'

const routes = [
  {
    method: 'POST',
    path: '/hooks/event',
    handler: async (request, h) => {
      const body = request.payload
      let emailEventId, res

      try {
        const emailEvent = await Email.event()
        emailEventId = await emailEvent.add(body)
        res = {
          data: {
            id: emailEventId
          },
          status_code: 201
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  },
  {
    method: 'POST',
    path: '/hooks/messages/inbounds',
    handler: async (request, h) => {
      const body = request.payload
      let res

      try {
        let message = await Message.add(body, {
          provider: 'mailgun',
          id: body['Message-Id'].substr(0, body['Message-Id'].length - 1).substr(1)
        })

        res = {
          data: {
            ID: message
          },
          status_code: 201
        }

        Event.emit('message.email.received', {
          message: {
            ID: message
          }
        })
      } catch (e) {
        console.log(e)
        res = {
          status_code: 403
        }
      }

      return h.response(res).code(res.status_code)
    }
  }
]

module.exports = routes
