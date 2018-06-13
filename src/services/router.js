import Email from '../lib/email.js'
import Message from '../lib/message.js'

function routes (server) {
  server.route({
    method: 'GET',
    path: '/{id}',
    handler: async (req, h) => {
      const messageId = req.params.id
      // const body = request.payload
      // body.message = messageId
      let res

      try {
        const message = new Message(messageId)
        // const email = await Email.send(body)
        res = {
          data: await message.getData(),
          status_code: 201
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'POST',
    path: '/',
    handler: async (request, h) => {
      const body = request.payload
      let res

      try {
        const email = await Email.send(body)
        res = {
          data: email,
          status_code: 201
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
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
  })

  server.route({
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
            id: message
          },
          status_code: 201
        }
      } catch (e) {
        console.log(e)
        res = {
          status_code: 403
        }
      }

      return h.response(res).code(res.status_code)
    }
  })

  return server
}

module.exports = routes
