'use strict'

const Message = require('../lib/message')

const routes = [
  {
    method: 'GET',
    path: '/messages/{id}/preview',
    handler: async (req, h) => {
      const messageId = req.params.id

      try {
        const message = new Message(messageId)
        const messageData = await message.get()

        return h.response(messageData['stripped-html']).type('text/html; charset=utf-8').code(200)
      } catch (e) {
        let res = e.output.payload
        return h.response(res).code(res.statusCode)
      }
    }
  },

  /**
   *  Get - messages.id.events
   *  Get message events data by message id
   */

  {
    method: 'GET',
    path: '/messages/{id}/events',
    handler: async (req, h) => {
      const messageId = req.params.id
      let res

      try {
        const message = new Message(messageId)
        let events = await message.event.getAll()

        if (events.length < 1) {
          events = await message.event.asyncProvider()
        }

        res = {
          data: events,
          count: events.length,
          statusCode: 200
        }
      } catch (e) {
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },

  /**
   *  Get - messages.id
   *  Get message data by id
   */
  {
    method: 'GET',
    path: '/messages/{id}',
    handler: async (req, h) => {
      const messageId = req.params.id
      let res

      try {
        const message = new Message(messageId)
        const messageData = await message.get()

        res = {
          data: messageData,
          statusCode: 200
        }
      } catch (e) {
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  },

  /**
   *  Post - messages
   *  Send new Email message
   */
  {
    method: 'POST',
    path: '/messages',
    handler: async (request, h) => {
      const body = request.payload
      let res = {}

      try {
        const message = await Message.send(body)

        res = {
          data: message,
          statusCode: 201
        }
      } catch (e) {
        res = e.output.payload
      }

      return h.response(res).code(res.statusCode)
    }
  }
]

module.exports = routes
