import Event from '../lib/event'
import Email from '../lib/email.js'
import Message from '../lib/message.js'
import Template from '../lib/template'
// import Utils from '../lib/utils'

function routes (server) {
  server.route({
    method: 'GET',
    path: '/templates/{id}/preview',
    handler: async (req, h) => {
      const templateId = req.params.id

      try {
        const template = new Template(templateId)
        const templateData = await template.get()

        console.log(templateData)

        return h.response(templateData.content).type('text/html; charset=utf-8').code(200)
      } catch (e) {
        console.log(e)
        return h.response(e).code(e.status_code)
      }
    }
  })

  server.route({
    method: 'PUT',
    path: '/templates/{id}',
    handler: async (req, h) => {
      const templateId = req.params.id
      const body = req.payload
      let res

      try {
        console.log(body)
        const template = new Template(templateId)
        const templateData = await template.update(body)

        console.log(templateData)

        res = {
          data: templateData,
          status_code: 200
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
    path: '/templates/{id}/render',
    handler: async (req, h) => {
      const templateId = req.params.id
      const body = req.payload
      let res

      try {
        const template = new Template(templateId)
        const templateData = await template.get(body)

        res = {
          data: templateData,
          status_code: 200
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'GET',
    path: '/templates',
    handler: async (req, h) => {
      const params = req.query
      const boardId = parseInt(params.board) || null

      let res

      try {
        const templates = await Template.getAll({
          board: boardId
        })

        res = {
          data: templates,
          status_code: 200
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'DELETE',
    path: '/templates/{id}',
    handler: async (req, h) => {
      const templateId = req.params.id
      let res

      try {
        const template = new Template(templateId)
        const templateData = await template.remove()

        res = {
          data: templateData,
          status_code: 200
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
    path: '/templates',
    handler: async (req, h) => {
      const body = req.payload
      let res

      try {
        const template = await Template.add(body)

        res = {
          data: template,
          status_code: 200
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'GET',
    path: '/templates/{id}',
    handler: async (req, h) => {
      const templateId = req.params.id

      let res

      try {
        const template = new Template(templateId)
        const templateData = await template.get()

        res = {
          data: templateData,
          status_code: 200
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'GET',
    path: '/{id}/preview',
    handler: async (req, h) => {
      const messageId = req.params.id

      try {
        const message = new Message(messageId)
        const messageData = await message.getData()

        return h.response(messageData['stripped-html']).type('text/html; charset=utf-8').code(200)
      } catch (e) {
        console.log(e)
        return h.response(e).code(e.status_code)
      }
    }
  })

  server.route({
    method: 'GET',
    path: '/{id}/events',
    handler: async (req, h) => {
      const messageId = req.params.id
      let res

      try {
        const message = new Message(messageId)
        const events = await message.getEvents()
        res = {
          data: events,
          count: events.length,
          status_code: 200
        }
      } catch (e) {
        console.log(e)
        res = e
      }

      return h.response(res).code(res.status_code)
    }
  })

  server.route({
    method: 'GET',
    path: '/{id}',
    handler: async (req, h) => {
      const messageId = req.params.id
      let res

      try {
        const message = new Message(messageId)
        const messageData = await message.getData()
        res = {
          data: await message.getData(),
          status_code: 201
        }

        Event.emit('message.get', messageData)
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
  })

  return server
}

module.exports = routes
