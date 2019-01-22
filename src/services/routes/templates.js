'use strict'

import Template from '../lib/template'

const routes = [
  {
    method: 'GET',
    path: '/templates/{id}/preview',
    handler: async (req, h) => {
      const templateId = req.params.id

      try {
        const template = new Template(templateId)
        const templateData = await template.get()

        return h.response(templateData.content).type('text/html; charset=utf-8').code(200)
      } catch (e) {
        console.log(e)
        return h.response(e).code(e.status_code)
      }
    }
  },
  {
    method: 'PUT',
    path: '/templates/{id}',
    handler: async (req, h) => {
      const templateId = req.params.id
      const body = req.payload
      let res

      try {
        const template = new Template(templateId)
        const templateData = await template.update(body)

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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
    method: 'POST',
    path: '/templates',
    handler: async (req, h) => {
      const body = req.payload
      let res

      try {
        if (!body.board) {
          let e = {
            error: {
              message: 'Board Id not found or invalid'
            },
            status_code: 403
          }

          throw e
        }

        body.board = parseInt(body.board)

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
  },
  {
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
  }
]

module.exports = routes
