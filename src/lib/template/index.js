import moment from 'moment'
import Db from '../db'
import Utils from '../utils'
import Boom from 'boom'

const collection = 'templates'
const db = Db.init(collection, 'fb')

class Template {
  constructor (id) {
    if (!id) {
      throw Boom.badRequest('Template id not found or invalid')
    }
    this.id = id
  }

  async update (data) {
    try {
      const date = moment()
      let newData = Template.validFormat(data)

      const tempRef = db.child(this.id)

      newData._updated = date.unix()

      await tempRef.update(newData)

      newData = await this.get()

      return Promise.resolve(newData)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static validFormat (template) {
    const schema = Template.schema()

    let newTemplate = {}

    Object.keys(schema).map((key, i) => {
      if (template[key]) {
        newTemplate[key] = template[key]
      }
    })

    return newTemplate
  }

  static schema () {
    return {
      content: true,
      type: true,
      format: true,
      board: true,
      title: true,
      tray: true,
      vars: true,
      subject: true
    }
  }

  static async getAll (params = false) {
    try {
      let templates = {}
      let templatesRef

      const db = Db.init(collection, 'fb')

      if (params.tray) {
        templatesRef = await db.orderByChild('board').equalTo(params.board).once('value')
      } else {
        templatesRef = await db.once('value')
      }

      templates = templatesRef.val()

      return Promise.resolve(Template.normalize(templates))
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async get (options = {}) {
    try {
      const tempRef = await db.child(this.id).once('value')
      let template = tempRef.val()

      if (!template) {
        throw Boom.badRequest('Template not found or invalid')
      }

      if (options.render) {
        let vars = template.vars || null
        vars = (typeof options.render === 'object') ? Object.assign(vars, options.render) : vars

        if (vars) {
          template.content = Utils.renderTemplate(template.content, vars)
        }
      }

      template.id = this.id

      return Promise.resolve(template)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  static async add (data) {
    try {
      const date = moment()
      const templateData = Template.validFormat(data)

      templateData._created = date.unix()
      templateData._updated = date.unix()

      const newTemplate = await db.push(templateData)

      data.id = newTemplate.key

      return Promise.resolve(data)
    } catch (e) {
      return Promise.reject(new Boom(e))
    }
  }

  async remove () {
    try {
      const templateData = await this.get()
      await db.child(this.id).remove()
      return Promise.resolve(templateData)
    } catch (e) {
      return Promise.reject(e)
    }
  }

  static normalize (data) {
    let normData = []

    for (let i in data) {
      data[i].ID = i
      normData.push(data[i])
    }

    return normData.reverse()
  }
}

module.exports = Template
